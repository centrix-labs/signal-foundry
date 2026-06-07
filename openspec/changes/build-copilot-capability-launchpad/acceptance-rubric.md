# Acceptance Rubric: Signal Foundry

## Target Score

The spec is intended to support a 9.8+ build prompt and a hackathon-winning implementation. A build is not considered judge-ready unless every P0 gate passes and at least five P1 differentiators are visible in the demo.

## P0 Gates

| Gate | Pass Condition |
| --- | --- |
| Copilot surface | Signal Foundry is invoked from Microsoft 365 Copilot Chat or a faithful sideload-ready package with screenshots |
| Work IQ grounding | Agent uses permission-aware work-context summaries or synthetic Work IQ-style context without raw content |
| MCP read/write | Demo shows both MCP reads and writes with correlation IDs |
| External MCP server | Tool contract and running endpoint exist, or local endpoint is packaged for Azure Container Apps |
| OAuth/auth boundary | Unauthorized call is rejected with sanitized error |
| Human review | Release cannot happen until a reviewer approves |
| Risk gate | Proposal receives explainable risk score and required controls |
| Release packet | Released capability produces audit-safe packet |
| Signal Atlas | Frontend shows relationships among signals, roles, risk gates, and approved workflows |
| Review Queue | Reviewer can approve, reject, or request changes |
| Audit safety | No raw M365 content, PII, secrets, tokens, or stack traces appear |
| Anti-surveillance | Agent refuses employee-monitoring framing |
| Demo repeatability | Golden scenario can be reset and rerun |
| Visual quality | Foundry Floor matches provided references closely enough for judge recognition |
| Evidence mapping | Repository tells judges exactly where each criterion is proven |

## P1 Differentiators

- Animated Signal Atlas links between work signals, roles, risk gates, and released workflows.
- MCP Activity Rail with sanitized read/write trace and correlation IDs.
- Release Packet Drawer with artifacts, controls, owner, reviewer, version, and timestamp.
- Copilot Mirror showing the Microsoft 365 Copilot interaction and connected Signal Foundry evidence.
- Unauthorized-state screenshot.
- Anti-surveillance refusal screenshot.
- Azure deployment screenshot or deployment log.
- Light executive view for slide-friendly storytelling.
- Build-overlap explanation showing why this does not duplicate Scout, Agent Store, or Agent 365.

## Failure Conditions

Any of the following should block submission:

- Runtime depends on personal non-Microsoft LLM accounts.
- UI displays raw emails, chats, transcripts, documents, customer data, or secrets.
- Release can occur without explicit reviewer approval.
- MCP write operations lack idempotency or correlation IDs.
- Unauthorized errors expose tokens, stack traces, or implementation details.
- Product narrative sounds like employee monitoring.
- Frontend looks like a generic dashboard and does not show the Signal Foundry visual metaphor.

## Required Screenshots

1. Copilot Chat agent invocation.
2. Role-based recommendations grounded in work context summaries.
3. Proposal created in Foundry Floor.
4. Risk Gate with controls.
5. Review Queue with pending item.
6. Approved and released capability.
7. Signal Atlas with released workflow.
8. MCP Activity Rail.
9. Unauthorized rejection.
10. Anti-surveillance refusal.

## Final Judge Narrative

Use this narrative unless the demo implementation changes:

> Signal Foundry helps employees discover useful Copilot workflows, then helps the organization risk-review, approve, and release those workflows through an MCP-backed registry, human-in-the-loop governance, and an audit-safe Foundry Floor command center.
