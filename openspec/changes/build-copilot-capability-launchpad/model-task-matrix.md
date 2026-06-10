# Model And Task Matrix: Signal Foundry

This matrix defines the LLM behavior expected by the build prompt and agent implementation. Runtime model choices should stay Microsoft-centered for the judged app. Codex, Claude, or ChatGPT may be used as developer tools, but the submitted runtime should not depend on personal non-Microsoft accounts.

## Runtime Roles

| Task | Runtime Role | Preferred Runtime | Temperature | Reasoning Depth | Tool Access | Output Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Role-based discovery | Copilot discovery agent | Microsoft 365 Copilot Chat Declarative Agent | 0.3 | Medium | Registry read, Work IQ context summary | 3-5 recommendations with rationale and no raw content |
| Proposal drafting | Proposal steward | Microsoft 365 Copilot Chat Declarative Agent | 0.2 | Medium | `create_capability_proposal` after confirmation | Draft proposal JSON summary plus confirmation text |
| Risk scoring | Risk gate evaluator | Deterministic service first; optional Azure AI Foundry / Azure OpenAI rationale | 0.1 | High | `score_capability_risk` | Risk level, controls, rationale, reviewer requirement |
| Human review assistant | Review copilot | Microsoft 365 Copilot Chat Declarative Agent | 0.2 | Medium | review, approve, reject, release tools after confirmation | Decision summary and next action |
| Release packet generation | Release packet writer | MCP server deterministic template; optional Azure OpenAI prose cleanup | 0.2 | Medium | `generate_release_packet` | Audit-safe packet with version, owner, controls, correlation ID |
| Signal Atlas generation | Map assembler | MCP server deterministic graph builder | 0.0 | Low | `generate_capability_map` | `nodes[]`, `edges[]`, legend, correlation ID |
| Unauthorized handling | Security boundary | MCP auth middleware | 0.0 | Low | None after rejection | Sanitized error, no stack trace or token |

## Build-Agent Defaults

When running this project with Codex agent teams, use `gpt-5.5` for every build agent unless the tool is unavailable. Do not downgrade model quality for security, architecture, backend, Azure deployment, or visual implementation work. Use lower reasoning only for mechanical evidence collation after the product is already validated.

| Workstream | Task Sections | Codex Agent Type | Model | Temperature | Reasoning Effort | Ownership Boundary |
| --- | --- | --- | --- | --- | --- | --- |
| Lead / Integration | 1, 2 | lead integrator | `gpt-5.5` | 0.1 | xhigh | shared contracts, root scripts, validation, commits, deployment gates |
| Copilot Agent | 3 | worker | `gpt-5.5` | 0.2 | high | Declarative Agent package, instructions, action manifest |
| Backend MCP | 4, 5, 6 | worker | `gpt-5.5` | 0.1 | xhigh | MCP server, registry, risk gate, backend tests |
| Security / Auth | 7 | worker or reviewer | `gpt-5.5` | 0.0 | xhigh | auth, role checks, audit, redaction, no-secret scans |
| Frontend / UX | 8 | worker | `gpt-5.5` | 0.2 | high | Foundry Floor UI, Signal Atlas, responsive screenshots |
| Azure / DevOps | 9, 10 | worker | `gpt-5.5` | 0.1 | xhigh | Docker, IaC/scripts, Azure deploy, cost controls |
| QA / Evidence | 11, 12, 13 | worker or reviewer | `gpt-5.5` | 0.1 | high | validation harness, demo flow, evidence package |

## Build-Agent Roles

| Build Task | Best Agent Mode | Model | Temperature | Reasoning Depth | Acceptance |
| --- | --- | --- | --- | --- | --- |
| Backend implementation | Senior TypeScript engineer | `gpt-5.5` | 0.1 | xhigh | Typed schemas, tests, deterministic seed data |
| Frontend implementation | Senior product engineer + visual designer | `gpt-5.5` | 0.2 | high | Matches visual references, no text overflow, responsive screenshots |
| Copilot package implementation | Microsoft 365 Copilot agent engineer | `gpt-5.5` | 0.2 | high | Sideload-ready package, action manifest, safe instructions |
| Azure deployment implementation | Azure platform engineer | `gpt-5.5` | 0.1 | xhigh | Cost-guarded deployment scripts, smoke tests, rollback notes |
| Security review | AppSec reviewer | `gpt-5.5` | 0.0 | xhigh | No secret leakage, role checks, sanitized errors |
| Demo script validation | QA lead | `gpt-5.5` | 0.1 | high | Golden path and unauthorized path pass repeatedly |
| Judge narrative | Product storyteller | `gpt-5.5` | 0.3 | medium | Clear Microsoft 365 Copilot + MCP + Work IQ story |

## Build-Agent Assignments: Foundry + Work IQ Uplift (Claude)

The uplift pass defined in `foundry-workiq-uplift-prompt.md` runs on Claude agents. Full per-task table lives in that prompt; summary:

| Workstream | Owner Model | Temp | Effort | Reviewer |
| --- | --- | --- | --- | --- |
| 1 Foundry advisory backend + arbitration | Fable 5 (`claude-fable-5`) | 0.1 | high | Opus 4.8 |
| 1 Advisory UI | Sonnet 4.6 (`claude-sonnet-4-6`) | 0.2 | medium | Opus 4.8 |
| 2 Work IQ grounding + agent instructions | Fable 5 | 0.1 | high | Opus 4.8 |
| 3 Foundry Floor filters/search | Sonnet 4.6 | 0.2 | medium | Opus 4.8 |
| 4 Playwright E2E | Sonnet 4.6 | 0.1 | medium | lead |
| 5 Contract hardening + hygiene | Sonnet 4.6 / Haiku 4.5 (`claude-haiku-4-5-20251001`) | 0.0-0.1 | high / low | lead |
| 6 Adaptive Card manifests | Fable 5 | 0.1 | high | Opus 4.8 |
| 6 Card templates | Sonnet 4.6 | 0.2 | medium | Opus 4.8 |
| 7 Evidence closure | Sonnet 4.6 | 0.1 | medium | lead |
| Azure provisioning/deploy | Fable 5 | 0.1 | high | Opus 4.8 |
| Lead integration + commits | Fable 5 | 0.1 | high | — |

Rules: strongest model on safety claims, Microsoft schema fidelity, and Azure; reviewer model always differs from implementer; temperature binds only for API-driven agents (Claude Code uses effort/thinking depth); same temperature guidance as below.

## Prompting Rules For Runtime Agents

- Ask for explicit confirmation before mutation tools.
- Prefer approved registry records before proposing new capabilities.
- Use Work IQ / Microsoft 365 context only as permission-aware summaries.
- Explain why a recommendation matters to the user role.
- Refuse employee surveillance requests.
- Never quote raw email, chat, transcript, document body, token, secret, or private data.
- For high-risk outputs, recommend human review and show required controls.

## Risk Gate Reasoning

Risk scoring must be deterministic and explainable for the MVP. Optional LLM rationale may improve wording, but it must not change the deterministic risk level unless the system records the model output as advisory and the rule engine remains the authority.

## Temperature Guidance

- Use `0.0-0.1` for security, schemas, risk scoring, and validation.
- Use `0.2-0.3` for recommendation wording and release packet prose.
- Do not use high-temperature creative generation for registry writes, approvals, risk decisions, or security handling.
