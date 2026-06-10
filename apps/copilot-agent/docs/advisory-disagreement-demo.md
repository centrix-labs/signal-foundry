# Advisory Disagreement Demo (reproducible from reset)

Purpose: capture the Risk Gate arbitration screenshot — advisory model suggests a
lower level, deterministic gate rules high, gate wins.

The seed registry ships proposal `prop-autonomous-renewal-outreach`
("Autonomous Renewal Outreach Composer"). Its risk inputs are derived from the
deterministic weights in `apps/mcp-server/src/risk.ts` so the gate lands exactly
at the high boundary (score 10) while the proposal text reads benign — the shape
an advisory LLM plausibly underrates:

| Input | Value | Weight |
| --- | --- | --- |
| dataSensitivity | low | 0 |
| externalSharing | low | 0 |
| automationLevel | autonomous | +5 |
| audienceScope | enterprise | +2 |
| usesCustomerData | false | 0 |
| requiresHumanReview | false | +3 |

Steps (requires `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry` on the MCP server):

1. `POST /admin/reset` as `actor-dana`.
2. As `actor-alex`, call `score_capability_risk` with `proposalId
   prop-autonomous-renewal-outreach`, the inputs above, `confirmed: true`, and a
   fresh idempotency key (idempotency replays skip a fresh advisory call).
3. Open Foundry Floor → select Autonomous Renewal Outreach Composer → Risk Gate
   panel shows the deterministic HIGH verdict, the advisory analysis, and the
   amber arbitration callout when the advisory level differs.

Acceptance: the disagreement must reproduce on 3 consecutive reset-and-score
runs before the screenshot is recorded as evidence. If the advisory model agrees
with the gate on a run, adjust the seed proposal wording (never the gate or the
weights) and re-verify. With advisory mode off, the panel shows "Advisory
unavailable — deterministic verdict stands" and the deterministic outcome is
identical.
