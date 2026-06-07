import type { Actor, McpAction, McpActivity, SignalFoundryRegistry } from "@signal-foundry/shared";

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix: string, value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${prefix}-${slug || "record"}`;
}

export function addActivity(
  registry: SignalFoundryRegistry,
  action: McpAction,
  actor: Actor,
  recordId: string,
  status: McpActivity["status"],
  correlationId: string,
  summary: string
) {
  registry.mcpActivity.unshift({
    id: makeId("act", `${action}-${correlationId}`),
    action,
    actor: actor.name,
    recordId,
    status,
    timestamp: nowIso(),
    correlationId,
    summary
  });
  registry.auditEvents.unshift({
    id: makeId("audit", `${action}-${correlationId}`),
    actor: actor.name,
    action,
    targetRecord: recordId,
    timestamp: nowIso(),
    correlationId
  });
  console.log(JSON.stringify({
    event: "signal_foundry_audit",
    action,
    actorId: actor.id,
    recordId,
    status,
    correlationId,
    timestamp: nowIso()
  }));
}

export function addRejectedActivity(
  registry: SignalFoundryRegistry,
  action: McpAction,
  correlationId: string,
  summary: string
) {
  registry.mcpActivity.unshift({
    id: makeId("act", `${action}-rejected-${correlationId}`),
    action,
    actor: "Unauthorized requester",
    recordId: "auth-boundary",
    status: "rejected",
    timestamp: nowIso(),
    correlationId,
    summary
  });
  registry.auditEvents.unshift({
    id: makeId("audit", `${action}-rejected-${correlationId}`),
    actor: "OAuth boundary",
    action: "mcp.rejected",
    targetRecord: "auth-boundary",
    timestamp: nowIso(),
    correlationId
  });
  console.log(JSON.stringify({
    event: "signal_foundry_audit",
    action,
    actorId: "unauthorized",
    recordId: "auth-boundary",
    status: "rejected",
    correlationId,
    timestamp: nowIso()
  }));
}
