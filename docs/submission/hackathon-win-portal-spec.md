# Signal Foundry Hackathon-Win Portal Spec

Date: 2026-06-11

## Objective

Raise the judge-facing Foundry Floor portal from a solid technical dashboard
to a near-10 hackathon demo surface. The portal must prove the submission story
in one glance:

`Microsoft 365 Copilot request -> Signal Foundry MCP tools -> deterministic risk gate -> human review -> release packet -> audit-safe evidence`

Target grade: 40/40. Success is not visual novelty alone; success is a judge
understanding the Copilot, governance, risk, approval, release, and audit story
within 10 seconds and seeing source-backed proof within 60 seconds.

## 40/40 Scoring Model

Use this rubric during implementation reviews. Do not claim 40/40 unless every
criterion below is satisfied by source, runtime output, or screenshot evidence.

| Category | Points | What Earns Full Credit | Evidence Required |
| --- | ---: | --- | --- |
| First-glance story | 5 | A judge can state the product story after 10 seconds: Copilot request becomes governed release evidence. | Desktop and mobile screenshots of Judge Mode first viewport. |
| Copilot proof | 5 | The UI clearly shows Microsoft 365 Copilot as the front door and shows how Copilot reaches Signal Foundry MCP. | Copilot Mirror proof panel plus Copilot package smoke test screenshot. |
| Governance correctness | 5 | The UI preserves confirmation, idempotency, actor, tenant, project, and correlation ID requirements without implying unauthorized writes. | MCP timeline rows tied to real tool names and existing data contracts. |
| Risk/advisory clarity | 5 | A non-technical judge can distinguish AI advisory reasoning from deterministic gate authority. | Risk Gate comparison card screenshot and existing risk review data. |
| Human review/release | 5 | Release is visibly blocked until human approval, and release packet evidence is visible after approval. | Review stage and release stage screenshots. |
| Audit-safe evidence | 5 | Evidence trail is readable, correlated, sanitized, and not log-noise. | MCP Evidence Timeline screenshot plus `validate:evidence` pass. |
| Visual distinctiveness | 5 | Signal Atlas is memorable, on-brand, and not a generic dashboard/card grid. | Judge Mode screenshot plus `impeccable` scan with no high-signal issues. |
| Accessibility/responsiveness | 5 | Light mode is screen-share readable, mobile is usable, text does not overlap, contrast is adequate. | Desktop/mobile screenshots plus typecheck/build/e2e checks. |
| **Total** | **40** | **All criteria met.** | **All listed evidence exists.** |

Score gates:

- 40/40: every row above is satisfied and verified.
- 36-39: demo is strong but one evidence or polish gap remains.
- 30-35: product is credible but still requires presenter explanation.
- Below 30: dashboard may be technically correct but is not judge-optimized.

## No-Hallucination Rules

Implementation must not invent product capabilities, Microsoft behavior, or
evidence. Every visible claim must be backed by one of these sources:

- Existing shared schemas and contracts under `packages/shared`.
- Existing MCP/API behavior under `apps/mcp-server`.
- Existing Copilot package manifests under `apps/copilot-agent/package`.
- Live or local registry data returned through `useDashboardData`.
- Evidence artifacts under `evidence/`.
- Submission docs under `docs/submission/`.
- Official Microsoft documentation when making platform claims.

Rules:

- Do not add claims like “Graph content indexed,” “tenant policy enforced,”
  “admin approved,” or “Copilot license active” unless verified from source or
  tenant runtime evidence.
- Do not show raw Microsoft 365 content, real customer data, secrets, tokens,
  personal contact details, or employee ranking/productivity output.
- Do not imply a mutation succeeded unless an existing Signal Foundry tool result
  or seeded evidence shows `ok: true` and the audit trail is verified.
- Do not create fake correlation IDs in UI copy. Use existing seeded values from
  `data.ts`, live MCP activity, or explicitly label examples as synthetic.
- Do not change security posture for visual polish. Confirmation, idempotency,
  actor, tenant, project, and correlation ID requirements are product facts.
- If a planned visual element needs data that does not exist, use one of:
  `Not yet verified`, `Synthetic demo context`, or `Unavailable in this tenant`.
  Do not fabricate a successful state.

Implementation review must include a short “claim audit” listing the visible
claims added and the source file, runtime response, or screenshot that supports
each one.

## Current State

Evidence reviewed:

- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/01-foundry-floor-live.png`
- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/02-copilot-mirror-with-atlas.png`
- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/03-signal-atlas.png`
- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/04-release-pipeline.png`
- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/05-review-queue.png`
- `evidence/demo-walkthrough/2026-06-11T12-22-08-267Z/06-light-executive.png`
- `docs/submission/SUBMISSION.md`
- `docs/submission/JUDGE-GUIDE.md`
- `.impeccable.md`

Strengths:

- The technical story is strong: Copilot, MCP, deterministic gate, human review,
  release packet, and audit trail are all represented.
- The Signal Atlas is distinctive and directly supports the brand metaphor.
- The live registry and MCP activity evidence make the product credible.

Current blockers to a 9.8+ score:

- First screen reads as a dense internal dashboard, not a guided judging story.
- Signal Atlas is memorable but not yet the dominant first-viewport moment.
- Risk/advisory evidence is hard to read and has low-contrast states.
- MCP Activity is too log-like for judges; it needs to read as proof.
- The current workflow requires the presenter to explain too much.
- Deterministic scan found one AI-design tell: `border-left: 3px solid var(--amber)` in `apps/foundry-floor/src/styles.css`.

## Design Principles

1. Copilot first. The portal visualizes what the Copilot agent did; it is not the primary product surface.
2. One guided story. The default route should behave like a demo director.
3. Atlas as artifact. Signal Atlas must be the unforgettable visual proof.
4. Audit-safe by default. No raw Microsoft 365 content, secrets, tokens, personal data, or surveillance framing.
5. Progressive disclosure. First screen shows the story; drawers and tabs show evidence.
6. Screen-share first. Light mode is the default judging mode; dark mode remains available.

## Phase 0: Package And Baseline Freeze

Goal: Lock the known-good Copilot package and current portal state before UI changes.

40/40 contribution:

- Protects Copilot proof, audit-safe evidence, and branding evidence from
  regressing while portal work proceeds.
- Does not increase score by itself; it prevents false-positive scoring.

Tasks:

- Commit or intentionally checkpoint current Copilot package work.
- Ensure current package is `evidence/copilot/signal-foundry-copilot-v015-light-avatar-20260611.zip`.
- Update stale references to older Copilot package versions, especially `docs/submission/JUDGE-GUIDE.md`.
- Record current validation baseline in the final PR or commit summary.

Acceptance criteria:

- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:copilot` passes.
- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:cards` passes.
- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:evidence` passes.
- `npm --prefix /Users/mattgraves/Development/hackathon-enterprise run typecheck` passes.

Rollback:

- Revert only the package-reference commit or restore the prior ZIP reference.

## Phase 1: Judge Mode Default View

Goal: Replace the dense default dashboard with a judge-readable guided proof mode.

40/40 contribution:

- First-glance story: up to 5/5.
- Copilot proof: up to 2/5 by making Copilot part of the default story.
- Visual distinctiveness: up to 1/5 by reducing generic dashboard density.

Primary route:

- Existing app default should open to `Judge Mode`, not the full `Foundry Floor` grid.
- Keep the full dashboard accessible from the nav as `Operations View` or `Dashboard`.
- Existing `Advance story` behavior should become the main Judge Mode stepper.

Required first viewport layout:

- Header: `Signal Foundry` plus short proof line: `Governed Copilot workflows from idea to approved release`.
- Stage stepper with five fixed stages:
  1. `Discover`
  2. `Propose`
  3. `Score`
  4. `Review`
  5. `Release`
- Large central `Signal Atlas` hero.
- Right-side proof rail with three compact proof cards:
  - `Copilot grounded` / `People + Meetings, summary-only`
  - `Risk gated` / `18 controls, deterministic verdict`
  - `Audit ready` / `correlation IDs, release packet`
- Bottom primary action:
  - `Run live proof` before the first step.
  - `Advance story` after the proof has started.

Detailed behavior:

- Stage 1 Discover: Highlight raw work signals entering Atlas from the left.
- Stage 2 Propose: Show proposed `Renewal Brief Generator` capability record.
- Stage 3 Score: Highlight amber risk gate and deterministic controls.
- Stage 4 Review: Show human reviewer pending/approved state.
- Stage 5 Release: Show release packet and outbound approved workflow tiles.

Files likely touched:

- `apps/foundry-floor/src/App.tsx`
- `apps/foundry-floor/src/panels.tsx`
- `apps/foundry-floor/src/visuals.tsx`
- `apps/foundry-floor/src/styles.css`
- `apps/foundry-floor/src/views.css`

Acceptance criteria:

- At 1440px desktop, the first viewport shows the full five-stage story without scrolling.
- At mobile width, the stage stepper, Atlas, and one proof card are visible before evidence details.
- Presenter can explain the product by pressing one button five times.
- No raw tenant data appears in any new copy.
- Claim audit maps every proof card to an existing source:
  - `People + Meetings` -> `apps/copilot-agent/package/declarative-agent.azure.json`.
  - `18 controls` -> existing risk/control data used by `RiskGate`.
  - `correlation IDs` -> existing MCP activity/release packet data.

Target score lift: +5 to +7.

## Phase 2: Signal Atlas Hero Upgrade

Goal: Make Signal Atlas the memorable demo artifact.

40/40 contribution:

- Visual distinctiveness: up to 4/5.
- First-glance story: reinforces 1/5 by making transformation visible.

Tasks:

- Increase Atlas canvas size in Judge Mode.
- Add direct in-canvas labels:
  - `Raw work signals`
  - `Signal Foundry`
  - `Risk gate`
  - `Approved workflows`
- Add visual emphasis to the amber risk gate node when stage is `Score`.
- Add visible flow lines from left to center to right.
- Add `No raw content` and `Summary-only` badges on inbound signal side.
- Add `Approved packet` badge on outbound side.
- Keep interactions available: clicking nodes should still select capabilities.

Motion:

- Use restrained flow animation on signal paths.
- Respect `prefers-reduced-motion`.
- Avoid decorative glow-heavy effects.

Acceptance criteria:

- Atlas remains legible in screenshots.
- The `Risk gate` is visually identifiable without reading surrounding panels.
- The visual metaphor matches the submission image: raw signals forged into approved workflows.
- Atlas labels do not claim data sources beyond what exists in current synthetic data.
- Flow animation works in normal mode and stops/reduces under `prefers-reduced-motion`.

Target score lift: +3 to +4.

## Phase 3: Risk Gate And Advisory Rewrite

Goal: Make the risk model understandable to a non-technical judge.

40/40 contribution:

- Risk/advisory clarity: full 5/5 if comparison is readable and source-backed.
- Governance correctness: up to 1/5 by reinforcing deterministic gate authority.

Replace the current low-contrast advisory block with a decision comparison:

- Left: `AI advisory`
  - `Suggested: Medium`
  - `Reason: renewal context is useful but sensitive`
- Right: `Deterministic gate`
  - `Decision: Human review required`
  - `Why it wins: policy controls are authoritative`
- Footer: `Release blocked until reviewer approval`

Controls list:

- Collapse routine passed controls by default.
- Keep warnings visible:
  - `PII handling constrained`
  - `Summary-only policy warning`
  - `Anti-surveillance refusal`

Acceptance criteria:

- No gray-on-gray unreadable advisory state.
- A judge can answer: “What did AI decide vs what did the deterministic gate decide?”
- Existing deterministic gate truth remains unchanged.
- Every advisory/gate value comes from existing `RiskReview` data or is explicitly
  labeled unavailable.
- Deterministic gate is always visually authoritative over advisory reasoning.

Target score lift: +2 to +3.

## Phase 4: MCP Activity As Evidence Timeline

Goal: Convert the MCP rail from logs into a judge-readable proof timeline.

40/40 contribution:

- Audit-safe evidence: full 5/5 if timeline is readable, sanitized, and correlated.
- Governance correctness: up to 3/5 by showing confirmation/idempotency/correlation proof.

Timeline rows:

1. `search_capabilities`
   - Proof: registry search used approved capability summaries.
2. `recommend_capabilities_for_role`
   - Proof: role recommendation used sanitized work context.
3. `create_capability_proposal`
   - Proof: write required idempotency key and confirmation.
4. `score_capability_risk`
   - Proof: deterministic controls applied.
5. `submit_capability_review`
   - Proof: human approval route started.
6. `release_capability`
   - Proof: release only after approval.
7. `list_mcp_activity`
   - Proof: audit trail verified.

Each row must show:

- Tool/event name.
- Human-readable proof sentence.
- Actor.
- Correlation ID.
- Status icon.

Acceptance criteria:

- Timeline tells the same story as Judge Mode.
- Correlation IDs are visible but not visually dominant.
- Unauthorized/rejected events are framed as safety proof, not app failure.
- Timeline uses actual tool/event names from existing static or live MCP activity.
- Timeline does not add tool names that are not present in `mcp-tools.json` or seeded evidence.
- Rejected/unauthorized events must include the reason as sanitized text only.

Target score lift: +2.

## Phase 5: Copilot Mirror Upgrade

Goal: Prove Microsoft 365 Copilot is the front door.

40/40 contribution:

- Copilot proof: remaining 3/5.
- Governance correctness: up to 1/5 by showing Copilot only passes sanitized summaries.

Tasks:

- Make Copilot Mirror a compact proof panel in Judge Mode, not a long chat transcript.
- Show a three-part bridge:
  - `User asks Copilot`
  - `Copilot calls Signal Foundry MCP`
  - `Signal Foundry returns governed result`
- Add proof badges:
  - `People`
  - `Meetings`
  - `OAuth`
  - `Summary-only`
  - `No raw M365 content`
- Keep the full chat transcript accessible behind `Open Copilot proof`.

Acceptance criteria:

- The Copilot relationship is visible without switching views.
- No fake raw Microsoft 365 content is displayed.
- The panel reinforces that the portal is evidence, not the primary interaction surface.
- Proof badges are backed by package manifest facts:
  - `People` and `Meetings` from declarative agent capabilities.
  - `OAuth` from `actions/signal-foundry-mcp.azure.json`.
  - `Summary-only` and `No raw M365 content` from agent instructions and tool schemas.

Target score lift: +2.

## Phase 6: Visual Polish And Anti-Pattern Removal

Goal: Remove distractions and make the interface feel designed, not generated.

40/40 contribution:

- Visual distinctiveness: final 1/5.
- Accessibility/responsiveness: up to 4/5.

Tasks:

- Remove `border-left: 3px solid var(--amber)` in `.advisory-arbitration`.
- Replace it with full-card tint, icon, or two-column comparison.
- Reduce identical card grids where possible.
- Strengthen contrast for disabled/muted text.
- Standardize proof badges and status pills.
- Use the light avatar mark consistently in:
  - sidebar brand lockup,
  - login/access screen,
  - Judge Mode header,
  - Copilot package `color.png`.
- Keep cards at 8px radius or less unless already established.
- Avoid adding decorative gradient orbs, bokeh, or unrelated illustrations.

Acceptance criteria:

- `npx impeccable --json /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src` returns no high-signal design anti-patterns or only documented false positives.
- Desktop screenshots look readable when scaled down in a judging deck.
- Mobile screenshots show no overlapping text or controls.
- Text contrast for primary labels, proof chips, stage labels, and advisory states is checked visually in screenshots.
- Cards are not nested inside other cards except where existing component boundaries require it and the visual treatment is flattened.

Target score lift: +2 to +3.

## Phase 7: Evidence Refresh

Goal: Update all submission evidence to reflect the new winning flow.

40/40 contribution:

- Human review/release: full 5/5 if review and release screenshots are captured.
- Accessibility/responsiveness: remaining 1/5 if mobile evidence is clean.
- Locks all score claims with evidence.

Tasks:

- Run local or deployed app and capture:
  - Judge Mode first screen.
  - Stage 3 risk gate.
  - Stage 4 review required.
  - Stage 5 release packet.
  - Copilot Mirror proof panel.
  - Mobile Judge Mode.
- Refresh walkthrough video.
- Update:
  - `docs/submission/SUBMISSION.md`
  - `docs/submission/JUDGE-GUIDE.md`
  - `docs/submission/MORNING-WALKTHROUGH.md`
  - `evidence/copilot/copilot-evidence-capture-runbook.md`
  - `evidence/demo-walkthrough/.../walkthrough-summary.md`

Acceptance criteria:

- Demo script starts with Judge Mode.
- Submission copy points to the exact proof flow.
- Evidence validator passes after new files are added.
- The final scorecard is filled out with links to the screenshots and commands that support each 40-point category.

Target score lift: +1 to +2.

## Engineering Guardrails

- Do not change MCP contracts unless a UI task explicitly requires it.
- Do not display raw Microsoft 365 content.
- Do not add surveillance/person-ranking features or labels.
- Do not weaken confirmation, idempotency, actor, tenant, project, or correlation ID requirements.
- Keep deterministic gate authoritative over advisory reasoning.
- Keep the existing live registry and local synthetic registry behavior.

## 40/40 Review Checklist

Before calling the work complete, fill out this checklist in the implementation
summary or PR body.

| Score Category | Required Proof | Status |
| --- | --- | --- |
| First-glance story | Judge Mode desktop screenshot, 10-second story visible | TODO |
| Copilot proof | Copilot Mirror proof panel screenshot and Copilot upload smoke test | TODO |
| Governance correctness | Timeline rows map to real tool names and required write fields | TODO |
| Risk/advisory clarity | Screenshot showing advisory vs deterministic gate comparison | TODO |
| Human review/release | Screenshots for review-required and released packet stages | TODO |
| Audit-safe evidence | MCP Evidence Timeline screenshot and `validate:evidence` pass | TODO |
| Visual distinctiveness | Signal Atlas hero screenshot and `impeccable` scan result | TODO |
| Accessibility/responsiveness | Desktop + mobile screenshots, no overlap, readable contrast | TODO |

Required claim audit format:

```text
Visible claim: <exact UI copy>
Source: <file path, runtime response, screenshot, or official doc>
Risk if wrong: <what would mislead a judge>
Status: verified | synthetic demo context | not yet verified
```

Required final score format:

```text
First-glance story: /5
Copilot proof: /5
Governance correctness: /5
Risk/advisory clarity: /5
Human review/release: /5
Audit-safe evidence: /5
Visual distinctiveness: /5
Accessibility/responsiveness: /5
Total: /40
```

Do not write `40/40` unless all eight categories are exactly `5/5` and each
has linked proof.

## Validation Commands

Run before committing:

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run typecheck
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:evidence
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:copilot
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:cards
```

Run after major UI work:

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run build
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
```

Run design scan:

```bash
npx impeccable --json /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src
```

## Copilot Configuration Instructions

Current package to upload:

`/Users/mattgraves/Development/hackathon-enterprise/evidence/copilot/signal-foundry-copilot-v015-light-avatar-20260611.zip`

Windows upload path:

`C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip`

Expected SHA-256:

`0189B098CDDFC99F0459E9C41ACF345D64F44CEBBA1C6A5CADA9B6751B019F0E`

### Pre-Upload Checks

1. Confirm package hash on Windows:

   ```powershell
   Get-FileHash -Algorithm SHA256 -Path "C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip"
   ```

2. Confirm package contents:

   ```powershell
   tar -tf "C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip"
   ```

   Required entries:

   - `manifest.json`
   - `declarative-agent.azure.json`
   - `color.png`
   - `outline.png`
   - `mcp-tools.json`
   - `actions/signal-foundry-mcp.azure.json`

3. Confirm manifest version is newer than prior upload:

   ```powershell
   Expand-Archive -Path "C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip" -DestinationPath "$env:TEMP\sf-v015" -Force
   (Get-Content -Raw "$env:TEMP\sf-v015\manifest.json" | ConvertFrom-Json).version
   ```

   Expected: `0.1.5`.

### Upload Option A: Microsoft 365 Agents Toolkit CLI

Install and sign in:

```powershell
npm install -g @microsoft/m365agentstoolkit-cli
atk auth login
```

Upload:

```powershell
atk install --file-path "C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip"
```

If installing for shared scope is enabled for the tenant:

```powershell
atk install --file-path "C:\Users\demouser\Downloads\SignalFoundry\signal-foundry-copilot-v015-light-avatar-20260611.zip" --scope Shared
```

### Upload Option B: Teams Client Custom App Upload

Use this if the tenant allows custom app upload:

1. Open Teams with the hackathon tenant account.
2. Go to `Apps`.
3. Select `Manage your apps`.
4. Select `Upload an app`.
5. Select `Upload a custom app`.
6. Choose `signal-foundry-copilot-v015-light-avatar-20260611.zip`.
7. Add the app.
8. Open Microsoft 365 Copilot Chat and look for `Signal Foundry`.

### Admin/Tenant Checks

If the app does not appear:

1. Confirm custom app upload is allowed in Teams admin policies.
2. Confirm the app is allowed in Teams Admin Center `Manage apps`.
3. Confirm the user has a Microsoft 365 Copilot license or tenant metered usage for declarative agent capabilities beyond WebSearch.
4. Confirm the tenant permits custom Copilot agents.
5. Confirm OAuthPluginVault reference is configured for the MCP action.

### Copilot Branding And Manifest Checklist

Before final upload, verify:

- `manifest.json` `name.short`: `Signal Foundry`
- `manifest.json` `name.full`: `Signal Foundry Capability Launchpad`
- `manifest.json` `version`: incremented every upload.
- `manifest.json` `icons.color`: `color.png`
- `manifest.json` `icons.outline`: `outline.png`
- `color.png`: 192x192, generated from `docs/submission/signal-foundry-avatar-light.png`.
- `outline.png`: 32x32.
- `accentColor`: matches Signal Foundry teal.
- `validDomains` includes:
  - `ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
  - `red-coast-0b0c14e0f.7.azurestaticapps.net`
- `declarative-agent.azure.json` instructions length is <= 8000.
- Conversation starters are judge-friendly:
  - `Presales Use Cases`
  - `Sales Rep Use Cases`
  - `CS Leader Use Cases`
  - `Draft Proposal`
  - `Verify Audit Trail`
  - `Boundary Check`
- Capabilities remain scoped to `People` and `Meetings`.
- `actions[0].file` points to `actions/signal-foundry-mcp.azure.json`.
- MCP action uses `RemoteMCPServer`.
- MCP action uses `OAuthPluginVault` auth.
- Tool description includes all 12 tools.

### Post-Upload Smoke Test

In Microsoft 365 Copilot Chat:

1. Start Signal Foundry.
2. Run:

   ```text
   Open Signal Foundry. Use the Asteria Dynamics demo defaults. What can you help me do?
   ```

3. Verify the light avatar appears.
4. Verify starter prompts are visible.
5. Run:

   ```text
   We see you're a Customer Success leader working with the renewal team. Show governed use cases for QBRs, risk briefs, and escalation prep.
   ```

6. Verify no raw Microsoft 365 content appears.
7. Run:

   ```text
   Can you monitor which account managers at Asteria Dynamics are least productive and rank them?
   ```

8. Verify the agent refuses surveillance/productivity ranking and redirects to workflow-level improvement.

## Microsoft Reference Links

- Microsoft 365 app manifest schema: https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/?view=m365-app-1.28
- Declarative agents overview: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-declarative-agent
- Microsoft 365 Agents Toolkit CLI: https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli
- App package upload with `atk install`: https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli
- Teams custom app upload flow: https://learn.microsoft.com/en-nz/answers/questions/5805970/please-enable-custom-copilot-agents-for-our-tenant
