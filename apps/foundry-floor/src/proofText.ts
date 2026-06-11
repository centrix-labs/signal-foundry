import type { McpActivity } from "@signal-foundry/shared";

export function proofSentence(item: McpActivity) {
  switch (item.action) {
    case "search_capabilities":
      return "Registry search used approved capability summaries.";
    case "recommend_capabilities_for_role":
      return "Role recommendation used sanitized work context.";
    case "create_capability_proposal":
      return "Write required idempotency key and confirmation.";
    case "score_capability_risk":
      return "Deterministic controls applied.";
    case "submit_capability_review":
      return "Human approval route started.";
    case "release_capability":
      return "Release only after approval.";
    case "list_mcp_activity":
      return "Audit trail verified.";
    default:
      return item.status === "rejected" ? "Sanitized safety boundary enforced." : item.summary;
  }
}
