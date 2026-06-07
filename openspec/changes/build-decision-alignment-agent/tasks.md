# Tasks: Build Decision & Alignment Agent

## 1. Spec And Architecture

- [x] Create OpenSpec proposal.
- [x] Define Azure service boundary.
- [x] Define MCP tool contract.
- [ ] Confirm target path: Declarative Agent first, Custom Engine optional.
- [ ] Confirm tenant/subscription availability.
- [ ] Add judge evidence map and 9.8+ grading checklist.
- [ ] Decide whether optional Azure AI Foundry/Azure OpenAI calls are needed for the demo.

## 2. Microsoft 365 Agent

- [ ] Scaffold Declarative Agent with Microsoft 365 Agents Toolkit.
- [ ] Add agent instructions for decision debt and alignment risk detection.
- [ ] Configure Microsoft 365 knowledge/context sources appropriate for the demo tenant.
- [ ] Add MCP action generated from the external MCP server.
- [ ] Package and sideload agent into developer tenant.
- [ ] Add agent prompts for confidence scoring, uncertainty disclosure, and human review.
- [ ] Add judge-facing demo prompts for unresolved decisions, alignment conflicts, and executive brief generation.

## 3. External MCP Server

- [ ] Build TypeScript/Node.js MCP server.
- [ ] Implement `search_decisions`.
- [ ] Implement `create_decision`.
- [ ] Implement `update_decision_status`.
- [ ] Implement `search_alignment_risks`.
- [ ] Implement `create_alignment_risk`.
- [ ] Implement `create_follow_up`.
- [ ] Implement `generate_alignment_brief`.
- [ ] Implement `generate_alignment_map`.
- [ ] Implement `create_evidence_packet`.
- [ ] Implement `score_signal_confidence`.
- [ ] Implement `submit_human_review`.
- [ ] Add validation, tenant scoping, and audit logging.
- [ ] Add JSON schemas for every MCP request and response.
- [ ] Add idempotency keys for mutation tools.

## 4. Azure Deployment

- [ ] Create isolated resource group.
- [ ] Create Entra app registration for MCP OAuth.
- [ ] Create Key Vault.
- [ ] Create storage for synthetic registry data.
- [ ] Create Application Insights and Log Analytics.
- [ ] Deploy MCP server to Azure Container Apps or Azure App Service.
- [ ] Configure secrets and environment variables.
- [ ] Configure correlation IDs and dashboard queries for demo observability.
- [ ] Optional: deploy Azure API Management in front of the MCP server.
- [ ] Optional: deploy Azure OpenAI or Azure AI Foundry resources for structured analysis.

## 5. Demo Content

- [ ] Create synthetic projects, meetings, decisions, and alignment risks.
- [ ] Create sample Teams/email/document context in developer tenant.
- [ ] Write demo script for unresolved decision discovery.
- [ ] Write demo script for alignment conflict discovery.
- [ ] Create sample executive alignment brief output.
- [ ] Create sample Alignment Map output.
- [ ] Create sample evidence packet and review queue output.
- [ ] Prepare screenshots and submission README.

## 6. Validation

- [ ] Verify users only see data they are authorized to access.
- [ ] Verify mutation tools require confirmation.
- [ ] Verify registry writes are audit logged.
- [ ] Verify no secrets or tenant-specific sensitive values are committed.
- [ ] Verify hackathon submission evidence maps to required and bonus criteria.
- [ ] Run golden scenarios against synthetic data.
- [ ] Run adversarial tests for prompt injection, unsupported claims, and overconfident findings.
- [ ] Grade the solution against the 9.8+ rubric and close any score gates below target.

## 7. Frontend Demo Console

- [ ] Build frontend shell with navigation for Alignment Map, Registries, Evidence, Review Queue, Executive Brief, and Demo Command Center.
- [ ] Build Alignment Map graph component.
- [ ] Build Decision Registry and Alignment Risk Registry tables.
- [ ] Build Evidence Packet drawer.
- [ ] Build Human Review Queue workflow.
- [ ] Build Executive Brief page.
- [ ] Build Demo Command Center timeline showing Copilot prompt, MCP call, registry write, audit event, and map update.
- [ ] Add loading, empty, unauthorized, error, and success states.
- [ ] Add responsive layout for desktop presentation and mobile screenshots.
- [ ] Add Playwright screenshot checks for the main demo views.

## Parallel Workstreams

Use these workstreams to build fast without blocking each other. Keep interfaces stable by freezing MCP schemas and synthetic data fixtures first.

| Workstream | Owner Profile | Can Start After | Outputs | Blocks |
| --- | --- | --- | --- | --- |
| A. Agent Scaffold | Microsoft 365 engineer | Target path confirmed | Declarative Agent package, instructions, conversation starters | Final sideload/demo |
| B. MCP Server Core | TypeScript backend engineer | MCP schemas drafted | Tool handlers, validation, registry store, audit logs | Agent actions, frontend live data |
| C. Frontend Demo Console | Frontend engineer | Synthetic schemas drafted | Alignment Map, registry console, review queue, evidence drawer | Judge demo polish |
| D. Azure/Identity | Cloud engineer | Resource boundary confirmed | Resource group, Entra app, Key Vault, hosting, observability | OAuth/live deployment |
| E. Synthetic Demo Data | Demo/content owner | Scenario selected | Meetings/docs/chats, registry fixtures, demo scripts | Agent grounding, frontend fixtures |
| F. Security/Validation | Security reviewer | Schemas and auth plan drafted | Threat checks, secret scan, permission tests, adversarial prompts | Submission readiness |
| G. Submission Package | Technical storyteller | Demo flow stable | README, screenshots, evidence map, pitch script | Final judging |

Critical path:

1. Freeze schemas and fixtures.
2. Build MCP server and frontend against fixtures in parallel.
3. Scaffold Declarative Agent and wire MCP action.
4. Deploy MCP server and auth.
5. Run end-to-end demo, then polish screenshots and evidence.

Do not wait for Azure deployment to build the frontend. The frontend should run locally from fixture data first, then switch to live MCP-backed data when available.

## LLM Task Assignment Matrix

Use these assignments for build-time planning and optional runtime analysis. The baseline Declarative Agent runtime does not expose direct temperature or reasoning controls; those rows use the configured Microsoft 365 Copilot behavior.

| Task | LLM role | Best model | Temperature | Reasoning |
| --- | --- | --- | ---: | --- |
| Confirm target path | Architecture decision reviewer | GPT-5.5 for build review; Azure OpenAI `gpt-5.5` if kept inside Azure | 0.1 | high |
| Confirm tenant/subscription availability | Cloud deployment planner | GPT-5.5 for build review | 0.0 | medium |
| Judge evidence map and 9.8+ checklist | Hackathon judge simulator | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.2 | high |
| Decide optional Foundry/OpenAI usage | Architecture/security reviewer | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.1 | high |
| Scaffold Declarative Agent | Microsoft 365 agent engineer | Codex GPT-5.5 or GPT-5.3 Codex | 0.2 | high |
| Agent instructions | Prompt architect | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.2 | high |
| Microsoft 365 context configuration | Microsoft 365 integration engineer | GPT-5.5 | 0.1 | high |
| MCP action generation | MCP integration engineer | GPT-5.5 or GPT-5.3 Codex | 0.1 | high |
| Package and sideload | Release engineer | GPT-5.5 or GPT-5.3 Codex | 0.0 | medium |
| Confidence and uncertainty prompts | Responsible AI reviewer | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.1 | high |
| Judge-facing demo prompts | Executive demo strategist | GPT-5.5 | 0.4 | medium |
| Build MCP server | TypeScript backend engineer | GPT-5.3 Codex or GPT-5.5 | 0.2 | high |
| `search_decisions` | Backend tool engineer | GPT-5.3 Codex | 0.1 | medium |
| `create_decision` | Backend tool engineer | GPT-5.3 Codex | 0.1 | high |
| `update_decision_status` | Backend tool engineer | GPT-5.3 Codex | 0.1 | high |
| `search_alignment_risks` | Backend tool engineer | GPT-5.3 Codex | 0.1 | medium |
| `create_alignment_risk` | Backend tool engineer | GPT-5.3 Codex | 0.1 | high |
| `create_follow_up` | Workflow engineer | GPT-5.3 Codex | 0.1 | medium |
| `generate_alignment_brief` | Executive communicator | Azure OpenAI `gpt-5.5` or `gpt-5.4-mini` | 0.3 | medium |
| `generate_alignment_map` | Data visualization engineer | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.2 | high |
| `create_evidence_packet` | Audit evidence engineer | Azure OpenAI `gpt-5.5` | 0.0 | high |
| `score_signal_confidence` | Evidence analyst | Azure OpenAI `gpt-5.5`; fallback `gpt-5.4-pro` | 0.1 | high |
| `submit_human_review` | Workflow engineer | GPT-5.3 Codex | 0.1 | medium |
| Validation, tenant scoping, audit logging | Security engineer | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.0 | high |
| JSON schemas | Schema engineer | GPT-5.3 Codex | 0.0 | medium |
| Idempotency keys | Reliability engineer | GPT-5.3 Codex | 0.0 | high |
| Azure resource group | Cloud engineer | GPT-5.5 or GPT-5.3 Codex | 0.0 | medium |
| Entra app registration | Identity engineer | GPT-5.5 | 0.0 | high |
| Key Vault | Cloud security engineer | GPT-5.5 | 0.0 | medium |
| Registry storage | Data engineer | GPT-5.3 Codex | 0.0 | medium |
| App Insights and Log Analytics | Observability engineer | GPT-5.5 | 0.0 | medium |
| Deploy MCP server | Platform engineer | GPT-5.3 Codex | 0.1 | high |
| Configure secrets | Cloud security engineer | GPT-5.5 | 0.0 | high |
| Correlation IDs and dashboards | Observability engineer | GPT-5.5 | 0.1 | medium |
| Optional API Management | API platform engineer | GPT-5.5 | 0.0 | medium |
| Optional Azure OpenAI/Foundry | AI platform engineer | GPT-5.5 | 0.1 | high |
| Synthetic data | Synthetic enterprise data designer | GPT-5.5; optional Azure OpenAI `gpt-5.4-mini` | 0.7 | low |
| Sample M365 context | Demo content producer | GPT-5.5 | 0.5 | medium |
| Unresolved decision demo script | Demo strategist | GPT-5.5 | 0.4 | medium |
| Alignment conflict demo script | Demo strategist | GPT-5.5 | 0.4 | medium |
| Executive brief sample | Executive communicator | Azure OpenAI `gpt-5.5` or GPT-5.5 | 0.3 | medium |
| Alignment Map sample | Visualization designer | GPT-5.5 | 0.4 | medium |
| Evidence packet sample | Audit reviewer | Azure OpenAI `gpt-5.5` | 0.1 | high |
| Submission README/screenshots | Technical storyteller | GPT-5.5 | 0.3 | medium |
| Permission verification | Security tester | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.0 | high |
| Mutation confirmation verification | Safety tester | GPT-5.5 | 0.0 | high |
| Audit logging verification | Security tester | GPT-5.5 | 0.0 | high |
| Secret scanning | Security tester | GPT-5.3 Codex | 0.0 | high |
| Required/bonus evidence verification | Hackathon judge simulator | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.1 | high |
| Golden scenarios | QA engineer | GPT-5.5 | 0.1 | high |
| Adversarial tests | Red-team reviewer | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.2 | high |
| 9.8+ rubric grading | Contrarian judge | GPT-5.5; optional Azure OpenAI `gpt-5.5` | 0.1 | high |
| Frontend shell | Product frontend engineer | GPT-5.5 or GPT-5.3 Codex | 0.2 | high |
| Alignment Map graph component | Data visualization engineer | GPT-5.5 | 0.3 | high |
| Registry tables | Product frontend engineer | GPT-5.3 Codex | 0.1 | medium |
| Evidence Packet drawer | Enterprise UX engineer | GPT-5.5 | 0.2 | medium |
| Human Review Queue | Workflow UX engineer | GPT-5.5 | 0.2 | high |
| Executive Brief page | Executive communication designer | GPT-5.5 | 0.3 | medium |
| Demo Command Center | Hackathon demo designer | GPT-5.5 | 0.4 | high |
| Frontend states | Resilience UX engineer | GPT-5.3 Codex | 0.1 | medium |
| Responsive layout | Responsive frontend engineer | GPT-5.3 Codex | 0.1 | medium |
| Playwright screenshot checks | QA automation engineer | GPT-5.3 Codex | 0.0 | medium |

Before invoking optional Azure model calls, confirm the deployment supports the selected parameter set. If temperature is unsupported for a chosen deployment, omit it and keep the assigned role and reasoning level.
