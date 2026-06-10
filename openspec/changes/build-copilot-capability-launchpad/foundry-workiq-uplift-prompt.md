# 9.8+ Uplift Build Prompt: Foundry Reasoning + Work IQ Grounding

You are a senior full-stack Microsoft 365 Copilot, MCP, Azure, and frontend product engineer. Signal Foundry's P0 build is complete and deployed. This prompt covers the final competitive uplift: wire real Microsoft intelligence into the runtime. Azure AI Foundry advisory reasoning and Work IQ grounding are NOT optional in this pass — they are the point of the solution in this hackathon. Build to completion without stopping at plans.

## Mission

Convert Signal Foundry from "deterministic governance with synthetic context" into "deterministic governance arbitrating real Microsoft AI reasoning over real work context":

1. Azure AI Foundry model produces an advisory multi-step risk deliberation for every scored proposal. The deterministic risk gate remains the source of truth and visibly arbitrates.
2. Work IQ grounding is wired into the declarative agent so role-based recommendations are grounded in the user's actual work context through the Copilot surface — never through raw content passthrough.
3. The judge-facing demo surface is hardened: functional UI controls, an end-to-end Playwright golden-flow test, and contract-level enforcement of the confirmation gate.
4. Copilot Chat responses render branded Adaptive Card templates for the high-value moments (risk verdict, proposal receipt, recommendations, release packet) via `response_semantics` in the plugin manifests — designed structure inside the Copilot surface, not plain text.

Winning narrative addition:

> An LLM reasons about risk. A deterministic gate decides. A human approves. When they disagree, you see it.

## Current State (verified 2026-06-10)

Do not rebuild what exists. Verified state of the repo and deployment:

- 47/50 tasks in `tasks.md` complete. All 15 P0 acceptance gates implemented; 7+ of 9 P1 differentiators captured.
- MCP server (Express + TypeScript + Zod) live at `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io` with 12 tools, deterministic risk gate, role-based access, idempotency keys, correlation IDs, audit log, and 14 passing integration tests plus 5 risk-gate unit tests.
- Foundry Floor (React + Vite) live at `https://red-coast-0b0c14e0f.7.azurestaticapps.net` with Floor, Atlas, Pipeline, Review Queue, Copilot Mirror, and Executive views.
- Copilot agent package v0.1.2: declarative agent manifests at v1.6, action manifests at plugin schema v2.4 (RemoteMCPServer runtime referenced by the agent; OpenApi runtime as fallback), `capabilities.confirmation` already present on every function, `validDomains` already includes both deployed hosts.
- Evidence harness: `npm run validate` chains openspec validate → typecheck → tests → `validate:evidence` → `validate:copilot`, all green.

Open items this prompt must close or precisely report as tenant-blocked:

- `tasks.md` line 73/222: sideload + Copilot Chat invocation screenshot (tenant-access dependent).
- `tasks.md` line 75: Work IQ-grounded recommendation screenshot (sideload dependent).
- `tasks.md` line 231: anti-surveillance refusal capture (NOT blocked — close it in Workstream 7).
- Advisory Foundry reasoning and Work IQ grounding: previously cut as P2, now required (Workstreams 1-2).

## Session Bootstrap (turn zero, before any change)

1. Confirm working directory is `/Users/mattgraves/Development/hackathon-enterprise` and current branch is `codex/signal-foundry-build`. Create and switch to a new branch `claude/foundry-workiq-uplift` for this pass. Never push to `main`.
2. Run the baseline: `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate`. It must be green before any edit. Record the baseline test count — it is the floor for every later checkpoint.
3. Doc freshness gate: the schema facts in this prompt were verified 2026-06-10. Re-fetch the Microsoft Learn pages listed in Workstream 6 and the DA manifest page in Workstream 2. If any schema version, field name, or capability has changed since, write the corrections to `apps/copilot-agent/docs/schema-verification.md` with URLs and dates, and implement against the corrected facts — the live docs win over this prompt's snapshot. If nothing changed, note "verified current" with today's date in the same file.
4. Read the Source Material list. Then begin at Workstream 5.1 per the Implementation Order.

## Research Discipline

Ground every platform-facing decision in current official documentation, not memory:

- Microsoft surfaces (declarative agent schema, plugin manifest, Adaptive Cards, Agents Toolkit): verify against the Microsoft Learn URLs listed in Workstream 6 and the declarative-agent docs before each edit.
- Azure AI Foundry / Azure OpenAI: verify current API version strings, SDK package names, and model availability in the target subscription/region (`az cognitiveservices model list` or portal) before provisioning or coding the client. Do not hardcode a model name from memory.
- When documentation and observed runtime behavior disagree, trust runtime output, record the discrepancy in the relevant `docs/` file, and proceed with the verified behavior.
- Record the doc URL for any non-obvious schema or API decision in the commit message or adjacent doc so reviewers can re-verify.

## Build-Agent Model Assignments (Claude)

Use Claude agents for this uplift. Current model IDs: Fable 5 (`claude-fable-5`), Opus 4.8 (`claude-opus-4-8`), Sonnet 4.6 (`claude-sonnet-4-6`), Haiku 4.5 (`claude-haiku-4-5-20251001`). Principles: the strongest model owns anything touching safety claims, Microsoft schema fidelity, or money (Azure); the reviewer is always a different model than the implementer; never downgrade model quality for security, manifest, or deployment work. Temperature applies only when driving agents via the API/Agent SDK — inside Claude Code, reasoning effort and thinking depth are the levers; treat the effort column as binding everywhere.

| Workstream | Task | Role | Model | Temp | Effort | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Foundry advisory module, arbitration logic, Key Vault wiring | Lead backend + security engineer | Fable 5 | 0.1 | high | Owns the "deterministic gate is source of truth" invariant; writes the degradation tests itself |
| 1 | Risk Gate advisory/disagreement UI | Senior product engineer | Sonnet 4.6 | 0.2 | medium | Must match existing visual system; screenshot-verify both states |
| 2 | Declarative agent capabilities + instructions (Work IQ) | M365 Copilot agent engineer | Fable 5 | 0.1 | high | Doc-grounded only; every manifest field verified against Learn before edit |
| 2 | Docs research (DA schema, capability names, API versions) | Docs researcher | Sonnet 4.6 | 0.1 | medium | Produces ResearchPack with URLs; flags UNCONFIRMED items; no implementation |
| 3 | Foundry Floor filters + search | Frontend engineer | Sonnet 4.6 | 0.2 | medium | Client-side only; no layout regressions; desktop + mobile screenshots |
| 4 | Playwright golden-flow E2E | QA engineer | Sonnet 4.6 | 0.1 | medium | Deterministic selectors; must pass from fresh `/admin/reset` twice in a row |
| 5.1 | `confirmed: z.literal(true)` schema gate + tests | Backend contracts engineer | Sonnet 4.6 | 0.0 | high | Small diff, contract-critical; update all affected tests in same pass |
| 5.2-5.4 | Env docs, path parameterization, README fixes | Maintenance engineer | Haiku 4.5 | 0.1 | low | Mechanical; lead verifies via `npm run validate` before commit |
| 6 | Plugin manifest `response_semantics` wiring + runtime verification cycle | M365 Copilot agent engineer | Fable 5 | 0.1 | high | Verified schema fields only; owns the MCP-vs-OpenApi runtime decision |
| 6 | Adaptive Card templates (layout, bindings, copy) | Product engineer + visual designer | Sonnet 4.6 | 0.2 | medium | AC 1.5, single column, `${if(...)}` guards; binds only real response fields |
| 7 | Evidence closure, demo-run notes, judge-evidence remap | QA / evidence lead | Sonnet 4.6 | 0.1 | medium | Validator-green before claiming done; exact prompts for tenant-blocked captures |
| 7 | Judge narrative and demo script wording | Product storyteller | Sonnet 4.6 | 0.3 | medium | Prose only; never touches code, evidence JSON, or manifests |
| All | Azure provisioning + deployment (Foundry resource, Container App env) | Azure platform engineer | Fable 5 | 0.1 | high | Blast radius + rollback declared before every apply; cost-guarded |
| All | Pre-commit security/architecture review | Independent reviewer | Opus 4.8 | 0.0 | high | Different model than implementer by design; reviews diffs, not intentions; blocks on secret/raw-content findings |
| All | Lead integration: shared contracts, commits, checkpoint gates | Lead integrator | Fable 5 | 0.1 | high | Sole authority for commits and checkpoint sign-off |

Temperature guidance is unchanged from `model-task-matrix.md`: 0.0-0.1 for security, schemas, manifests, validation; 0.2-0.3 for UI polish and prose; never high-temperature generation for anything that lands in registry writes, manifests, or evidence.

## Source Material

Read before building:

- `/Users/mattgraves/.llm/GLOBAL_ENGINEERING.md`
- `/Users/mattgraves/.llm/REVIEW_PROTOCOL.md`
- `/Users/mattgraves/Development/hackathon-enterprise/openspec/changes/build-copilot-capability-launchpad/proposal.md`
- `/Users/mattgraves/Development/hackathon-enterprise/openspec/changes/build-copilot-capability-launchpad/acceptance-rubric.md`
- `/Users/mattgraves/Development/hackathon-enterprise/openspec/changes/build-copilot-capability-launchpad/final-9-8-build-prompt.md`
- `/Users/mattgraves/Development/hackathon-enterprise/openspec/changes/build-copilot-capability-launchpad/judge-evidence.md`
- `/Users/mattgraves/Development/hackathon-enterprise/packages/shared/src/types.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/packages/shared/src/schemas.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/packages/shared/src/mcpTools.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/apps/mcp-server/src/risk.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/apps/mcp-server/src/tools.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/apps/mcp-server/src/server.ts`
- `/Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/panels.tsx`
- `/Users/mattgraves/Development/hackathon-enterprise/apps/copilot-agent/package/` (all declarative agent and action JSON)

The repo root is `/Users/mattgraves/Development/hackathon-enterprise`. Older docs reference `~/Documents/hackathon-enterprise`; treat `Development` as canonical and fix stale paths you touch (README local-dev commands included).

## Autonomy and Safety Rules

All rules from `final-9-8-build-prompt.md` remain in force. The ones that bind hardest here:

- Deterministic risk scoring stays the source of truth. Foundry output is advisory wording and advisory reasoning only. The advisory result must never change a deterministic verdict, status transition, or required control.
- The runtime must never hard-depend on the Foundry endpoint. Timeout, degrade to `advisory unavailable`, and continue. The golden demo must pass with advisory mode off.
- Never send raw Microsoft 365 content, PII, secrets, or registry internals beyond the proposal's own synthetic fields to the model. The advisory prompt contains only: proposal title, description, role, department, risk input fields, and deterministic verdict.
- Never log or render raw model output without sanitization. Strip anything matching the existing unsafe-content patterns in `scripts/validate-evidence.mjs` before storing or displaying advisory text.
- API keys live in Azure Key Vault or arrive via managed identity. Never in `.env` committed files, never echoed, never in screenshots. Follow the global secret-handling rules exactly.
- Work IQ grounding flows through the Copilot surface (declarative agent capabilities). The MCP server never receives raw M365 content — only the agent's permission-aware summaries shaped to the existing `get_user_work_context` contract.
- Verify current Microsoft schema and API behavior against official docs before editing the declarative agent JSON or calling Foundry endpoints. Do not code from memory: declarative agent schema versions, capability names, and Azure OpenAI API versions change.
- Before creating any Azure resource, declare blast radius and rollback. Resource group `rg-signal-foundry-hackathon`, subscription `YOUR-AZURE-SUBSCRIPTION-ID`, region `eastus2`.
- Work from the repository root with absolute paths. No `cd`.

## Workstream 1 (P0): Azure AI Foundry Advisory Risk Deliberation

Goal: every `score_capability_risk` call attaches an advisory reasoning trace produced by an Azure AI Foundry-deployed model, displayed beside the deterministic verdict, with visible arbitration.

Backend:

1. Provision (or reuse) an Azure AI Foundry / Azure OpenAI resource in `rg-signal-foundry-hackathon`, `eastus2`. Deploy one small chat model (latest available small/mini tier — verify availability with `az cognitiveservices model list` in the subscription/region before choosing; do not pick from memory) at the minimum capacity the deployment tier allows. Auth decision (do not re-litigate): managed identity is primary — assign the Container App's system identity the `Cognitive Services OpenAI User` role on the resource; fall back to a Key Vault secret reference only if the identity path is blocked in-tenant, and document which path shipped. Capture endpoint and deployment name. Cost guardrails are mandatory: exactly one advisory call per `score_capability_risk` invocation, at most one retry, `max_tokens` ≤ 800 on every call, no background or speculative calls anywhere, and a one-line cost note in `azure-deployment.md` (deployment tier, capacity, expected per-call token ceiling).
2. New module `apps/mcp-server/src/advisory.ts`:
   - `generateAdvisoryRiskAnalysis(proposal, deterministicResult): Promise<AdvisoryRiskAnalysis>`
   - Calls the Foundry deployment with temperature ≤ 0.2, a strict system prompt, and a JSON response contract: `{ summary, steps: [{ signal, concern, suggestedControl }], suggestedRiskLevel }`.
   - Hard timeout of 6 seconds. On timeout, error, or missing config, return `{ status: "unavailable" }`. Never throw into the tool handler.
   - Sanitize all returned strings (length caps, unsafe-content pattern strip) before returning.
3. Env contract (document in `apps/mcp-server/.env.example` with placeholder values only):
   - `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry|off` (default `off` locally, `foundry` in Azure)
   - `SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT`
   - `SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT`
   - `SIGNAL_FOUNDRY_FOUNDRY_API_VERSION`
   - Key via Key Vault reference / managed identity only.
4. Shared types and schema: extend `RiskReview` with optional `advisory` field — `{ status: "available" | "unavailable", model, summary, steps, suggestedRiskLevel, agreesWithGate, generatedAt }`. `agreesWithGate` is computed by deterministic comparison, not by the model.
5. `score_capability_risk` handler in `tools.ts`: run deterministic gate first (unchanged), then attach advisory result. The proposal status transition must complete identically whether advisory is available or not. Record an MCP activity entry noting advisory status with correlation ID; never record raw model output in activity or audit logs — summary only after sanitization.

Frontend (Foundry Floor):

6. Risk Gate panel gains an "Advisory Analysis" section: model name, step list (signal → concern → suggested control), and a clearly labeled banner: `Advisory only — the deterministic risk gate is the source of truth.`
7. When `agreesWithGate` is false, render a visible arbitration callout: advisory suggested X, deterministic gate ruled Y, gate wins. This disagreement view is a judge differentiator — make it legible in screenshots, amber-accented, consistent with the existing visual system.
8. When advisory is unavailable, show a quiet `Advisory unavailable — deterministic verdict stands` state, not an error.

Copilot agent:

9. Update declarative agent instructions: when relaying risk results, the agent states the deterministic verdict first, may summarize the advisory reasoning, and must label it advisory. Never present advisory output as the decision.

Tests:

10. Unit tests for `advisory.ts` with a mocked Foundry client: success shape, timeout degradation, sanitization, `agreesWithGate` computation. Integration test asserting `score_capability_risk` completes with `SIGNAL_FOUNDRY_ADVISORY_MODE=off`.

## Workstream 2 (P0): Work IQ Grounding in the Declarative Agent

Goal: recommendations in Copilot Chat are grounded in the user's real work context via Work IQ through the Copilot surface, with the synthetic path retained as local/demo fallback.

1. Research before any manifest edit — this step gates the rest of the workstream. Run the docs-researcher pass against the declarative agent manifest schema docs, starting from the `capabilities` section of `https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.7` (and the 1.6 page, since the repo manifests are v1.6). The ResearchPack must enumerate, with URLs: the exact capability object `name` values for work-context grounding (people/org, email, Teams messages, OneDrive/SharePoint), each capability's required and optional scoping fields, which of them exist in v1.6 vs require v1.7, and any licensing notes. Only then edit `declarative-agent.azure.json` (mirror in `.local.json` where valid), scoped as narrowly as each capability's schema allows. If a needed capability requires v1.7, upgrade the manifest `version` and `$schema` as part of this workstream and re-validate — do not stay on v1.6 by inertia or upgrade without need.
2. Update agent instructions for the grounded path:
   - Use work context to infer role, team, active projects, and recurring workflows when recommending capabilities.
   - Summarize; never quote, echo, or reproduce raw email, chat, meeting, or document content in any response or tool argument.
   - Pass only summary-shaped fields into MCP tools, matching the existing `get_user_work_context` output contract.
3. `get_user_work_context` in `tools.ts`: accept an optional agent-supplied context summary input (schema-validated, summary fields only, length-capped) that overrides the synthetic mapping when present. Synthetic fallback stays for local demo and tests. Tool description in `mcpTools.ts` updated to state the no-raw-content contract explicitly.
4. `recommend_capabilities_for_role`: when a work-context summary is supplied, recommendations must reference it in their rationale fields (e.g., matched signals), so the grounding is visible in the Copilot Mirror and MCP Activity Rail.
5. Package and version-bump the Copilot agent (`validate:copilot` must pass). Document the sideload + Work IQ verification steps in `apps/copilot-agent/docs/`.
6. Evidence: after sideload, capture the role-based recommendation screenshot showing work-context grounding (closes tasks.md line 75) and the Copilot Chat invocation screenshot (closes line 222). If tenant access is still blocked, complete everything sideload-independent and report the exact remaining manual steps — do not fake the screenshots.

## Workstream 3 (P0): Functional Foundry Floor Controls

Judges click things. Dead controls in a polished UI read as a staged demo.

1. `apps/foundry-floor/src/panels.tsx:62-66` — make the Role / Department / Stage filter buttons functional client-side filters over the already-loaded capability and proposal data. Toggling updates the list, the pipeline view, and the Signal Atlas highlight state where feasible.
2. `apps/foundry-floor/src/panels.tsx:97` — replace the readOnly hardcoded search input with live substring search across capability name, role, and department. Empty state message when nothing matches.
3. Keep the visual language identical to the existing system. No layout regressions; verify desktop and mobile screenshots after the change.

## Workstream 4 (P1): Playwright Golden-Flow E2E

1. `tests/playwright.config.ts` exists; the suite is empty. Add `tests/e2e/golden-flow.spec.ts` against the local stack (MCP server + Foundry Floor, started via existing dev scripts or a webServer config block):
   - Reset golden scenario via `/admin/reset`.
   - Drive the API through propose → score (assert advisory field present or `unavailable`) → submit → approve → release.
   - Assert Foundry Floor reflects the released state, release packet fields, and MCP activity entries.
   - Assert the unauthorized actor path renders the sanitized rejection.
2. Add `test:e2e` script at the root. It must not break `npm run validate` when browsers are absent in CI-less environments — keep it a separate script, documented in `tests/README.md`.

## Workstream 5 (P1): Contract Hardening and Repo Hygiene

1. `packages/shared/src/schemas.ts`: make `confirmed: z.literal(true)` required on every mutation tool input so the confirmation gate is enforced at the contract layer, not only at runtime (`tools.ts:29`). Update tests asserting schema rejection of unconfirmed writes.
2. `apps/mcp-server/.env.example`: add all live env vars with placeholder values — registry mode, storage account/connection-string guidance, `SIGNAL_FOUNDRY_SYNTHETIC_OAUTH_ACTOR_ID`, and the new advisory variables. Placeholders only; never real values.
3. Replace hardcoded absolute repo paths with `process.cwd()`-relative or env-driven resolution in `apps/mcp-server/src/store.ts:6`, `scripts/seed.ts`, `scripts/reset.ts`, `tests/evidence-validation.test.ts`, `tests/playwright.config.ts`, `scripts/audit-final-readiness.mjs`.
4. Fix README local-development paths (`~/Documents/...` → actual repo root) and add a short "Advisory reasoning + Work IQ grounding" section explaining the arbitration model in three sentences.

## Workstream 6 (P1): Adaptive Card Response Templates in Copilot Chat

Goal: the agent's key responses render as branded, structured Adaptive Cards inside Copilot Chat instead of plain text. This is the only sanctioned way to put designed UI inside the Copilot surface; do not build or imitate a custom chat UI.

### Documentation grounding (read these before editing any manifest or card)

All schema facts below were verified against Microsoft Learn on 2026-06-10. Re-verify each page before implementation — schema versions and capability behavior change:

- Plugin manifest schema 2.4: `https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-manifest-2.4`
- Adaptive Card response templates for API plugins: `https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api-plugin-adaptive-cards`
- Confirmation prompts for MCP and API plugins: `https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/plugin-confirmation-prompts`
- Declarative agent manifest 1.7: `https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.7`
- Adaptive Cards template language: `https://learn.microsoft.com/en-us/adaptive-cards/templating/language`
- Microsoft 365 Agents Toolkit CLI (`atk`): `https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli`

Do not invent fields. If a field or behavior is not on these pages, treat it as unsupported.

### Current repo state (verified)

- Both action manifests are already `schema_version: "v2.4"`: `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json` (runtime `RemoteMCPServer` — the one the declarative agent references) and `actions/signal-foundry-api.azure.json` (runtime `OpenApi`), plus their `.local.json` twins.
- Every function already has `capabilities.confirmation` (type `AdaptiveCard`, with `isNonConsequential: true` on reads). Confirmation work is DONE — do not rework it; only add `response_semantics` alongside.
- `manifest.json` `validDomains` already includes `red-coast-0b0c14e0f.7.azurestaticapps.net` and the Container App domain, so `Action.OpenUrl` to Foundry Floor is permitted without manifest surgery.
- Declarative agent manifests are `v1.6`. Upgrading to `v1.7` is optional and out of scope unless a needed feature requires it.

### Schema contract (plugin manifest v2.4, verified fields only)

Per function, add under `capabilities`:

```json
"response_semantics": {
  "data_path": "$",
  "properties": { "title": "$.title", "subtitle": "$.status" },
  "static_template": { "file": "./adaptivecards/<card-name>.json" }
}
```

- `data_path` (required): JSONPath (RFC 9535, `$.` syntax) selecting the element set from the function's JSON response; one card renders per matched item (e.g. `"$.recommendations"` renders a card per recommendation).
- `properties` (optional): JSONPath relative to each matched item; supported subfields are `title`, `subtitle`, `url`, `thumbnail_url`, `information_protection_label`, `template_selector`. These drive citation rendering.
- `static_template`: inline Adaptive Card JSON, or (v2.4+) a `{ "file": "./relative/path.json" }` reference. Use file references — keep manifests small, cards reviewable.
- Cards: `"type": "AdaptiveCard"`, `"$schema": "http://adaptivecards.io/schemas/adaptive-card.json"`, `"version": "1.5"`, bindings via `${field}` and template-language functions (`${if(x, x, 'N/A')}`, `"$data": "${$root}"`).
- Allowed actions: `Action.OpenUrl` only (target domain must be in `validDomains`). `Action.Execute` is preview — do not use it; everything else (Action.Submit etc.) is undocumented for plugin response templates and therefore banned here.
- Layout rules from the official guidance: single-column, no fixed widths, no text+image side-by-side except icons/avatars, `wrap: true` on TextBlocks.

### Cards to build

Create `apps/copilot-agent/package/adaptivecards/` with four templates, dark-graphite-compatible but legible on light Copilot backgrounds (cards render on the host theme — design for both):

1. `risk-verdict.json` — for `score_capability_risk`. Deterministic verdict (level + rationale + required controls), advisory summary with explicit "Advisory only — deterministic gate is source of truth" footer text, agreement/disagreement line bound to `agreesWithGate`, correlation ID. This is the flagship card; it must work with `advisory.status = "unavailable"` (use `${if(...)}` guards).
2. `proposal-receipt.json` — for `create_capability_proposal`. Proposal ID, title, role/department, status, correlation ID, next-step line.
3. `recommendation.json` — for `recommend_capabilities_for_role`. `data_path` targets the recommendations array so each renders its own card: name, why-it-matches rationale (work-context signals when present), risk posture, approval status.
4. `release-packet.json` — for `release_capability` / `generate_release_packet`. Version, owner, reviewer, approved audience, controls, released-at, correlation ID, and one `Action.OpenUrl` button "Open Foundry Floor" to the deployed Static Web App URL.

Bind only fields that exist in the actual tool response shapes in `packages/shared/src/mcpTools.ts` / the server handlers — open those files and match field names exactly. If a card needs a field the response lacks (e.g. a flat `title` for citations), extend the tool RESPONSE shape in the MCP server first, with tests; never invent bindings.

### Runtime caveat — verify before building all four

`response_semantics` is documented for API plugins (OpenApi runtime). The declarative agent currently references the `RemoteMCPServer`-runtime action. The confirmation doc covers "MCP and API plugins", but an explicit statement that static templates render for MCP-runtime functions does not exist in the docs (UNCONFIRMED).

Mandatory sequence:
1. Add `response_semantics` to ONE function (`score_capability_risk`) in BOTH action manifests (`.azure` and `.local`, mcp and api variants).
2. Package, validate, sideload, and verify in Copilot Chat whether the card renders via the MCP-runtime action.
3. If MCP-runtime rendering works: proceed with the remaining three cards in both manifests.
4. If it does not: switch the declarative agent's `actions` entry to the OpenApi action manifest (`signal-foundry-api.azure.json`) for the demo path, document the decision and the doc gap in `apps/copilot-agent/docs/`, and proceed. Do not burn more than one verification cycle guessing.
If sideload access is still blocked, stop after step 1 across all four cards' authoring (cards + manifests complete and validated locally) and report card rendering as a tenant-dependent verification step.

### Validation and packaging

- Extend `scripts/validate-copilot-package.mjs`: every `response_semantics.static_template.file` resolves and parses; every card is `version: "1.5"` with the adaptivecards $schema; every `Action.OpenUrl` domain appears in `manifest.json` `validDomains`; every `data_path`/`properties` JSONPath is non-empty and starts with `$`.
- Validate the package with the Agents Toolkit CLI: `npm install -g @microsoft/m365agentstoolkit-cli`, then `atk validate --manifest-file <abs path to manifest.json> --validate-method validation-rules` and `atk package` (absolute paths, run from repo root). Record the output in evidence.
- Bump the agent package version once, together with the Workstream 2 changes (single sideload cycle).
- Sanitization rule applies to cards: no secrets, no raw M365 content, no internal endpoints beyond the already-public demo URLs.

## Workstream 7 (P0): Evidence Closure

These close the remaining judge-facing gaps. Items 1-3 have no external blockers — do them regardless of tenant access.

1. Anti-surveillance refusal (`tasks.md` line 231): exercise the refusal path end to end with the local stack — a monitoring-framed request (e.g. "rank my team members by productivity") must be refused and redirected per the agent instructions. Record the scenario in `evidence/signal-foundry-demo-evidence.json` so `validate:evidence` passes its anti-surveillance-refusal scenario checks, capture the Foundry Floor / local transcript evidence, and update `evidence/judge-evidence-checklist.md`. The in-Copilot-Chat screenshot remains sideload-dependent; everything else closes now.
2. Advisory disagreement demo: add a seeded proposal whose risk inputs reliably produce an advisory/gate disagreement, so the arbitration screenshot is reproducible after `/admin/reset`. Derive the inputs from the deterministic weights in `apps/mcp-server/src/risk.ts`, not by trial and error against the live model: pick a combination that lands just over a gate boundary while reading as benign in prose (e.g. low data sensitivity and no customer data, but high automation plus broad audience tipping the weighted sum) — the shape an LLM plausibly underrates. Verify the disagreement reproduces on 3 consecutive runs before recording the demo step; if the advisory agrees, adjust the seed inputs, never the gate. Document the step in the demo script.
3. Re-run the golden demo (local and deployed), refresh `evidence/demo-run-notes.md`, update the judge-evidence mapping for every new gate added by Workstreams 1-6, tick the completed `tasks.md` checkboxes, and run `scripts/audit-final-readiness.mjs`.
4. Sideload-dependent captures (Copilot Chat invocation, Work IQ-grounded recommendations, risk-verdict card, release-packet card, in-chat refusal): capture immediately once tenant access exists; until then list each as a precise manual step with the exact prompt to type and the expected screenshot content.
5. Tenant unblock playbook — work the blocker, don't just report it. In order: (a) check whether the existing Entra app registration tenant permits sideload via `atk install --file-path <package zip>` (Agents Toolkit handles upload; sideload must be enabled by the tenant admin); (b) if not, document the Microsoft 365 Developer Program sandbox-tenant path step by step (join, provision instant sandbox, enable custom app upload, `atk auth login` against the sandbox, `atk install`) in `apps/copilot-agent/docs/sideload-runbook.md`, flagging any step that needs the user's interactive login so they can execute it in minutes; (c) verify whether the sandbox tenant carries the Copilot license needed for declarative agents with work-context capabilities and record the answer with a doc URL — if it does not, the demo narrative falls back to the Copilot Mirror plus the validated sideload-ready package, and the runbook says exactly that. Outcome: either captures exist, or a runbook exists that a human can complete in one sitting. There is no third state.

## Implementation Order and Checkpoints

Order: Workstream 5.1 (schema gate) → 1 → 3 → 4 → 5.2-5.4 → 6 (card authoring + local validation) → 2 (grounding + single package bump covering 2 and 6) → sideload verification → 7 (evidence closure). Workstream 7 items 1-3 may interleave earlier whenever they unblock; do not leave them for last if sideload stalls. Commit after each checkpoint passes verification; do not push to `main`.

- Checkpoint H — Advisory core: advisory module + types + handler wiring done, unit and integration tests pass, golden flow passes with advisory off.
- Checkpoint I — Advisory live: Foundry resource deployed, Container App env wired via Key Vault, deployed `score_capability_risk` returns advisory content, Risk Gate panel renders agreement and disagreement states. Blast radius declared before the deploy; rollback is redeploy of previous revision + `SIGNAL_FOUNDRY_ADVISORY_MODE=off`.
- Checkpoint J — Demo surface: filters and search functional, E2E suite green locally, schema gate enforced, hygiene fixes in.
- Checkpoint K — Grounded agent with cards: Work IQ capabilities in the package, all four Adaptive Card templates authored and passing the extended `validate:copilot` plus `atk validate`, version bumped once, sideload docs updated, evidence captured or remaining tenant-dependent steps reported precisely (including MCP-runtime card rendering status per the Workstream 6 caveat).
- Checkpoint L — Evidence closed: anti-surveillance refusal recorded and validator-green, advisory disagreement reproducible from reset, demo-run notes and judge-evidence mapping current, `tasks.md` checkboxes updated, final-readiness audit passes, remaining sideload-dependent captures listed with exact prompts and expected content.

## Verification Commands

Run from the repository root with absolute paths. Do not claim a checkpoint without the corresponding output:

- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate` — full chain (openspec, typecheck, unit/integration tests, evidence validator, copilot package validator). Expected: exit 0, all five stages reported, zero skipped tests, test count ≥ the current 19 (14 server + 5 risk) plus every test added by Workstreams 1, 4, and 5.1.
- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e` — Playwright golden flow (after Workstream 4). Expected: green twice consecutively from fresh `/admin/reset`, no retries masking flakes.
- `atk validate --manifest-file /Users/mattgraves/Development/hackathon-enterprise/apps/copilot-agent/package/manifest.json --validate-method validation-rules` — agent package (after Workstream 6). Expected: zero errors; warnings triaged and noted. If `atk` cannot run in this environment (login/network), record that limitation and validate the JSON directly against the published schema URLs (plugin v2.4, DA v1.6/v1.7) with a JSON Schema validator instead — do not skip validation silently.
- `node /Users/mattgraves/Development/hackathon-enterprise/scripts/audit-final-readiness.mjs` — evidence completeness (Checkpoint L).
- Local golden demo: `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run dev:all`, reset via `/admin/reset`, drive the flow, confirm Foundry Floor state.
- Deployed smoke: existing smoke scripts against the Container App URL, advisory on and off.
- No-secret / no-raw-content scan over all new code, cards, evidence, and screenshots before every commit.

## Acceptance Gates

All previous P0 gates still hold, plus:

- Advisory reasoning visible in Risk Gate panel with explicit "advisory only" labeling and a demonstrable disagreement state.
- Golden demo passes with `SIGNAL_FOUNDRY_ADVISORY_MODE=off` and with `foundry`.
- No raw M365 content, PII, secrets, or unsanitized model output anywhere — `validate:evidence` and the unsafe-content scan pass.
- Declarative agent package validates with Work IQ grounding enabled; instructions forbid raw-content echo.
- Filter and search controls function; no dead interactive elements remain on the Floor.
- `npm run validate` fully green; E2E suite green locally.
- Deterministic gate outcomes are byte-identical with advisory on vs off (assert in a test).
- All four card templates exist, validate (extended `validate:copilot` + `atk validate`), bind only real response fields, use Adaptive Card 1.5 with `Action.OpenUrl` only, and the risk-verdict card renders correctly with advisory available AND unavailable.
- The MCP-runtime vs OpenApi-runtime card rendering decision is verified in-tenant or explicitly documented as the remaining tenant-dependent step — never assumed.
- Anti-surveillance refusal scenario recorded in evidence and validator-green; advisory disagreement reproducible from a fresh `/admin/reset`; final-readiness audit passes.

## Required Evidence Outputs

1. Risk Gate screenshot with advisory analysis, agreement state.
2. Risk Gate screenshot showing advisory/gate disagreement arbitration.
3. Copilot Chat invocation screenshot (sideload-dependent).
4. Work IQ-grounded recommendation screenshot (sideload-dependent).
5. E2E test run output.
6. Updated Azure deployment evidence including the Foundry resource (sanitized — no keys, no endpoints with embedded credentials).
7. Updated demo-run notes and judge-evidence mapping for the new gates.
8. Copilot Chat screenshot of the risk-verdict Adaptive Card showing the deterministic verdict, advisory section, and agreement state (sideload-dependent).
9. Copilot Chat screenshot of the release-packet card with the "Open Foundry Floor" action (sideload-dependent).
10. `atk validate` and extended `validate:copilot` output for the card-bearing package.

## Final Output

Report: what was built per workstream, verification results, commit checkpoints, Azure changes with rollback paths, evidence file locations, and the exact remaining tenant-dependent manual steps if sideload access is still blocked. No secrets, tokens, or raw model output in the report.
