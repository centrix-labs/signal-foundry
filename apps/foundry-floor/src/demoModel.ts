import type { Capability, McpActivity, ReleasePacket } from "@signal-foundry/shared";
import { capabilities } from "./data";

export const firstCapability = capabilities[0];

export const judgeStages = [
  { key: "discover", label: "Discover", body: "Permission-aware summaries enter the forge." },
  { key: "propose", label: "Propose", body: "Copilot calls MCP to shape a governed capability." },
  { key: "score", label: "Score", body: "Deterministic controls decide what happens next." },
  { key: "review", label: "Review", body: "Human approval blocks release until ready." },
  { key: "release", label: "Release", body: "A release packet and audit trail prove the workflow." }
] as const;

if (!firstCapability) {
  throw new Error("Foundry Floor requires at least one synthetic capability.");
}

export function findCapability(id: string, records: readonly Capability[]): Capability {
  return records.find((item) => item.id === id) ?? records[0] ?? firstCapability;
}

export function recordForStage(stageIndex: number, records: readonly Capability[]): Capability {
  if (stageIndex === 4) {
    return records.find((item) => item.status === "released" || item.status === "approved_for_release") ?? records[0] ?? firstCapability;
  }
  return records.find((item) => ["proposed", "risk_scored", "in_review"].includes(item.status)) ?? records[0] ?? firstCapability;
}

export function nextStageLabel(stageIndex: number) {
  const next = stageIndex >= judgeStages.length - 1 ? 0 : stageIndex + 1;
  return next === 0 ? "Restart story" : `Advance to ${judgeStages[next]?.label ?? "next step"}`;
}

export function getReleasePacket(selected: Capability, packets: readonly ReleasePacket[]) {
  return packets.find((item) => item.capabilityId === selected.id);
}

export function latestCorrelation(activity: readonly McpActivity[], packet?: ReleasePacket) {
  return activity.find((item) => item.correlationId)?.correlationId ?? packet?.correlationId ?? "Audit correlation pending";
}

// Record-driven release funnel: every stage count is derived from the same
// records the cards render from, and each stage filters the cards below.
export const PIPELINE_STAGES = [
  { key: "proposed", label: "Proposed", statuses: ["proposed", "candidate"], tone: "live" },
  { key: "risk_scored", label: "Risk Scored", statuses: ["risk_scored"], tone: "pending" },
  { key: "in_review", label: "In Review", statuses: ["in_review"], tone: "pending" },
  { key: "approved", label: "Approved", statuses: ["approved_for_release", "approved"], tone: "approved" },
  { key: "released", label: "Released", statuses: ["released"], tone: "approved" },
  { key: "blocked", label: "Blocked", statuses: ["blocked", "rejected"], tone: "blocked" }
] as const;

export function stageKeyForStatus(status: string): string {
  return PIPELINE_STAGES.find((stage) => (stage.statuses as readonly string[]).includes(status))?.key ?? "proposed";
}
