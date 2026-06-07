# Judge Evidence Checklist: Signal Foundry

## Required Hackathon Evidence

| Criterion | Required Evidence |
| --- | --- |
| Microsoft 365 Copilot Chat agent | Screenshot/video of Signal Foundry invoked inside Copilot Chat; agent manifest and instructions in repo |
| Microsoft IQ integration | Agent response showing permission-aware work context or synthetic Work IQ-style grounding; spec requirement for Microsoft IQ Grounding; design notes explaining Work IQ as context layer |
| Original hackathon work | Synthetic dataset, no company/customer data, repo created for hackathon |

## Bonus Evidence

| Criterion | Required Evidence |
| --- | --- |
| MCP App / plugin | MCP/API plugin manifest or action configuration |
| External MCP server | Azure Container Apps URL, MCP tool list, tool schema docs |
| MCP read operations | `search_capabilities`, `recommend_capabilities_for_role`, `generate_capability_map` demo |
| MCP write operations | `create_capability_proposal`, `score_capability_risk`, `approve_capability`, `release_capability` demo |
| OAuth/security | Entra app registration notes, unauthorized rejection screenshot, sanitized error |
| Human review | Review queue and release approval flow |
| Audit-safe observability | Application Insights screenshot/log sample with actor, action, record ID, timestamp, correlation ID only |
| Responsible AI | Anti-surveillance refusal scenario and no-raw-content evidence |

## Frontend Evidence

- Foundry Floor screenshot at empty state.
- Foundry Floor screenshot after proposal creation.
- Risk Gate screenshot.
- Release Packet screenshot.
- Signal Atlas screenshot with released capability.
- Unauthorized state screenshot.
- Mobile/tablet screenshot if time allows.

## Repository Evidence

- `openspec/changes/build-copilot-capability-launchpad/`
- Agent manifest and instructions.
- MCP server source.
- MCP schemas.
- Synthetic seed data.
- Deployment scripts or commands.
- Test/evaluation checklist.
- Screenshots and demo script.
- `execution-plan.md` for build sequencing.
- `model-task-matrix.md` for model role, temperature, and reasoning guidance.
- `acceptance-rubric.md` for P0/P1 judge-readiness gates.
- `build-prompt-source.md` for final implementation prompt generation.

## Submission Narrative

Use this sentence:

> Signal Foundry helps employees discover useful Copilot workflows, then helps the organization risk-review, approve, and release those workflows through an MCP-backed registry and audit-safe Foundry Floor.
