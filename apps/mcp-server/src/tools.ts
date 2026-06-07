import {
  type Actor,
  type AtlasEdge,
  type AtlasNode,
  type Capability,
  type McpAction,
  type ToolName,
  toolSchemas
} from "@signal-foundry/shared";
import { addActivity, makeId, nowIso } from "./audit";
import { authorize, isWriteAction } from "./auth";
import { scoreRisk } from "./risk";
import type { RegistryStore } from "./store";

export const toolNames = Object.keys(toolSchemas) as ToolName[];

type ToolResult = { status: number; body: Record<string, unknown> };

export function executeTool(store: RegistryStore, action: ToolName, rawInput: unknown, actor: Actor | undefined): ToolResult {
  const correlationId = getCorrelationId(rawInput);
  const auth = authorize(action, actor);
  if (!auth.ok) {
    return failure(auth.status, auth.message, correlationId);
  }
  if (isWriteAction(action) && !isConfirmed(rawInput)) {
    return failure(400, "Explicit confirmation required before mutation.", correlationId);
  }
  const parsed = toolSchemas[action].safeParse(rawInput);
  if (!parsed.success) {
    return failure(400, "Invalid tool input.", correlationId);
  }
  const data = parsed.data as any;

  const registry = store.read();
  const activeActor = actor ?? registry.actors[0];
  if (!activeActor) {
    return failure(401, "Unauthorized request.", correlationId);
  }

  switch (action) {
    case "search_capabilities":
      return ok(search(registry.capabilities, data), correlationId);
    case "recommend_capabilities_for_role":
      return ok(recommend(registry.capabilities, data, correlationId), correlationId);
    case "create_capability_proposal":
      return ok(createProposal(store, data, activeActor), correlationId);
    case "score_capability_risk":
      return ok(scoreProposal(store, data, activeActor), correlationId);
    case "submit_capability_review":
      return ok(submitReview(store, data, activeActor), correlationId);
    case "approve_capability":
      return ok(approveProposal(store, data, activeActor), correlationId);
    case "reject_capability":
      return ok(rejectProposal(store, data, activeActor), correlationId);
    case "release_capability":
      return ok(releaseCapability(store, data, activeActor), correlationId);
    case "generate_release_packet":
      return ok({ releasePacket: registry.releasePackets.find((packet) => packet.capabilityId === data.capabilityId) }, correlationId);
    case "generate_capability_map":
      return ok(generateMap(registry.capabilities), correlationId);
    case "list_mcp_activity":
      return ok({ activity: registry.mcpActivity.slice(0, data.limit) }, correlationId);
  }
}

function search(capabilities: Capability[], input: { query?: string; role?: string; department?: string; status?: string; riskLevel?: string }) {
  const query = input.query?.toLowerCase();
  return {
    capabilities: capabilities.filter((capability) => {
      return (!query || capability.title.toLowerCase().includes(query) || capability.description.toLowerCase().includes(query))
        && (!input.role || capability.role === input.role)
        && (!input.department || capability.department === input.department)
        && (!input.status || capability.status === input.status)
        && (!input.riskLevel || capability.riskLevel === input.riskLevel);
    })
  };
}

function recommend(capabilities: Capability[], input: { role: string; department: string; maxResults: number }, correlationId: string) {
  const approvedCapabilities = capabilities
    .filter((capability) => capability.department === input.department || capability.role === input.role)
    .slice(0, input.maxResults);
  return {
    approvedCapabilities,
    candidateCapabilities: [
      {
        title: "Renewal Risk Follow-up Composer",
        rationale: "Matches renewal work signals and drafts approved follow-up actions without exposing raw content."
      },
      {
        title: "Customer Meeting Prep Packet",
        rationale: "Combines approved meeting, CRM, and support summaries into a reviewable prep workflow."
      }
    ].slice(0, Math.max(0, input.maxResults - approvedCapabilities.length)),
    rationale: "Recommendations use synthetic Work IQ-style source summaries and approved registry metadata.",
    correlationId
  };
}

function createProposal(store: RegistryStore, input: any, actor: Actor) {
  const proposalId = makeId("prop", input.idempotencyKey);
  const existing = store.read().proposals.find((proposal) => proposal.id === proposalId);
  if (existing) {
    return { proposalId: existing.id, status: existing.status, correlationId: existing.correlationId };
  }
  store.write((registry) => {
    registry.proposals.push({
      id: proposalId,
      title: input.title,
      description: input.description,
      role: input.role,
      department: input.department,
      owner: input.owner,
      intendedAudience: input.intendedAudience,
      inputsRequired: input.inputsRequired,
      proposedOutputs: input.proposedOutputs,
      sourceSummary: input.sourceSummary,
      status: "proposed",
      createdBy: actor.name,
      createdAt: nowIso(),
      correlationId: input.correlationId ?? proposalId
    });
    addActivity(registry, "create_capability_proposal", actor, proposalId, "success", input.correlationId ?? proposalId, "Created governed capability proposal.");
  });
  return { proposalId, status: "proposed", correlationId: input.correlationId ?? proposalId };
}

function scoreProposal(store: RegistryStore, input: any, actor: Actor) {
  const result = scoreRisk(input);
  const riskReviewId = makeId("risk", input.idempotencyKey);
  const existing = store.read().riskReviews.find((risk) => risk.id === riskReviewId);
  if (existing) {
    return { riskReviewId: existing.id, riskLevel: existing.riskLevel, requiredControls: existing.requiredControls, rationale: existing.rationale, correlationId: existing.correlationId };
  }
  store.write((registry) => {
    const proposal = registry.proposals.find((item) => item.id === input.proposalId);
    if (proposal) {
      proposal.status = result.riskLevel === "blocked" ? "blocked" : "risk_scored";
    }
    registry.riskReviews.push({ id: riskReviewId, ...input, ...result, createdAt: nowIso(), correlationId: input.correlationId ?? riskReviewId });
    addActivity(registry, "score_capability_risk", actor, input.proposalId, "success", input.correlationId ?? riskReviewId, "Risk gate produced deterministic score and controls.");
  });
  return { riskReviewId, ...result, correlationId: input.correlationId ?? riskReviewId };
}

function submitReview(store: RegistryStore, input: any, actor: Actor) {
  const reviewItemId = makeId("review", input.idempotencyKey);
  const existing = store.read().reviewItems.find((review) => review.id === reviewItemId);
  if (existing) {
    return { reviewItemId: existing.id, status: existing.status, correlationId: existing.correlationId };
  }
  store.write((registry) => {
    const risk = registry.riskReviews.find((item) => item.proposalId === input.proposalId);
    const proposal = registry.proposals.find((item) => item.id === input.proposalId);
    if (proposal) {
      proposal.status = "in_review";
    }
    registry.reviewItems.push({
      id: reviewItemId,
      proposalId: input.proposalId,
      reviewer: input.reviewer,
      dueDate: input.dueDate,
      status: "pending",
      recommendedDecision: risk?.riskLevel ?? "medium",
      createdAt: nowIso(),
      correlationId: input.correlationId ?? reviewItemId
    });
    addActivity(registry, "submit_capability_review", actor, input.proposalId, "success", input.correlationId ?? reviewItemId, "Submitted capability proposal for human review.");
  });
  return { reviewItemId, status: "pending", correlationId: input.correlationId ?? reviewItemId };
}

function approveProposal(store: RegistryStore, input: any, actor: Actor) {
  const capabilityId = makeId("cap", input.proposalId);
  const existing = store.read().capabilities.find((capability) => capability.id === capabilityId);
  if (existing) {
    return { capabilityId: existing.id, status: existing.status, correlationId: input.correlationId ?? capabilityId };
  }
  store.write((registry) => {
    const proposal = registry.proposals.find((item) => item.id === input.proposalId);
    if (!proposal) {
      return;
    }
    proposal.status = "approved_for_release";
    registry.capabilities.push({
      ...proposal,
      id: capabilityId,
      status: "approved_for_release",
      riskLevel: registry.riskReviews.find((risk) => risk.proposalId === proposal.id)?.riskLevel ?? "medium",
      version: "v1.0.0",
      approvedSourceTypes: ["CRM summary", "Meeting summary", "Support summary"],
      updatedAt: nowIso()
    });
    addActivity(registry, "approve_capability", actor, capabilityId, "success", input.correlationId ?? capabilityId, "Reviewer approved capability for release.");
  });
  return { capabilityId, status: "approved_for_release", correlationId: input.correlationId ?? capabilityId };
}

function rejectProposal(store: RegistryStore, input: any, actor: Actor) {
  store.write((registry) => {
    const proposal = registry.proposals.find((item) => item.id === input.proposalId);
    if (proposal) {
      proposal.status = "rejected";
    }
    addActivity(registry, "reject_capability", actor, input.proposalId, "success", input.correlationId ?? input.proposalId, "Reviewer rejected proposal with next action.");
  });
  return { proposalId: input.proposalId, status: "rejected", correlationId: input.correlationId ?? input.proposalId };
}

function releaseCapability(store: RegistryStore, input: any, actor: Actor) {
  const releasePacketId = makeId("release", input.idempotencyKey);
  const existing = store.read().releasePackets.find((packet) => packet.id === releasePacketId);
  if (existing) {
    return { releasePacketId: existing.id, status: "released", correlationId: existing.correlationId };
  }
  store.write((registry) => {
    const capability = registry.capabilities.find((item) => item.id === input.capabilityId);
    if (!capability || capability.status !== "approved_for_release") {
      return;
    }
    capability.status = "released";
    capability.version = input.version;
    registry.releasePackets.push({
      id: releasePacketId,
      capabilityId: capability.id,
      version: input.version,
      owner: capability.owner,
      approvedAudience: input.audience,
      approvedSourceTypes: capability.approvedSourceTypes,
      requiredHumanReview: true,
      usageGuidance: ["Use approved summaries only", "Keep human review for customer-facing outputs"],
      reviewer: input.releasedBy,
      releasedAt: nowIso(),
      correlationId: input.correlationId ?? releasePacketId
    });
    addActivity(registry, "release_capability", actor, capability.id, "success", input.correlationId ?? releasePacketId, "Released approved capability and generated packet.");
  });
  return { releasePacketId, status: "released", correlationId: input.correlationId ?? releasePacketId };
}

function generateMap(capabilities: Capability[]) {
  const nodes: AtlasNode[] = [{ id: "signal-renewals", label: "Renewal signals", kind: "signal" }];
  const edges: AtlasEdge[] = [];
  for (const capability of capabilities) {
    nodes.push({ id: `role-${capability.role}`, label: capability.role, kind: "role" });
    nodes.push({ id: `risk-${capability.id}`, label: `${capability.riskLevel} risk`, kind: "risk_gate", riskLevel: capability.riskLevel });
    nodes.push({ id: capability.id, label: capability.title, kind: "workflow", riskLevel: capability.riskLevel, status: capability.status });
    edges.push({ id: `edge-signal-${capability.id}`, source: "signal-renewals", target: `role-${capability.role}`, label: "work signal", kind: "signal_flow" });
    edges.push({ id: `edge-role-${capability.id}`, source: `role-${capability.role}`, target: `risk-${capability.id}`, label: "proposal", kind: "approval_path" });
    edges.push({ id: `edge-risk-${capability.id}`, source: `risk-${capability.id}`, target: capability.id, label: "release state", kind: "risk_gate" });
  }
  return { nodes, edges, legend: ["signal_flow", "approval_path", "risk_gate"] };
}

function getCorrelationId(rawInput: unknown) {
  if (rawInput && typeof rawInput === "object" && "correlationId" in rawInput && typeof rawInput.correlationId === "string") {
    return rawInput.correlationId;
  }
  return `corr-${Date.now()}`;
}

function isConfirmed(rawInput: unknown) {
  return Boolean(rawInput && typeof rawInput === "object" && "confirmed" in rawInput && rawInput.confirmed === true);
}

function ok(data: object, correlationId: string) {
  return { status: 200, body: { ok: true, ...data, correlationId } };
}

function failure(status: number, message: string, correlationId: string) {
  return { status, body: { ok: false, error: { message }, correlationId } };
}
