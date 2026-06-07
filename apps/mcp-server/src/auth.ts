import type { Actor, McpAction, Role, SignalFoundryRegistry } from "@signal-foundry/shared";

const readActions: McpAction[] = [
  "search_capabilities",
  "recommend_capabilities_for_role",
  "generate_release_packet",
  "generate_capability_map",
  "list_mcp_activity"
];

const writeActions: McpAction[] = [
  "create_capability_proposal",
  "score_capability_risk",
  "submit_capability_review",
  "approve_capability",
  "reject_capability",
  "release_capability"
];

const reviewerActions: McpAction[] = [
  "score_capability_risk",
  "submit_capability_review",
  "approve_capability",
  "reject_capability",
  "release_capability"
];

export function isWriteAction(action: McpAction) {
  return writeActions.includes(action);
}

export function resolveActor(registry: SignalFoundryRegistry, actorId?: string): Actor | undefined {
  if (!actorId) {
    return undefined;
  }
  return registry.actors.find((actor) => actor.id === actorId);
}

export function actorIdFromBearer(value?: string) {
  const match = value?.match(/^Bearer\s+demo-(actor-[a-z-]+)$/i);
  return match?.[1];
}

export function authorize(action: McpAction, actor: Actor | undefined) {
  if (!actor) {
    return { ok: false as const, status: 401, message: "Unauthorized request." };
  }
  if (readActions.includes(action)) {
    return { ok: true as const };
  }
  if (reviewerActions.includes(action) && !hasAnyRole(actor.role, ["reviewer", "admin"])) {
    return { ok: false as const, status: 403, message: "Reviewer role required." };
  }
  if (action === "create_capability_proposal" && !hasAnyRole(actor.role, ["employee", "reviewer", "admin"])) {
    return { ok: false as const, status: 403, message: "Proposal access denied." };
  }
  return { ok: true as const };
}

function hasAnyRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}
