# Signal Foundry — Final Wrap-Up Execution Prompt (v1.0)

**Objective:** Take Signal Foundry to a production-ready, hackathon-winning state. Every screen functional, every button wired, true E2E from Copilot → MCP → console, all global engineering rules satisfied. Run to 100% completion without stopping for confirmation; self-verify each task against its acceptance criteria before moving on.

**Today:** 2026-06-14 (submission deadline 11:59 PM PT). **Repo root:** `/Users/mattgraves/Development/hackathon-enterprise`. **Git remote:** `centrix-labs/signal-foundry` — pushing `main` here is allowed (this is NOT a `ditinc` remote; the ditinc prohibition does not apply).

---

## Non-negotiable global rules (enforce throughout)

1. **Max 575 LOC per source file.** (`GLOBAL_ENGINEERING.md:13`)
2. **No co-author trailers in commits.** (`GLOBAL_ENGINEERING.md:11`) — do NOT add `Co-Authored-By`.
3. **Work from repo root only.** No `cd`, no `pushd`, no subshell-cd. Use `npm --prefix /abs/path`, `git -C`, absolute paths.
4. **Read before edit.** Read the entire target region before changing it. If you self-correct mid-analysis, stop and re-read cleanly.
5. **Never echo secrets.** SWA deploy token via `az staticwebapp secrets list --query properties.apiKey -o tsv > /private/tmp/claude-swa-token.txt`, deploy with `--deployment-token "$(cat /private/tmp/claude-swa-token.txt)"`, then `rm` it. Report only lengths, never values.
6. **Output reads as human-authored engineering work.** Match surrounding code style, comment density, naming.
7. Do not touch `evidence/videos/vo/*` — those deletions are pre-existing and not ours.

---

## Verified ground truth (confirmed from code — do not re-derive)

**Frontend** (`apps/foundry-floor/src`):
- `liveData.ts` reads the live registry via `GET ${apiBase}/registry/snapshot` with header `x-sf-actor-id: actor-alex`, polling every 15 s. `apiBase` default = `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io` (overridable via `VITE_SIGNAL_FOUNDRY_API_BASE`). **There is currently no mutation/POST helper — the console only reads.**
- The MCP server exposes `POST /tools/:toolName` (auth via `x-sf-actor-id` header). This is the path for live mutations from the console.
- `App.tsx` `useDemoState` decision handlers:
  - `requestChanges()` (109–112) — correct, no navigation.
  - `saveForLater()` (114–117) — correct, no navigation.
  - `approveRelease()` (119–124) — **BUG:** lines 122–123 call `setDemoStep(judgeStages.length - 1)` and `setActiveView(... "judge")`, which yanks the user back to Guided Story. These two lines must be removed.
- `ReleasePacketDrawer` (`panels.tsx:568–575`) renders a **hardcoded** artifact list `["Workflow spec", "Risk assessment", "Data-flow diagram", "Runbook"]` with `v1.{index} / synthetic` and **no way to open/view them**.

**Shared types** (`packages/shared/src/types.ts:114–126`): `ReleasePacket` has fields `id, capabilityId, version, owner, approvedAudience, approvedSourceTypes, requiredHumanReview, usageGuidance, reviewer, releasedAt, correlationId`. **There is NO `artifacts` field.**

**MCP server** (`apps/mcp-server/src/tools.ts`):
- `release_capability` (361–389) is the only tool that **creates** a packet (pushes into `registry.releasePackets`), requires `capability.status === "approved_for_release"`, sets status `released`. It does NOT generate document artifacts — only `usageGuidance`, owner, audience, reviewer, correlation.
- `generate_release_packet` (68–69) is **read-only** (fetches an existing packet by `capabilityId`).
- Both tools are exposed to the Copilot declarative agent. **Release packet is created at the release step (end of lifecycle), after human approval.**

**LOC violations (limit 575):** `panels.tsx` 1127, `App.tsx` 783, `CopilotMirror.tsx` 736, `visuals.tsx` 665.

---

## Tasks

### T1 — Fix Approve & Release navigation (the reported bug)

**File:** `apps/foundry-floor/src/App.tsx`, `approveRelease()` (119–124).
**Change:** Remove lines 122–123 (`setDemoStep(...)` and `setActiveView(...)`). Keep `setSelectedStatus("released")` and `setDecisionState("released")`. Result: clicking Approve & Release on the Review Queue updates the decision banner + status to **Released** and the user **stays on the Review Queue** (matches the already-correct behavior of `requestChanges`/`saveForLater`).

**Acceptance:** From Review Queue, select a pending item → Approve & Release → view remains Review Queue; decision banner shows Released; the item's status pill reads Released; left-list status filter reflects it. Verify the same for Request Changes (→ Rejected, stays) and Save for Later (→ In Review, stays).

### T2 — Confirm/repair every Review Queue button

**File:** `apps/foundry-floor/src/panels.tsx` (`ReviewQueue`).
**Do:** Trace every interactive element and confirm it performs its action with correct state + no console errors:
- Status filter (Pending default / Approved / Rejected / All) — filters the left list; counts correct.
- Pager (Show 5/10/20; ‹ › nav; range label) — paginates; clamps at bounds; resets to page 1 on filter change.
- Left-list item select — loads that record into the right detail; selection highlight correct.
- Decision bar: Approve & Release, Request Changes, Save for Later — each sets the right status + banner and **does not navigate** (post-T1).
- Right tabs: Risk Gate / Release Packet / MCP Activity — switch panels; panel scrolls internally; MCP Activity paginates.

Fix any dead/incorrect handler. No `onClick` may be a no-op or log-only.

**Acceptance:** Manually exercise each control in a real browser (Playwright MCP). Zero console errors. Every button changes visible state as specified. Empty states render when a filter yields no items.

### T3 — Release Packet artifacts become real, viewable synthetic documents

**Decision (grounded in the type system):** `ReleasePacket` has no `artifacts` field and the Container App is already deployed; adding a server artifact field + redeploy is out of scope and unnecessary for a synthetic-tenant demo. Generate the artifacts **deterministically on the frontend from real packet + capability + risk-review data**, and make each one **openable** in a document view.

**Implement:**
- A `releaseArtifacts.ts` module (frontend) that, given a `Capability` + its `ReleasePacket` (+ matching `RiskReview` when available), produces 4 documents — **Workflow Spec, Risk Assessment, Data-Flow Diagram (text/ASCII or structured), Runbook** — with content derived from the record (title, owner, audience, approved source types, risk level, usage guidance, correlation ID). No lorem ipsum; every field must trace to real record data. Mark provenance as "Synthetic — production-shaped" honestly.
- Replace the hardcoded list at `panels.tsx:568–575` so each artifact row is a **button** that opens the generated document (modal/drawer or expandable panel), with version + provenance, scrollable, closable, keyboard-dismissable (Esc), focus-managed.

**Acceptance:** On any released capability's Release Packet tab, all 4 artifacts are clickable and open readable, record-accurate content. Content changes per capability (not static). Works for every released record in the live snapshot and the sample data fallback.

### T3b — True E2E: console Approve & Release calls the real MCP (so Copilot→MCP→console is testable from the UI)

**Why:** Today the console button is demo-only (local state). To test "E2E from Copilot all the way through," add a live mutation path so the UI button exercises the real server, while staying resilient offline.

**Implement:**
- Add a mutation helper in `liveData.ts` (or a sibling `liveActions.ts`): `POST ${apiBase}/tools/approve_capability` then `POST ${apiBase}/tools/release_capability` with header `x-sf-actor-id: actor-alex`, correct request bodies (capabilityId, version, audience, releasedBy, idempotencyKey, correlationId per the tool schemas in `tools.ts`).
- Wire `approveRelease()` to call the live path **when the dashboard is live** (`isLive`), then optimistically update local state; on failure or when not live, fall back to the existing demo state (no crash, no dead UI). The 15 s snapshot poll will then reflect the server-side packet.
- Keep it idempotent (stable `idempotencyKey`) so repeated clicks don't duplicate packets.

**Acceptance:**
- Live: clicking Approve & Release on an `approved_for_release` record results in a real `release_capability` write; within one poll cycle the snapshot shows status `released` and a real packet; console reflects it. Manually confirmable from Copilot too: driving `release_capability` from the agent makes the packet appear in the console.
- Offline / non-live: button still works against demo state, no errors.
- Document the E2E test path (Copilot → approve → release → console) in `docs/submission/`.

### T4 — Production-readiness sweep

- No dead buttons/links anywhere (Foundry Floor, Review Queue, Release Pipeline, Executive, Copilot Mirror, Architecture, Walkthrough, top bar account menu). Every control has a real effect or is removed.
- Empty states for every paginated/filtered list (Registry, Review Queue, Audit View, MCP Activity, Pipeline columns).
- Numbers reconcile across screens (Executive ↔ Review Queue ↔ Pipeline ↔ Highlights) — already wired; re-verify after T1–T3b.
- a11y: focusable controls, visible focus rings, Esc closes overlays, aria-labels on icon-only buttons, color-contrast on the (already-darkened) Risk Gate step names.
- No unhandled promise rejections / console errors / React key warnings in a full click-through.

**Acceptance:** Full Playwright MCP walkthrough of every screen with the console open shows zero errors and every interactive element behaving.

### T5 — LOC refactor (satisfy the 575 rule) — do this LAST, after behavior is correct

Split each over-limit file by cohesive responsibility, preserving behavior and public exports (pure mechanical extraction, no logic change):
- `panels.tsx` (1127) → e.g. `Pager`/rail/topbar, `CapabilityList`+`RiskGate`, `ReleasePacketDrawer`+`releaseArtifacts` view, `ReviewQueue`, `ExecutiveView` into separate modules each < 575.
- `App.tsx` (783) → extract `useDemoState`, `PipelineView`, view-routing into modules.
- `CopilotMirror.tsx` (736) and `visuals.tsx` (665) → split along existing component seams.

**Acceptance:** `find apps/foundry-floor/src -name '*.tsx' -o -name '*.ts' | xargs wc -l` shows **every** file ≤ 575. `npm --prefix apps/foundry-floor run build` passes. No behavior change vs. pre-refactor (re-run the T4 walkthrough).

---

### T6 — Verify against the official Agents League regulations (so the solution is NOT discarded)

Source of truth: `https://github.com/microsoft/Agents-League-AISF-Regulations`. Verify each item; **fix any gap found** and record the result in `docs/submission/compliance-check.md`.

**Mandatory entry requirements (a miss here = discarded):**

1. **Microsoft IQ integration (REQUIRED — at least one of Foundry IQ / Work IQ / Fabric IQ).** Signal Foundry's claim is **permission-aware Work IQ-style grounding** (M365 Copilot People/Meetings context) **plus Azure AI Foundry advisory reasoning** — documented in `docs/submission/work-iq-foundry-readiness.md`. **Verify it is actually wired and demonstrable**, not just documented: the declarative agent enables People + Meetings grounding; the README + SUBMISSION.md state the IQ integration explicitly; the demo shows it. **Do not overclaim** (no raw Graph/Work IQ API ingestion — keep the "sanitized/synthetic Work IQ-style summaries only" framing). Overclaiming hurts Accuracy & Reliability/Safety scoring.
2. **Public GitHub repo + README** — confirm `README.md` exists, is current, and names the track (Enterprise Agents / M365 Copilot), the IQ used, setup, and architecture. Repo must be public at submission.
3. **Demo video** — confirm a working demo video is present/linked (`evidence/videos/*.mp4` exist) and that the README/SUBMISSION link to it.
4. **Disclaimer — NO confidential/sensitive information.** Scan the entire tracked tree: no real secrets, keys, tokens, connection strings, real tenant data, PII, or internal Microsoft/customer info. Synthetic tenant only. Confirm only `.env.example` templates are tracked (no real `.env`); confirm `evidence/azure/key-vault-secret-metadata.json` contains **names/lengths/metadata only, never values** (open it and verify). Remove anything that violates this and rotate if needed.
5. **Code of Conduct compliance** — content and conduct compliant.
6. **Registration (USER ACTION — flag, cannot self-complete):** the team must be registered at `aka.ms/agentsleague/aisf` for official status + prize eligibility. Surface this as a required manual step in the completion report.

**Map the build to the judging rubric (100 pts)** — confirm the submission narrative + demo evidence each criterion, and note where T1–T5 strengthen them:
- Accuracy & Relevance 20% — grounded, cited, no hallucination; deterministic risk gate.
- Reasoning & Multi-step Thinking 20% — Risk Gate multi-step reasoning, Foundry advisory path, governed lifecycle.
- Creativity & Originality 15% — governance-layer angle, Copilot Mirror, Signal Atlas.
- User Experience & Presentation 15% — the 9.5–10 UI bar this wrap-up targets (T1–T4 directly).
- Reliability & Safety 20% — human-in-the-loop approval, anti-surveillance refusal, no-raw-content policy, audit trail, idempotency (T3b).
- Community Vote 10% — Discord (USER ACTION — flag).

**Acceptance:** `docs/submission/compliance-check.md` written, every mandatory requirement marked met (with file/evidence reference) or fixed; user-action items (registration, Discord vote) clearly flagged in the completion report; no confidential data anywhere in the tracked tree.

## Self-verification protocol (run before declaring done)

1. **Typecheck + build:** `npm --prefix apps/foundry-floor run build` (and lint if present) — clean.
2. **Unit/server tests:** run the MCP server test suite — green.
3. **LOC gate:** every `src` file ≤ 575.
4. **Live browser walkthrough (Playwright MCP):** every screen, every button, console open, zero errors; confirm T1–T4 acceptance criteria visually (bounding-rect/scrollHeight checks where overflow matters).
5. **E2E proof:** demonstrate the Copilot→MCP→console release path and capture it in `docs/submission/`.
6. **Diff review:** read the full diff; confirm no co-author trailers, no secrets, no debug logging left behind.
7. **Regulation gate (T6):** `docs/submission/compliance-check.md` shows every mandatory entry requirement met; Microsoft IQ integration verified demonstrable and not overclaimed; no confidential data in the tracked tree; user-action items flagged.

## Deploy & commit (final step)

- Build the frontend, deploy to SWA `swa-signal-foundry` (RG `rg-signal-foundry-hackathon`) via `@azure/static-web-apps-cli` using the token-file pattern; `rm` the token after; verify `https://red-coast-0b0c14e0f.7.azurestaticapps.net` serves the new build.
- Commit in logical chunks (T1/T2, T3/T3b, T4, T5) with clear messages, **no co-author trailer**, and push `main` to `centrix-labs/signal-foundry`.
- Post a short completion report: what changed, verification results (build/tests/LOC/walkthrough), the live URL, and the E2E proof location.

**Definition of done:** All acceptance criteria met, every file ≤ 575 LOC, build + tests green, live site updated, E2E from Copilot proven, zero dead UI, zero console errors, **and all official Agents League regulations verified (T6) — Microsoft IQ integration confirmed, public repo + README + demo video present, no confidential data, registration/Discord flagged as user actions.**
