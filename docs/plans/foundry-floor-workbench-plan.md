# Foundry Floor Workbench — Implementation Plan

Restructure the Foundry Floor from four competing columns into a master–detail
workbench, move the portfolio lanes to the Release Pipeline page, and group the
nav by persona. Every fact below was verified against the working tree on
2026-06-12 (branch `main`, post-`b20e6a3`). Where the implementer must consult
a file, the plan says READ — do not code those parts from this document alone.

## Ground truth (verified)

Current composition, `apps/foundry-floor/src/App.tsx`:

- `FoundryFloor` renders `.floor-grid` with: `CapabilityList` | `.floor-center`
  (`ReleasePipeline detailed` → factory lanes, `SignalAtlas compact`, a
  `copilot-proof` panel showing the latest live checkpoint) | `.right-stack`
  (`RiskGate`, `ReleasePacketDrawer`) | `McpActivityRail` (global, all records).
- Props it receives: `records, selected, selectedId, onSelect, activity,
  packets, reviews, riskReviews, checkpoints, onOpenMirror`.

Component signatures (in `apps/foundry-floor/src/panels.tsx` unless noted):

- `CapabilityList({ records, selectedId, onSelect })` — renders one `<button>`
  per record with title + status/risk line, plus an `.empty-state` paragraph.
- `RiskGate({ selected, riskReviews, compact? })` — includes the
  `AdvisoryAnalysis` section (`.advisory-analysis`).
- `ReleasePacketDrawer({ selected, packets, reviews })`.
- `McpActivityRail({ compact?, proofMode?, items })` — list of
  `article` entries; each `McpActivity` item has `recordId`, `action`,
  `actor`, `status`, `correlationId`, `summary`
  (type at `packages/shared/src/types.ts:131` region).
- `ReleasePipeline({ selected, detailed })` in `visuals.tsx` — `detailed`
  switches `releaseStages` → `factoryStages` (the "01 Ingest…07 Monitor"
  lanes).
- `LeftRail({ activeView, onView, records, filters, onFiltersChange })` —
  flat 8-item nav + brand + context card + conditional `.filter-stack`
  (renders only for floor/atlas/pipeline/review).

Record/ID semantics that matter for scoping (verified in
`apps/mcp-server/src/tools.ts` + `audit.ts`):

- Activity `recordId` is the proposal id for `create_capability_proposal`,
  `score_capability_risk`, `submit_capability_review`; it is the **capability
  id** (`cap-…`) for `approve_capability` and `release_capability`. A single
  workflow therefore spans TWO record ids. Record-scoped trails must match
  `item.recordId === selected.id` OR `item.correlationId` equal to any
  correlation seen on the selected record's risk review / packet. Implement
  the simple union: `recordId === selected.id || correlationId ===
  riskReview?.correlationId || correlationId === packet?.correlationId`.
- Capability status order for the mini stepper:
  `proposed → risk_scored → in_review → approved_for_release → released`
  (`capabilityStatusSchema`, `packages/shared/src/schemas.ts`). `rejected` and
  `blocked` render as terminal warning states, not stepper progress.

Test dependencies on the Floor (READ the specs before editing them):

- `tests/e2e/golden-flow.spec.ts:137-140` — clicks nav "Foundry Floor",
  asserts the proposal-title button, the text "MCP Activity", and
  "release_capability" visible. After this change, "MCP Activity" +
  "release_capability" live in the global audit drawer → the spec must click
  the new drawer toggle (give it `aria-label="Open audit trail"`) before those
  two assertions. Note: `release_capability` activity carries the `cap-…`
  recordId, so it will NOT appear in the record-scoped trail of the selected
  proposal — it must be asserted in the global drawer, not the detail pane.
- `tests/e2e/portal-qa-sweep.spec.ts` — asserts on the Floor: search
  aria-label `Search synthetic records`, empty-state text
  `No records match the current search and filters.`,
  `.advisory-analysis` visible, `Stage: Pending Review` filter with
  `aria-pressed`. Preserve all of these: keep the same aria-labels, class
  names, and empty-state copy.
- `tests/e2e/theme-sweep.spec.ts` — probes `.capability-list` on the Floor and
  `.release-pipeline` on the Pipeline view. Keep both class names mounted.

## Workstream A — master–detail workbench (owner: lead)

New file `apps/foundry-floor/src/Workbench.tsx` + `workbench.css` (import the
css from `main.tsx`, after `views.css` so light-mode overrides can win).

Layout: `.workbench-grid { grid-template-columns: minmax(240px, 300px)
minmax(0, 1fr); }`.

- Left: existing `CapabilityList` unchanged (preserves test selectors).
- Right `.workbench-detail`, scoped to `selected`:
  1. Header row: title, `status-pill` (reuse `statusLabels`/`riskLabels` from
     `data.ts`), owner/department, and `MiniStepper` — five dots/segments from
     the status order above; current status highlighted amber, passed teal,
     `rejected`/`blocked` render a single red terminal chip instead.
  2. `RiskGate selected riskReviews` (full, not compact — it is the main
     content now).
  3. `ReleasePacketDrawer selected packets reviews`.
  4. "This record's trail": `McpActivityRail compact items={scopedActivity}`
     using the union filter defined above; if empty, render the existing
     `.empty-state` pattern with copy "No recorded activity for this record
     yet."
- The `copilot-proof` panel (latest live checkpoint + Open mirror link) moves
  into the detail column header area as a slim strip — keep its
  `status-pill` Live/Demo logic exactly as-is (it is live-data proof).
- Global audit drawer: a right-side overlay (`.audit-drawer`, fixed, ~380px,
  full height, closable) containing `McpActivityRail items={activity}`
  (global, full). Toggle button in the Floor detail header:
  `aria-label="Open audit trail"`, icon `Activity` (lucide, already imported
  in panels.tsx — import it in Workbench.tsx separately). Closed by default.
  Plain conditional render + CSS transform transition with a
  `prefers-reduced-motion` guard, matching the patterns in `judge.css`.
- `SignalAtlas` leaves the Floor entirely (it has its own page; the judge
  story owns the narrative graph).
- App.tsx: `FoundryFloor` is replaced by `Workbench` with the same props minus
  none — keep the prop names identical to minimize the diff.

Light/dark: every new class gets a `.light-mode` variant in `workbench.css` in
the same pass (use the value pairs already established in `judge.css`:
dark `var(--panel)`/`var(--line)`, light `oklch(0.985 0.006 205)` /
`oklch(0.84 0.026 210)`). The theme sweep is the gate, not a suggestion.

## Workstream B — factory lanes move to the Pipeline page (owner: lead)

In `App.tsx` `PipelineView`: it already renders `ReleasePipeline detailed` +
`.pipeline-columns` record cards — it keeps the lanes and remains the
portfolio view. The Floor simply stops rendering `ReleasePipeline` (covered by
Workstream A). No changes to `visuals.tsx` stage arrays. Result: lanes appear
exactly once, on the page named for them.

## Workstream C — persona-grouped nav (owner: agent `nav-sections`)

Files: `apps/foundry-floor/src/panels.tsx` (LeftRail only) +
`apps/foundry-floor/src/styles.css` (append only).

Replace the flat `items` array with three groups rendered as
`<p class="nav-section">` labels + buttons (button markup, classes, and
`onView` behavior unchanged — nav tests use `getByRole("button", { name })`):

- "For judges": judge, deck
- "Workspace": floor, review, mirror
- "Insight": atlas, pipeline, executive

`.nav-section { color: var(--steel); font-size: 0.66rem; letter-spacing:
0.08em; text-transform: uppercase; margin: 10px 0 2px; }` plus a `.light-mode`
variant. Do not touch the brand lockup, context card, or filter stack. Do not
modify any other component in panels.tsx.

## Workstream D — tests, gates, deploy (owner: lead)

1. Update `golden-flow.spec.ts` per the drawer note above; update
   `portal-qa-sweep.spec.ts` only where the Floor structure moved (the
   advisory assertion now lives in `.workbench-detail`); keep every preserved
   selector literal.
2. Gates, in order, all green before commit: `npm --prefix <repo> run
   typecheck` (0 errors) → `apps/foundry-floor run build` → `npm run
   test:e2e` twice consecutively → visual review of
   `evidence/screenshots/theme-{light,dark}-foundry-floor.png` (no scroll at
   1080p in the detail column for the default selection; if the detail stack
   exceeds the viewport, the record trail collapses to its 4 most recent
   entries with a count badge — implement that fallback only if needed).
3. `npm run validate` (full chain incl. readiness gate — it greps source
   files; if it fails, fix the drift, never the gate).
4. Commit (lead authority), push `main`, deploy
   `bash <repo>/scripts/deploy.sh --apply --deploy-static`, verify the served
   `index-*.js` hash matches `dist/` and contains "workbench".

## Assignments

| Workstream | Owner | Role | Effort | Temp |
| --- | --- | --- | --- | --- |
| A workbench layout + drawer + stepper | Fable 5 (lead) | UX architect + frontend lead | High | 0.1 |
| B lanes consolidation | Fable 5 (lead) | Frontend lead | Low | 0.1 |
| C nav sections | agent `nav-sections` (Sonnet-class) | Frontend engineer | Medium | 0.2 |
| D spec updates + gates + deploy | Fable 5 (lead) | QA + release | Medium–High | 0.0–0.1 |
| Pre-commit diff review | independent reviewer (Opus-class) | Reviewer | High | 0.0 |

Sequencing: A and C in parallel (disjoint files: lead owns App.tsx,
Workbench.tsx, workbench.css, main.tsx; agent owns panels.tsx LeftRail +
styles.css append). B inside A's App.tsx pass. D after both land. Agents do
not commit; the lead integrates, reviews the combined diff, commits once.

## Anti-hallucination rules

- READ before editing: App.tsx (FoundryFloor + PipelineView regions),
  panels.tsx (component signatures), both affected spec files, and
  `judge.css` light-mode value pairs. Quote-match `old_string`s from the live
  file, never from this plan.
- No `cd`; absolute paths; `npm --prefix`.
- Preserve verbatim: `Search synthetic records`, `No records match the
  current search and filters.`, `.advisory-analysis`, `.capability-list`,
  `.release-pipeline`, `Stage: Pending Review`, nav button names.
- New strings introduced by this plan (use them exactly so specs and code
  agree): `aria-label="Open audit trail"`, empty-trail copy `No recorded
  activity for this record yet.`, class names `.workbench-grid`,
  `.workbench-detail`, `.audit-drawer`, `.nav-section`, `.mini-stepper`.

## Rollback

Single revert of the integration commit restores the current Floor; redeploy
static. No backend, schema, or evidence changes anywhere in this plan.
