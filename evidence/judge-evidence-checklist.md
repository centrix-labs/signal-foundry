# Signal Foundry Judge Evidence Checklist

This checklist maps judge-facing proof to synthetic assets and existing repo surfaces. It is evidence metadata only; it does not include Microsoft 365 source content, personal contact details, credentials, or stack traces.

## Required Evidence

| Criterion | Status | Evidence |
| --- | --- | --- |
| Copilot Chat agent | Ready | `/Users/mattgraves/Documents/hackathon-enterprise/apps/copilot-agent/package/manifest.json`; `/Users/mattgraves/Documents/hackathon-enterprise/prototype/screenshots/signal-foundry-copilot.png`; golden flow `discover` step. |
| Microsoft IQ grounding | Ready | Golden flow `discover` grounding states role/context summaries and approved registry data only. |
| Original hackathon work | Ready | `/Users/mattgraves/Documents/hackathon-enterprise/data/signal-foundry-seed.json`; evidence `syntheticOnly: true`. |
| MCP app/plugin contract | Ready | `/Users/mattgraves/Documents/hackathon-enterprise/openspec/changes/build-copilot-capability-launchpad/mcp-tool-contract.md`. |
| MCP read operations | Ready | Golden flow includes `search_capabilities`, `recommend_capabilities_for_role`, `generate_capability_map`, and `list_mcp_activity`. |
| MCP write operations | Ready | Golden flow includes proposal creation, risk scoring, review submission, approval, release, and release packet generation. |
| Auth boundary | Ready | `unauthorized-approval` scenario rejects an employee approval with a sanitized message and correlation ID. |
| Human review | Ready | Golden flow requires Alex Kim review before approval and release; rejected proposal proves reviewer can stop release. |
| Audit-safe observability | Ready | Golden flow `atlas-audit` step requires actor, action, record, timestamp, and correlation ID only. |
| Responsible AI | Ready | `anti-surveillance-refusal` scenario refuses individual employee ranking and offers a team-level alternative. |

## P0 Gate Mapping

| Gate | Evidence Asset |
| --- | --- |
| Copilot surface | Copilot screenshot path plus golden flow `discover`. |
| Work IQ grounding | Golden flow `discover.grounding`. |
| MCP read/write | Golden flow `steps[].mcpActions`. |
| External MCP server | MCP tool contract and `/Users/mattgraves/Documents/hackathon-enterprise/apps/mcp-server/src/index.ts`. |
| OAuth/auth boundary | `unauthorized-approval.result`. |
| Human review | `submit-review`, `approve-release`, and `rejected-proposal`. |
| Risk gate | `risk-score.riskGate`. |
| Release packet | `approve-release.releasePacket`. |
| Signal Atlas | `atlas-audit` and `/Users/mattgraves/Documents/hackathon-enterprise/prototype/screenshots/signal-foundry-atlas.png`. |
| Review Queue | `submit-review.reviewItem` and `/Users/mattgraves/Documents/hackathon-enterprise/prototype/screenshots/signal-foundry-review.png`. |
| Audit safety | Validator `scripts/validate-evidence.mjs`. |
| Anti-surveillance | `anti-surveillance-refusal.response`. |
| Demo repeatability | `/Users/mattgraves/Documents/hackathon-enterprise/scripts/reset.ts` and deterministic correlation IDs in evidence. |
| Visual quality | Prototype screenshots under `/Users/mattgraves/Documents/hackathon-enterprise/prototype/screenshots`. |
| Evidence mapping | This checklist. |

## Screenshot Run List

1. Copilot Chat agent invocation.
2. Role-based recommendations grounded in work-context summaries.
3. Proposal created in Foundry Floor.
4. Risk Gate with controls.
5. Review Queue pending item.
6. Approved and released capability.
7. Signal Atlas released workflow.
8. MCP Activity Rail.
9. Unauthorized rejection.
10. Anti-surveillance refusal.

## Submission Narrative

Signal Foundry helps employees discover useful Copilot workflows, then helps the organization risk-review, approve, and release those workflows through an MCP-backed registry, human-in-the-loop governance, and an audit-safe Foundry Floor command center.
