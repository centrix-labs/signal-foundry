# Signal Foundry 9.9+ Implementation Prompt

Use this prompt to implement the judge-facing Foundry Floor upgrade. It is
designed to be pasted into a coding agent with repository access.

```text
You are working in /Users/mattgraves/Development/hackathon-enterprise.

Goal
Build the judge-facing Signal Foundry portal upgrade described in
docs/submission/hackathon-win-portal-spec.md so the implementation can credibly
score 9.9+/10, targeting 40/40 on the documented hackathon rubric.

The portal must prove this story in one glance:

Microsoft 365 Copilot request -> Signal Foundry MCP tools -> deterministic risk
gate -> human review -> release packet -> audit-safe evidence

Primary outcome
Replace the dense default Foundry Floor dashboard with a guided Judge Mode that
lets a judge understand the product in 10 seconds and inspect source-backed
proof within 60 seconds. The existing operations/dashboard views must remain
available.

Required source reading before editing
Read these files before making changes:

- /Users/mattgraves/.llm/GLOBAL_ENGINEERING.md
- /Users/mattgraves/.llm/REVIEW_PROTOCOL.md
- /Users/mattgraves/Development/hackathon-enterprise/docs/submission/hackathon-win-portal-spec.md
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/App.tsx
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/panels.tsx
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/visuals.tsx
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/data.ts
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/liveData.ts
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/styles.css
- /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src/views.css
- /Users/mattgraves/Development/hackathon-enterprise/packages/shared/src/types.ts
- /Users/mattgraves/Development/hackathon-enterprise/apps/copilot-agent/package/declarative-agent.azure.json
- /Users/mattgraves/Development/hackathon-enterprise/apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json

Non-negotiable no-hallucination rules
- Follow all global rules in /Users/mattgraves/.llm/GLOBAL_ENGINEERING.md,
  especially absolute-path tool usage, read-before-edit, state-change
  declarations, verification from source, and quick review-board mode before
  final response.
- Follow /Users/mattgraves/.llm/REVIEW_PROTOCOL.md for any paid or external
  model review. If no paid/external review is used, state that no review cost
  was incurred.
- Do not invent product capabilities, Microsoft behavior, tenant configuration,
  live license state, admin approval, Graph indexing, or registry mutations.
- Do not show raw Microsoft 365 content, customer data, secrets, tokens,
  personal contact details, employee ranking, productivity scoring, or
  surveillance output.
- Do not imply a write succeeded unless an existing Signal Foundry tool result
  or seeded evidence has ok:true and audit verification.
- Do not create fake correlation IDs. Use existing data from data.ts, live MCP
  activity, release packets, or explicitly label examples as synthetic.
- Do not weaken confirmation, idempotency, actor, tenant, project, correlation
  ID, human review, or deterministic gate requirements.
- Keep the deterministic risk gate authoritative over AI advisory reasoning.
- Do not hard-code "18 controls". Use selectedRisk.requiredControls.length for
  required controls. If preserving the existing 18-check visual, label it as
  checks and map it to the actual checklist rendered by the component.

Implementation scope

1. Add Judge Mode as the default portal view.
   - Add a judge view key to the existing view model.
   - Default activeView to judge.
   - resetDemo() must return to judge, selected first capability, stage Discover,
     and pending decision state.
   - Keep floor, atlas, pipeline, review, mirror, and executive views reachable.
   - Create a JudgeMode component in App.tsx or a nearby local component file.
   - Do not add a new data-fetching path. Use useDashboardData.

2. Use this Judge Mode component contract:

   type JudgeStageKey = "discover" | "propose" | "score" | "review" | "release";

   interface JudgeModeProps {
     records: readonly Capability[];
     selected: Capability;
     selectedId: string;
     onSelect: (id: string) => void;
     activity: ReturnType<typeof useDashboardData>["mcpActivity"];
     packets: ReturnType<typeof useDashboardData>["releasePackets"];
     reviews: ReturnType<typeof useDashboardData>["reviewItems"];
     riskReviews: ReturnType<typeof useDashboardData>["riskReviews"];
     stageIndex: number;
     onAdvance: () => void;
     onReset: () => void;
     onOpenMirror: () => void;
   }

3. Use a data-driven five-stage model:

   const judgeStages = [
     { key: "discover", label: "Discover" },
     { key: "propose", label: "Propose" },
     { key: "score", label: "Score" },
     { key: "review", label: "Review" },
     { key: "release", label: "Release" }
   ] as const;

   Map demoStep to judgeStages[demoStep % judgeStages.length].
   The primary button says Run live proof only when demoStep === 0; otherwise it
   says Advance story.

4. Judge Mode first viewport requirements.
   - Header: Signal Foundry.
   - Proof line: Governed Copilot workflows from idea to approved release.
   - Stage stepper: Discover, Propose, Score, Review, Release.
   - Large central Signal Atlas hero.
   - Right-side proof rail:
     - Copilot grounded / People + Meetings, summary-only
     - Risk gated / <N> required controls, deterministic verdict
     - Audit ready / correlation IDs, release packet
   - Primary action: Run live proof or Advance story.
   - At 1440px desktop, the first viewport shows the full five-stage story
     without scrolling.
   - At 390px mobile, the stage stepper, Atlas, and one proof card are visible
     before evidence details.

5. Signal Atlas hero upgrade.
   - Make Atlas the dominant Judge Mode visual.
   - Add direct in-canvas labels:
     - Summary work signals
     - Signal Foundry
     - Risk gate
     - Approved workflows
   - Add No raw content and Summary-only badges on inbound signal side.
   - Add Approved packet badge on outbound side.
   - Highlight the amber risk gate node when stage is Score.
   - Add visible left-to-center-to-right flow lines.
   - Preserve node click selection behavior.
   - Use restrained motion and respect prefers-reduced-motion.
   - Do not add gradient orbs, bokeh, or unrelated illustrations.

6. Risk Gate and advisory rewrite.
   Replace the low-contrast advisory area with a two-column comparison:

   AI advisory column:
   - If review.advisory?.status !== "available":
     - show Advisory unavailable
     - show Deterministic verdict stands
   - If available:
     - Suggested level: review.advisory.suggestedRiskLevel or Not provided
     - Reason: review.advisory.summary, first advisory step concern, or Not provided
     - Agreement: review.advisory.agreesWithGate
     - Model: review.advisory.model only when present

   Deterministic gate column:
   - Decision: derive from review.riskLevel and review.requiresHumanReview.
   - Controls: render review.requiredControls.
   - Why it wins: Deterministic gate is the source of truth.
   - Release blocked until reviewer approval only if review/release state
     supports that claim.

   Do not show sample advisory text unless that exact text exists in the selected
   RiskReview, advisory payload, or captured evidence.

7. MCP Activity as Evidence Timeline.
   Convert the activity rail from log-like output into a proof timeline. Use
   actual tool/event names only:
   - search_capabilities
   - recommend_capabilities_for_role
   - create_capability_proposal
   - score_capability_risk
   - submit_capability_review
   - release_capability
   - list_mcp_activity

   Each row must show:
   - tool/event name
   - human-readable proof sentence
   - actor
   - correlation ID
   - status icon

   Unauthorized or rejected events must read as safety proof, not app failure.
   Rejection reasons must be sanitized text only.

8. Copilot Mirror proof panel.
   In Judge Mode, make Copilot Mirror a compact proof panel, not a long transcript.
   Show:
   - User asks Copilot
   - Copilot calls Signal Foundry MCP
   - Signal Foundry returns governed result

   Add proof badges backed by package manifests/instructions:
   - People
   - Meetings
   - OAuth
   - Summary-only
   - No raw M365 content

   Keep the full transcript available behind Open Copilot proof.

9. Visual polish.
   - Remove border-left: 3px solid var(--amber) from .advisory-arbitration.
   - Replace with full-card tint, icon, or the two-column comparison.
   - Reduce generic repeated card grids where possible.
   - Improve muted/disabled contrast.
   - Standardize proof badges and status pills.
   - Use the light avatar mark consistently in sidebar brand lockup, login/access
     screen, Judge Mode header, and Copilot package color.png.
   - Keep card radius at 8px or less unless existing design requires otherwise.
   - Do not nest cards inside cards unless existing component boundaries require
     it and the visual treatment is flattened.

Allowed UI claims and data sources
Every claim must use these sources or fallback:

- People + Meetings:
  source apps/copilot-agent/package/declarative-agent.azure.json capabilities;
  fallback Copilot grounding configured.
- Summary-only / No raw M365 content:
  source declarative agent instructions plus MCP tool schema descriptions;
  fallback Synthetic demo context.
- OAuth:
  source actions/signal-foundry-mcp.azure.json runtime auth.type ===
  OAuthPluginVault; fallback Auth configured.
- <N> required controls:
  source selectedRisk.requiredControls.length; fallback Controls unavailable.
- Deterministic verdict: <risk>:
  source selectedRisk.riskLevel; fallback Deterministic verdict unavailable.
- Correlation IDs:
  source McpActivity.correlationId or ReleasePacket.correlationId; fallback
  Audit correlation pending.
- Release packet:
  source matching ReleasePacket for selected capability; fallback Release packet
  not yet generated.
- Human review required:
  source RiskReview.requiresHumanReview or matching ReviewItem.status; fallback
  Review state unavailable.

Evidence requirements
After implementation, capture evidence under:

evidence/demo-walkthrough/<YYYY-MM-DDTHH-mm-ssZ>/

Required screenshots:
- 01-judge-mode-desktop.png at 1440x1000
- 02-judge-mode-mobile.png at 390x844
- 03-risk-gate-comparison.png at 1440x1000 with stage Score
- 04-review-required.png at 1440x1000 with stage Review
- 05-release-packet.png at 1440x1000 with stage Release
- 06-copilot-proof-panel.png at 1440x1000
- 07-evidence-timeline.png at 1440x1000

Add walkthrough-summary.md in the same folder with:
- app URL used
- data source state: Live registry synced or Sample demo fallback
- selected capability ID
- selected risk review ID
- screenshot list
- validation commands run
- claim audit

End-of-development Playwright QA
Before claiming the work complete, run a full Playwright interaction sweep
against the finished portal. This is required even if unit tests and screenshots
pass.

Coverage requirements:
- Visit every app view reachable from the left rail or Judge Mode:
  Judge Mode, Operations/Dashboard, Signal Atlas, Release Pipeline, Review Queue,
  Copilot Mirror, Executive/Light view, login/access screen, and any drawer or
  modal introduced by this work.
- Exercise every visible button at least once:
  Run live proof, Advance story, Reset golden scenario, nav buttons, theme
  toggle, search/filter controls, Open Copilot proof, node/capability selectors,
  review actions, release packet controls, drawer open/close controls, and any
  new icon-only buttons.
- Check links and navigation:
  no dead links, no buttons with no observable state change, no broken hrefs,
  and no console errors after interaction.
- Check animations and motion:
  Signal Atlas flow animation is visible in normal mode, stage transitions work,
  hover/focus states render, and prefers-reduced-motion either disables or
  materially reduces non-essential motion.
- Check responsive behavior:
  run at 1440x1000, 1024x768, 390x844, and 360x800. No text overlap, clipped
  primary buttons, inaccessible nav, or hidden proof cards in the required first
  viewport.
- Check accessibility basics:
  keyboard tab order reaches all controls, focus indicators are visible, icon
  buttons have accessible names or tooltips, and no modal/drawer traps focus
  incorrectly.
- Capture or update the required evidence screenshots after this sweep, not
  before it.

If a control is intentionally inert or demo-only, label it visibly or remove it.
Do not leave dead buttons, dead links, or non-functioning animated affordances.

Claim audit format
For every new visible claim, include:

Visible claim: <exact UI copy>
Source: <file path, runtime response, screenshot, or official doc>
Risk if wrong: <what would mislead a judge>
Status: verified | synthetic demo context | not yet verified

Do not write 40/40 unless all eight categories below are 5/5 and each has linked
proof:

First-glance story: /5
Copilot proof: /5
Governance correctness: /5
Risk/advisory clarity: /5
Human review/release: /5
Audit-safe evidence: /5
Visual distinctiveness: /5
Accessibility/responsiveness: /5
Total: /40

Validation
Run these before committing:

npm --prefix /Users/mattgraves/Development/hackathon-enterprise run typecheck
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:evidence
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:copilot
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:cards

Run after major UI work:

npm --prefix /Users/mattgraves/Development/hackathon-enterprise run build
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e

Run the full Playwright QA sweep before final response. If no existing script
covers all requirements above, add or extend one under the repo test structure
and run it with an absolute-path npm command.

Run design scan if available:

npx impeccable --json /Users/mattgraves/Development/hackathon-enterprise/apps/foundry-floor/src

Final response requirements
- Summarize files changed.
- List validation commands and results.
- List Playwright QA coverage and results, including any added/updated test file.
- List evidence artifacts created.
- Include the claim audit.
- Include the final score table.
- State any residual risks honestly, especially live/deployed frontend status.
```
