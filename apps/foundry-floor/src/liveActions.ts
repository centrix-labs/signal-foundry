import type { Capability } from "@signal-foundry/shared";
import { apiBase } from "./liveData";

// Live reviewer mutations against the MCP server. These drive the real governed
// lifecycle (approve_capability → release_capability) so the console's
// "Approve & Release" exercises the same path Copilot uses — Copilot → MCP →
// packet → console. Callers apply optimistic local state first and treat any
// failure here as a no-op (the demo state already reflects the decision).
const demoActorId = (import.meta.env["VITE_SIGNAL_FOUNDRY_DEMO_ACTOR"] as string | undefined) ?? "actor-alex";
const tenantId = (import.meta.env["VITE_SIGNAL_FOUNDRY_TENANT_ID"] as string | undefined) ?? "tenant-asteria-dynamics";
const projectId = (import.meta.env["VITE_SIGNAL_FOUNDRY_PROJECT_ID"] as string | undefined) ?? "revenue-ops-launchpad";
const reviewerName = "Alex Kim";

type ToolResponse = { ok?: boolean; result?: { correlationId?: string }; correlationId?: string };

async function callTool(toolName: string, body: Record<string, unknown>): Promise<ToolResponse> {
  const response = await fetch(`${apiBase}/tools/${toolName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-sf-actor-id": demoActorId },
    body: JSON.stringify(body)
  });
  const json = (await response.json().catch(() => ({}))) as ToolResponse;
  if (!response.ok || json.ok === false) {
    throw new Error(`${toolName} failed with ${response.status}.`);
  }
  return json;
}

export interface LiveReleaseResult {
  correlationId?: string;
}

// Approve (idempotent) then release a capability on the live registry. The
// server keys both writes by idempotencyKey, so repeated clicks never create
// duplicate packets. Returns the release correlation id when available.
export async function releaseCapabilityLive(capability: Capability): Promise<LiveReleaseResult> {
  // Snapshot capabilities already approved carry id `cap-<proposalId>`; records
  // still in the proposal stage carry the bare proposal id.
  const proposalId = capability.id.startsWith("cap-") ? capability.id.slice(4) : capability.id;
  const capabilityId = `cap-${proposalId}`;
  const scope = { tenantId, projectId };

  if (capability.status !== "approved_for_release" && capability.status !== "released") {
    await callTool("approve_capability", {
      ...scope,
      idempotencyKey: `idem-approve-${proposalId}`,
      confirmed: true,
      proposalId,
      reviewer: reviewerName,
      approvalNotes: "Approved for release from the Foundry Floor review console."
    });
  }

  const released = await callTool("release_capability", {
    ...scope,
    idempotencyKey: `idem-release-${proposalId}`,
    confirmed: true,
    capabilityId,
    releasedBy: reviewerName,
    audience: capability.intendedAudience,
    version: "v1.0.0"
  });

  return { correlationId: released.result?.correlationId ?? released.correlationId };
}
