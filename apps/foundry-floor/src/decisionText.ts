export const decisionCopy = {
  pending: {
    title: "Reviewer decision pending",
    body: "Release remains blocked until a human reviewer approves the packet."
  },
  saved: {
    title: "Saved for later",
    body: "The packet stays in review with audit-safe context preserved for the next reviewer pass."
  },
  changes_requested: {
    title: "Changes requested",
    body: "The proposal is held before release and the next action is recorded in the review queue."
  },
  released: {
    title: "Approved and released",
    body: "The capability is now a released workflow with the packet, atlas node, and MCP trace aligned."
  }
} as const;
