import {
  type Actor,
  type AtlasEdge,
  type AtlasNode,
  type Capability,
  type CopilotCheckpointApprovalState,
  type CopilotCheckpointStage,
  type McpAction,
  type SignalFoundryRegistry,
  type ToolName,
  toolSchemas
} from "@signal-foundry/shared";
import { addActivity, addRejectedActivity, makeId, nowIso } from "./audit";
import { generateAdvisoryRiskAnalysis, sanitizeAdvisoryText } from "./advisory";
import { authorize, isWriteAction } from "./auth";
import { scoreRisk } from "./risk";
import type { RegistryStore } from "./store";

export const toolNames = Object.keys(toolSchemas) as ToolName[];

type ToolResult = { status: number; body: Record<string, unknown> };

export async function executeTool(store: RegistryStore, action: ToolName, rawInput: unknown, actor: Actor | undefined): Promise<ToolResult> {
  const correlationId = getCorrelationId(rawInput);
  const auth = authorize(action, actor);
  if (!auth.ok) {
    store.write((registry) => {
      addRejectedActivity(registry, action, correlationId, auth.message);
    });
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
    case "get_user_work_context":
      return ok(getUserWorkContext(registry, data, activeActor), correlationId);
    case "create_capability_proposal":
      return ok(createProposal(store, data, activeActor), correlationId);
    case "score_capability_risk":
      return ok(await scoreProposal(store, data, activeActor), correlationId);
    case "submit_capability_review":
      return ok(submitReview(store, data, activeActor), correlationId);
    case "approve_capability":
      return ok(approveProposal(store, data, activeActor), correlationId);
    case "reject_capability":
      return ok(rejectProposal(store, data, activeActor), correlationId);
    case "release_capability":
      return ok(releaseCapability(store, data, activeActor), correlationId);
    case "record_copilot_checkpoint":
      return recordCopilotCheckpoint(store, data, activeActor, correlationId);
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

function recommend(capabilities: Capability[], input: { role: string; department: string; workSignalSummary: string; maxResults: number }, correlationId: string) {
  const approvedCapabilities = capabilities
    .filter((capability) => capability.department === input.department || capability.role === input.role)
    .slice(0, input.maxResults);
  const groundedOn = sanitizeAdvisoryText(input.workSignalSummary, 200);
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
    rationale: `Recommendations matched to the supplied work-context signals and approved registry metadata. Grounded on: ${groundedOn}`,
    groundedOn,
    correlationId
  };
}

function getUserWorkContext(
  registry: SignalFoundryRegistry,
  input: {
    requestedRole?: string;
    requestedDepartment?: string;
    sourceHint?: string;
    workSummary?: string;
    activeProjects?: string[];
    recurringWorkflows?: string[];
  },
  actor: Actor
) {
  const defaults = workContextDefaults(actor);
  const role = sanitizeLabel(input.requestedRole) ?? defaults.jobTitle;
  const department = sanitizeLabel(input.requestedDepartment) ?? defaults.department;
  const roleFamily = roleFamilyFor(role, department, defaults.roleFamily);
  const useCases = useCasesFor(roleFamily);
  const suppliedSummary = sanitizeAdvisoryText(input.workSummary, 600);
  const activeProjects = (input.activeProjects ?? []).map((item) => sanitizeLabel(item)).filter((item): item is string => Boolean(item)).slice(0, 5);
  const recurringWorkflows = (input.recurringWorkflows ?? []).map((item) => sanitizeLabel(item)).filter((item): item is string => Boolean(item)).slice(0, 5);
  const hasGroundedSummary = suppliedSummary.length >= 10;
  const workSignalSummary = hasGroundedSummary
    ? [
        suppliedSummary,
        ...(activeProjects.length > 0 ? [`Active projects: ${activeProjects.join(", ")}.`] : []),
        ...(recurringWorkflows.length > 0 ? [`Recurring workflows: ${recurringWorkflows.join(", ")}.`] : []),
        "Use approved source categories only: CRM summaries, meeting summaries, support summaries, policy summaries, and proposal metadata."
      ]
    : [
        `${department} workflows show recurring handoffs, drafting effort, evidence collection, and review friction.`,
        "Use approved source categories only: CRM summaries, meeting summaries, support summaries, policy summaries, and proposal metadata."
      ];
  return {
    companyName: registry.demoScope.companyName,
    source: hasGroundedSummary || input.sourceHint === "graph_profile" || input.sourceHint === "work_iq"
      ? "permission_aware_profile_summary"
      : "synthetic_work_iq",
    groundingBasis: hasGroundedSummary ? "agent_supplied_summary" : "synthetic_demo_profile",
    profile: {
      displayName: actor.name,
      jobTitle: role,
      department,
      team: defaults.team,
      roleFamily,
      permissionBasis: "Authenticated profile summary; no raw Microsoft 365 content returned."
    },
    recommendedUseCaseAreas: useCases,
    workSignalSummary,
    message: `I see you're a ${role} working with ${department}. Show governed Copilot use cases for ${useCases.join(", ")}.`,
    privacyNote: "This is job-context personalization only. Signal Foundry does not rank people, monitor employees, or return raw Microsoft 365 content."
  };
}

function workContextDefaults(actor: Actor) {
  const profiles: Record<string, { jobTitle: string; department: string; team: string; roleFamily: string }> = {
    "actor-priya": {
      jobTitle: "Presales Architect",
      department: "Sales Engineering",
      team: "Enterprise Growth",
      roleFamily: "presales"
    },
    "actor-alex": {
      jobTitle: "AI Enablement Reviewer",
      department: "AI Governance",
      team: "Capability Review Board",
      roleFamily: "reviewer"
    },
    "actor-dana": {
      jobTitle: "Chief of Staff",
      department: "Office of the CIO",
      team: "Executive Operations",
      roleFamily: "executive"
    }
  };
  return profiles[actor.id] ?? {
    jobTitle: actor.role === "reviewer" ? "AI Enablement Reviewer" : "Business User",
    department: actor.department,
    team: actor.department,
    roleFamily: actor.role
  };
}

function roleFamilyFor(role: string, department: string, fallback: string) {
  const value = `${role} ${department}`.toLowerCase();
  if (value.includes("presales") || value.includes("solution")) {
    return "presales";
  }
  if (value.includes("sales rep") || value.includes("account executive") || value.includes("enterprise sales")) {
    return "sales";
  }
  if (value.includes("customer success") || value.includes("renewal")) {
    return "customer_success";
  }
  if (value.includes("review") || value.includes("governance")) {
    return "reviewer";
  }
  return fallback;
}

function useCasesFor(roleFamily: string) {
  const useCases: Record<string, string[]> = {
    presales: ["discovery prep", "RFP response", "solution briefs", "customer handoffs", "renewal risk prep"],
    sales: ["account prep", "mutual action plans", "follow-ups", "renewal briefs", "stakeholder mapping"],
    customer_success: ["QBR prep", "renewal risk briefs", "escalation prep", "health summaries", "handoff packets"],
    reviewer: ["proposal triage", "risk gate review", "release packet validation", "audit evidence review"],
    executive: ["portfolio review", "risk posture summaries", "release readiness", "cross-team alignment"]
  };
  return useCases[roleFamily] ?? ["workflow discovery", "proposal drafting", "risk review", "release packet prep"];
}

function sanitizeLabel(value?: string) {
  const sanitized = value?.replace(/[^\w\s/&-]/g, "").replace(/\s+/g, " ").trim();
  return sanitized && sanitized.length >= 2 ? sanitized.slice(0, 80) : undefined;
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

async function scoreProposal(store: RegistryStore, input: any, actor: Actor) {
  const result = scoreRisk(input);
  const riskReviewId = makeId("risk", input.idempotencyKey);
  const existing = store.read().riskReviews.find((risk) => risk.id === riskReviewId);
  if (existing) {
    return { riskReviewId: existing.id, riskLevel: existing.riskLevel, requiredControls: existing.requiredControls, rationale: existing.rationale, advisory: existing.advisory, correlationId: existing.correlationId };
  }
  const proposalRecord = store.read().proposals.find((item) => item.id === input.proposalId);
  // Advisory wording only; the deterministic result above is the source of truth
  // and must be unaffected by advisory availability, content, or failure.
  const advisory = await generateAdvisoryRiskAnalysis(
    {
      title: proposalRecord?.title ?? "Unknown proposal",
      description: proposalRecord?.description ?? "No description on record.",
      role: proposalRecord?.role ?? "unknown",
      department: proposalRecord?.department ?? "unknown"
    },
    {
      dataSensitivity: input.dataSensitivity,
      externalSharing: input.externalSharing,
      automationLevel: input.automationLevel,
      audienceScope: input.audienceScope,
      usesCustomerData: input.usesCustomerData,
      requiresHumanReview: input.requiresHumanReview
    },
    { riskLevel: result.riskLevel, requiredControls: result.requiredControls }
  );
  store.write((registry) => {
    const proposal = registry.proposals.find((item) => item.id === input.proposalId);
    if (proposal) {
      proposal.status = result.riskLevel === "blocked" ? "blocked" : "risk_scored";
    }
    registry.riskReviews.push({ id: riskReviewId, ...input, ...result, advisory, createdAt: nowIso(), correlationId: input.correlationId ?? riskReviewId });
    const advisoryNote = advisory.status === "available"
      ? `Advisory analysis attached (${advisory.agreesWithGate === false ? "disagrees with gate; gate wins" : "agrees with gate"}).`
      : "Advisory unavailable; deterministic verdict stands.";
    addActivity(registry, "score_capability_risk", actor, input.proposalId, "success", input.correlationId ?? riskReviewId, `Risk gate produced deterministic score and controls. ${advisoryNote}`);
  });
  return { riskReviewId, ...result, advisory, correlationId: input.correlationId ?? riskReviewId };
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

function recordCopilotCheckpoint(store: RegistryStore, input: any, actor: Actor, correlationId: string): ToolResult {
  const checkpointId = makeId("cp", input.idempotencyKey);
  const existing = store.read().copilotCheckpoints.find((checkpoint) => checkpoint.id === checkpointId);
  if (existing) {
    return ok({
      checkpointId: existing.id,
      sessionId: existing.sessionId,
      stage: existing.stage,
      approvalState: existing.approvalState
    }, correlationId);
  }
  const validationError = validateCheckpointAuthorization(input.approvalState, input.stage, actor.role)
    ?? validateCheckpointRelatedRecord(input.stage, input.relatedRecordId)
    ?? validateCheckpointSourceTool(input.sourceTool);
  if (validationError) {
    store.write((registry) => {
      addActivity(registry, "record_copilot_checkpoint", actor, input.relatedRecordId ?? checkpointId, "rejected", correlationId, validationError);
    });
    return failure(400, validationError, correlationId);
  }
  const displayText = sanitizeCheckpointText(input.displayText);
  if (!displayText.ok) {
    store.write((registry) => {
      addActivity(registry, "record_copilot_checkpoint", actor, input.relatedRecordId ?? checkpointId, "rejected", correlationId, displayText.message);
    });
    return failure(400, displayText.message, correlationId);
  }
  store.write((registry) => {
    registry.copilotCheckpoints.unshift({
      id: checkpointId,
      tenantId: input.tenantId,
      projectId: input.projectId,
      sessionId: input.sessionId,
      speaker: input.speaker,
      stage: input.stage,
      source: input.source,
      sourceTool: input.sourceTool as McpAction | undefined,
      relatedRecordId: input.relatedRecordId,
      approvalState: input.approvalState,
      actor: sanitizeLabel(input.actor) ?? actor.name,
      displayText: displayText.text,
      createdAt: nowIso(),
      correlationId
    });
    addActivity(registry, "record_copilot_checkpoint", actor, checkpointId, "success", correlationId, "Recorded sanitized Copilot checkpoint summary.");
  });
  return ok({
    checkpointId,
    sessionId: input.sessionId,
    stage: input.stage,
    approvalState: input.approvalState
  }, correlationId);
}

function validateCheckpointAuthorization(approvalState: CopilotCheckpointApprovalState, stage: CopilotCheckpointStage, role: Actor["role"]) {
  if (approvalState === "human_approved" && !["reviewer", "admin"].includes(role)) {
    return "Reviewer role required for human-approved checkpoint.";
  }
  if (approvalState === "human_approved" && !["approval", "release"].includes(stage)) {
    return "Human-approved checkpoints require approval or release stage.";
  }
  return undefined;
}

function validateCheckpointRelatedRecord(stage: CopilotCheckpointStage, relatedRecordId?: string) {
  if ((stage === "approval" || stage === "release") && !relatedRecordId) {
    return "Approval and release checkpoints require relatedRecordId.";
  }
  return undefined;
}

function validateCheckpointSourceTool(sourceTool?: string) {
  if (sourceTool && !toolNames.includes(sourceTool as ToolName)) {
    return "Checkpoint sourceTool must be a Signal Foundry MCP tool.";
  }
  return undefined;
}

function sanitizeCheckpointText(value: string): { ok: true; text: string } | { ok: false; message: string } {
  const raw = value.trim();
  const unsafePatterns = [
    { pattern: /(^|\n)\s*>[^>\n]{40,}/, label: "quoted raw content" },
    { pattern: /\b(from|to|subject):\s+/i, label: "email header" },
    { pattern: /\b(?:user|assistant|copilot|speaker)\s*\d{0,2}\s*(?:\[[^\]]+\])?:/i, label: "transcript dump" },
    { pattern: /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\s*[-–]\s*\w+:/i, label: "transcript timestamp" },
    { pattern: /\b(?:bearer|access_token|refresh_token)\b/i, label: "token text" },
    { pattern: /\bat\s+\S+\.(?:ts|tsx|js|mjs|cjs):\d+:\d+/i, label: "stack trace" },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, label: "personal identifier" },
    { pattern: /\b(?:\d[ -]*?){13,16}\b/, label: "payment card pattern" },
    { pattern: /\b(?:api[-_]?key|client[-_]?secret|password|connectionstring)[=:]\S+/i, label: "secret pattern" },
    { pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, label: "email address" }
  ];
  const unsafe = unsafePatterns.find(({ pattern }) => pattern.test(raw));
  if (unsafe) {
    return { ok: false, message: `Checkpoint rejected: ${unsafe.label} is not allowed.` };
  }
  const sanitized = sanitizeAdvisoryText(raw, 420).replace(/^["']|["']$/g, "").trim();
  if (sanitized.length < 8) {
    return { ok: false, message: "Checkpoint rejected: sanitized summary is too short." };
  }
  if (sanitized !== raw) {
    return { ok: false, message: "Checkpoint rejected: unsafe personal data or credential-like text is not allowed." };
  }
  return { ok: true, text: sanitized };
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
