# Tasks: Build Signal Foundry

## Parallel Workstream Contract

Every checklist item below inherits a workstream, agent role, model, temperature, and reasoning effort from this table unless the item explicitly says otherwise. When running this build with Codex agent teams, use `gpt-5.5` for all implementation, architecture, security, Azure, integration, and review work. Commits are checkpoints only; agents continue to the next owned task after a checkpoint passes.

| Task Sections | Workstream | Primary Agent Role | Write Ownership | Model | Temp | Reasoning Effort |
| --- | --- | --- | --- | --- | --- | --- |
| 1, 2 | Lead / Integration | Principal full-stack architect | root config, shared contracts, validation, checkpoint integration | `gpt-5.5` | 0.1 | xhigh |
| 3 | Copilot Agent | Microsoft 365 Copilot agent engineer | `apps/copilot-agent`, agent manifests, instructions, action config | `gpt-5.5` | 0.2 | high |
| 4, 5, 6 | Backend MCP | Senior TypeScript MCP engineer | `apps/mcp-server`, registry adapters, risk gate, MCP tests | `gpt-5.5` | 0.1 | xhigh |
| 7 | Security / Auth | AppSec and Entra engineer | auth middleware, role policy, audit logging, secret scans | `gpt-5.5` | 0.0 | xhigh |
| 8 | Frontend / UX | Senior product engineer and visual systems designer | `apps/foundry-floor`, visual assets, screenshots | `gpt-5.5` | 0.2 | high |
| 9, 10 | Azure / DevOps | Azure platform engineer | Docker, IaC/scripts, deployment, cost guardrails | `gpt-5.5` | 0.1 | xhigh |
| 11, 12, 13 | QA / Evidence | QA lead and hackathon evidence producer | validation harness, demo scripts, evidence package | `gpt-5.5` | 0.1 | high |

Parallelization rules:

- Lead owns shared contracts before backend, frontend, and Copilot workers consume them.
- Backend and frontend may run in parallel after shared schemas and seed fixtures exist.
- Azure may prepare scripts and containers in parallel, but deployed changes wait for local Checkpoint D stability.
- Copilot package work may run in parallel after the MCP tool contract is stable.
- QA may build validation and evidence scripts in parallel after the first seed data shape exists.
- No two agents should edit the same file family at the same time without Lead coordination.
- Workers must not revert or overwrite unrelated changes from other agents.
- Any task touching auth, tenant scope, audit, deployment, or agent behavior requires a quick review-board pass before the checkpoint is accepted.

## 1. Planning And Prompt Readiness

- [x] Create OpenSpec proposal.
- [x] Define frontend and backend component boundaries.
- [x] Review Microsoft Build 2026 overlap risk.
- [x] Confirm final product name.
- [x] Confirm demo business domain.
- [x] Create judge evidence checklist.
- [x] Create final demo script.
- [x] Create Azure deployment plan.
- [x] Create MCP tool contract.
- [x] Create execution plan.
- [x] Create model and task matrix.
- [x] Create 9.8+ acceptance rubric.
- [x] Create build prompt source.
- [x] Assemble final 9.8+ build prompt.
- [x] Create hackathon sizing and cut-line guide.
- [x] Create architecture cost plan and budget guardrails.
- [x] Use `final-9-8-build-prompt.md` as the source instruction for implementation.

## 2. Project Scaffold And Shared Contracts

- [x] Create workspace structure for agent, MCP server, registry, frontend, scripts, tests, evidence, and deployment.
- [x] Create package scripts for install, dev, build, typecheck, test, lint, seed, reset, screenshots, and validation.
- [x] Add `.env.example` files with placeholders only.
- [x] Define shared TypeScript types for capabilities, proposals, risk reviews, review items, release packets, MCP activity, audit events, roles, and departments.
- [x] Define Zod schemas aligned to the shared types and MCP tool contract.
- [x] Add schema fixtures for valid and invalid tool calls.
- [x] Add seed-data contract tests.
- [x] Verify every source file stays at or below the project line cap unless explicitly justified.
- [x] Complete Checkpoint A verification and commit.

## 3. Copilot Agent

- [x] Scaffold Microsoft 365 Copilot Chat Declarative Agent.
- [x] Add Signal Foundry agent identity, description, capabilities, and starter prompts.
- [x] Add agent instructions for role-based capability discovery.
- [x] Add agent instructions and evidence for Microsoft IQ / Work IQ grounding.
- [x] Add agent instructions for proposal drafting and release packet generation.
- [x] Add agent instructions for risk explanation, uncertainty, and human review.
- [x] Add explicit confirmation instructions before mutation tools.
- [x] Add explicit anti-surveillance and no-raw-content instructions.
- [x] Add MCP/API plugin action manifest.
- [x] Configure local and Azure endpoint variants for the action manifest.
- [x] Package the agent for sideload.
- [ ] Sideload in developer tenant when tenant access allows.
- [x] Capture screenshots proving Copilot Chat hosting or sideload-ready package evidence.
- [ ] Capture role-based recommendation screenshot with Work IQ-style summary.
- [ ] Capture anti-surveillance refusal screenshot.
- [ ] Verify Copilot action domain and deployed MCP endpoint alignment.
- [x] Complete Checkpoint E verification and commit.

## 4. External MCP Server

- [x] Scaffold TypeScript / Node.js MCP server.
- [x] Implement health endpoint.
- [x] Implement tool-list endpoint.
- [x] Define Zod schemas for all tools.
- [x] Implement `search_capabilities`.
- [x] Implement `recommend_capabilities_for_role`.
- [x] Implement `create_capability_proposal`.
- [x] Implement `score_capability_risk`.
- [x] Implement `submit_capability_review`.
- [x] Implement `approve_capability`.
- [x] Implement `reject_capability`.
- [x] Implement `release_capability`.
- [x] Implement `generate_release_packet`.
- [x] Implement `generate_capability_map`.
- [x] Implement `list_mcp_activity`.
- [x] Add idempotency keys to all write operations.
- [x] Add correlation IDs across requests, writes, logs, and responses.
- [x] Add audit-safe logging.
- [x] Add sanitized success and error response contracts.
- [x] Add MCP schema/unit tests for every tool.
- [x] Add local MCP smoke tests for health, tool list, read, write, and unauthorized rejection.
- [x] Complete Checkpoint B verification and commit.

## 5. Capability Registry Backend

- [x] Create local JSON or SQLite synthetic registry store.
- [x] Create Azure Table Storage registry adapter for deployment.
- [x] Seed roles, departments, capabilities, proposals, risk reviews, review items, release packets, MCP activity, and audit events.
- [x] Add repository layer for registry reads and writes.
- [x] Add tenant, project, actor, and role scoping.
- [x] Add migration or reset command for demo reliability.
- [x] Add deterministic demo state reset.
- [x] Add no-raw-content checks in seed data and generated records.
- [x] Add registry tests for create, update, release, audit trail, and reset.

## 6. Risk Gate Backend

- [x] Implement deterministic risk scoring for data sensitivity, external sharing, automation, audience scope, customer data, and human review.
- [x] Add policy notes and explainable risk rationale.
- [x] Add prompt-injection and sensitive-output risk labels.
- [x] Add reviewer-required thresholds.
- [x] Add blocked-state logic for unacceptable risk.
- [x] Add test cases for low, medium, high, and blocked capability proposals.
- [ ] Optionally add Azure AI Foundry / Azure OpenAI rationale wording as advisory output only.
- [x] Verify optional LLM rationale cannot override deterministic risk level.

## 7. Auth, Security, And Audit

- [ ] Create Microsoft Entra app registration implementation notes.
- [ ] Create Entra app registration or automation when permissions allow.
- [ ] Store secrets in Key Vault for deployed environments.
- [x] Add OAuth-compatible token validation path where supported.
- [x] Add local demo auth mode with synthetic users and roles.
- [x] Enforce reviewer role for score, review, approve, reject, and release tools.
- [x] Reject unauthorized MCP read and write attempts.
- [x] Redact tokens, secrets, raw content, PII, and stack traces from errors.
- [x] Add unauthorized demo evidence.
- [x] Add no-secret/no-raw-content scan over seed data, logs, screenshots, generated release packets, and docs.
- [ ] Add Application Insights telemetry shape with actor, action, record ID, timestamp, and correlation ID only.
- [ ] Add sanitized App Insights query or sample evidence.
- [x] Add cost-safe logging configuration with compact audit events only.
- [x] Complete Checkpoint C verification and commit.

## 8. Frontend: Foundry Floor

- [x] Import visual reference set for pixel-target implementation.
- [x] Define frontend data contracts from MCP schemas.
- [x] Build API client for local mock, local MCP/API, and deployed MCP/API modes.
- [x] Build Foundry Floor command center from `visual-reference-2-foundry-floor.jpg`.
- [x] Build Signal Atlas view from `visual-reference-4-signal-atlas.jpg`.
- [x] Add animated Signal Atlas links between signals, roles, risk gates, and released workflows.
- [x] Build Review Queue view from `visual-reference-1-review-queue.jpg`.
- [x] Build Copilot Mirror view from `visual-reference-3-copilot-mirror.jpg`.
- [x] Build optional Light Executive view from `visual-reference-5-light-executive.jpg`.
- [x] Build Release Pipeline view.
- [x] Build Risk Gate Panel.
- [x] Build Release Packet Drawer.
- [x] Build MCP Activity Rail.
- [x] Add empty, loading, error, unauthorized, pending review, approved, rejected, blocked, and released states.
- [x] Add explicit request-changes, approve, reject, and release controls.
- [x] Add responsive desktop-first layout with tablet and mobile variants.
- [x] Verify UI avoids generic AI dashboard patterns.
- [x] Apply Signal Foundry logo, palette, and "Raw Signals | Forged with Intelligence | Approved Workflows" brand motif.
- [x] Run screenshot review against all five visual references.
- [x] Verify text fit, panel spacing, and action hierarchy at desktop, tablet, and mobile sizes.
- [x] Capture Playwright or Chrome screenshots for judging.
- [x] Complete Checkpoint D verification and commit.

## 9. Containerization And Local Runtime

- [x] Add MCP server Dockerfile.
- [x] Add container build script.
- [ ] Add local container run script.
- [ ] Add local container health/tool smoke test.
- [x] Add frontend production build script.
- [ ] Add local end-to-end run script for MCP server plus Foundry Floor.
- [x] Document local run commands.
- [x] Verify local run from clean install.

## 10. Azure Infrastructure And Deployment

- [x] Create Azure provisioning script or IaC for resource group, Log Analytics, Application Insights, ACR, Storage, Key Vault, Container Apps, and Static Web Apps.
- [x] Add deployment rollback notes for each Azure resource group change.
- [x] Add Azure cost guardrails from `architecture-cost-plan.md`.
- [ ] Create Azure Budget or manual cost alert for the deployed demo environment.
- [ ] Provision Azure resource group and required services in subscription `YOUR-AZURE-SUBSCRIPTION-ID`.
- [ ] Create registry tables: `Capabilities`, `CapabilityProposals`, `RiskReviews`, `ReviewItems`, `ReleasePackets`, `McpActivity`, `AuditEvents`.
- [ ] Build MCP server container image.
- [ ] Push MCP image to Azure Container Registry.
- [ ] Deploy MCP server to Azure Container Apps.
- [ ] Deploy Foundry Floor to Azure Static Web Apps.
- [ ] Configure deployed frontend to use deployed MCP/API endpoint.
- [ ] Configure allowed origins/CORS for deployed frontend, MCP/API endpoint, and Copilot action surface.
- [ ] Run Azure health endpoint smoke test.
- [ ] Run Azure tool-list smoke test.
- [ ] Run Azure authorized synthetic read test.
- [ ] Run Azure authorized synthetic write test.
- [ ] Run Azure unauthorized rejection test.
- [ ] Verify Application Insights receives sanitized correlation IDs.
- [ ] Capture Azure resource list and current cost posture.
- [ ] Add post-hackathon cleanup checklist.
- [ ] Complete Checkpoint F verification and commit.

## 11. Demo And Validation Harness

- [x] Add scripted golden flow: discover -> propose -> risk score -> submit -> approve -> release.
- [x] Add scripted unauthorized MCP scenario.
- [x] Add scripted rejected proposal scenario.
- [x] Add scripted released capability map scenario.
- [x] Add scripted anti-surveillance refusal scenario.
- [ ] Add reset command for repeatable demos.
- [x] Add validation command that runs schema tests, registry tests, risk tests, smoke tests, screenshot checks, and OpenSpec validation.
- [x] Verify no secrets, raw content, tokens, PII, or production data appear in UI, logs, screenshots, seed data, release packets, or final artifacts.
- [ ] Verify every P0 gate in `acceptance-rubric.md`.
- [ ] Verify at least five P1 differentiators in `acceptance-rubric.md`.
- [ ] Verify Foundry/OpenAI token and evaluation usage stays within budget assumption.
- [x] Verify repository evidence maps to required and bonus hackathon criteria.

## 12. Evidence Package

- [ ] Capture Copilot Chat agent invocation screenshot.
- [ ] Capture role-based recommendations grounded in work context summaries.
- [ ] Capture proposal created in Foundry Floor.
- [ ] Capture Risk Gate with controls.
- [ ] Capture Review Queue with pending item.
- [ ] Capture approved and released capability.
- [ ] Capture Signal Atlas with released workflow.
- [ ] Capture MCP Activity Rail.
- [ ] Capture unauthorized rejection.
- [ ] Capture anti-surveillance refusal.
- [ ] Capture Azure deployment URLs.
- [ ] Capture sanitized Application Insights evidence.
- [ ] Capture cost posture evidence from `architecture-cost-plan.md`.
- [ ] Capture desktop, tablet, and mobile frontend screenshots.
- [ ] Capture one end-to-end demo video when feasible.
- [ ] Create final demo run notes.
- [ ] Update judge evidence checklist with links to every artifact.

## 13. Final Readiness

- [ ] Run final local validation.
- [ ] Run final deployed validation.
- [ ] Deploy judge-ready MCP server and frontend.
- [ ] Confirm final Azure URLs work.
- [ ] Confirm Copilot package points to the intended endpoint.
- [ ] Confirm screenshots and logs contain no secrets or raw tenant content.
- [ ] Confirm final build prompt, OpenSpec, demo script, and evidence package are aligned.
- [ ] Complete Checkpoint G verification and commit.
- [ ] Produce final summary with local commands, Azure URLs, commit checkpoints, deployment checkpoints, verification results, evidence locations, and remaining tenant-dependent manual steps.
