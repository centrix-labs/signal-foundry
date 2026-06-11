# Morning Walkthrough — validate everything, then demo

Ordered runbook. Every step lists the expected result; if a step doesn't match,
stop there rather than stacking surprises. Budget ~45 minutes plus optional
redeploy.

## Phase 0 — Sync (2 min)

```bash
git -C /Users/mattgraves/Development/hackathon-enterprise switch main
git -C /Users/mattgraves/Development/hackathon-enterprise pull
npm --prefix /Users/mattgraves/Development/hackathon-enterprise install
```

Expected: branch `main`, up to date, install clean.

## Phase 1 — Automated validation (5 min)

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate
```

Expected, in order:
- OpenSpec strict validation passes
- Typecheck: no errors across 4 workspaces
- Tests: **28 passed** (mcp-server) and **24 passed** (shared)
- `Evidence validation pass: 46 files, 4 scenarios`
- `Copilot package validation pass: 6 files, 12 tools, 7ec661d1612f...`
- `Adaptive card check pass: 4 cards across 4 action manifests.`

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
```

Expected: `2 passed` both times (golden flow + sanitized unauthorized
rejection). Run it twice on purpose — that's the no-flakes bar. First run needs
`npx --prefix <repo> playwright install chromium` if browsers are missing.

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run reset
```

Expected: `Reset Signal Foundry demo registry to deterministic synthetic state.`
(Returns the seed to pristine after the E2E mutations.)

## Phase 2 — Local interactive demo (15 min)

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run dev:all
```

Open http://127.0.0.1:5173 →

1. **Access gate:** enter the site access code (unchanged from your deploys).
2. **Login:** lands directly in the workspace — the Vite dev server mocks
   `/.auth/me` as `local-operator@asteria-dynamics.example` (dev-only; the
   deployed site still uses real Entra sign-in).
3. **Live pill:** top bar shows `Live registry synced` (not "Sample demo
   fallback"). If fallback shows, the MCP server isn't up on :7071.
4. **Filters and search:** click `Role: Enterprise Account Manager` — list
   narrows; type `renewal` in search — matches filter live; clear both.
   Capability list shows the two approved capabilities **plus** the seeded
   proposal "Autonomous Renewal Outreach Composer."
5. **Risk Gate panel:** select any capability — the Advisory Analysis section
   shows `Advisory unavailable — deterministic verdict stands.` (advisory mode
   is off locally; that quiet state is itself a demo point: no LLM dependency).

Now run the golden flow against the live server (new terminal). These are the
same payloads the E2E uses; watch the UI update within ~15 seconds after each:

```bash
MCP=http://127.0.0.1:7071
SCOPE='"tenantId":"tenant-asteria-dynamics","projectId":"revenue-ops-launchpad"'

# 1. Create (employee Priya) -> expect ok:true, proposalId "prop-idem-walk-..."
curl -s -X POST $MCP/tools/create_capability_proposal -H "x-sf-actor-id: actor-priya" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-001\",\"idempotencyKey\":\"idem-walk-create\",\"confirmed\":true,\"title\":\"Walkthrough Renewal Brief\",\"description\":\"Governed renewal brief from approved synthetic summaries only.\",\"role\":\"Enterprise Account Manager\",\"department\":\"Customer Success\",\"owner\":\"Priya Shah\",\"intendedAudience\":\"team\",\"inputsRequired\":[\"Account summary\"],\"proposedOutputs\":[\"Renewal brief\"],\"sourceSummary\":\"Synthetic Work IQ-style CRM and meeting summaries.\"}"

# 2. Score (reviewer Alex) -> expect riskLevel "low", advisory.status "unavailable",
#    requiredControls length >= 4   (use the proposalId from step 1)
curl -s -X POST $MCP/tools/score_capability_risk -H "x-sf-actor-id: actor-alex" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-002\",\"idempotencyKey\":\"idem-walk-score\",\"confirmed\":true,\"proposalId\":\"PROPOSAL_ID\",\"dataSensitivity\":\"low\",\"externalSharing\":\"low\",\"automationLevel\":\"assistive\",\"audienceScope\":\"team\",\"usesCustomerData\":false,\"requiresHumanReview\":true}"

# 3. Submit -> expect status "pending"
curl -s -X POST $MCP/tools/submit_capability_review -H "x-sf-actor-id: actor-alex" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-003\",\"idempotencyKey\":\"idem-walk-review\",\"confirmed\":true,\"proposalId\":\"PROPOSAL_ID\",\"reviewer\":\"Alex Kim\",\"dueDate\":\"2026-06-20\"}"

# 4. Approve -> expect capabilityId "cap-..."
curl -s -X POST $MCP/tools/approve_capability -H "x-sf-actor-id: actor-alex" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-004\",\"idempotencyKey\":\"idem-walk-approve\",\"confirmed\":true,\"proposalId\":\"PROPOSAL_ID\",\"reviewer\":\"Alex Kim\",\"approvalNotes\":\"Approved for the renewal team.\"}"

# 5. Release -> expect status "released"   (use capabilityId from step 4)
curl -s -X POST $MCP/tools/release_capability -H "x-sf-actor-id: actor-alex" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-005\",\"idempotencyKey\":\"idem-walk-release\",\"confirmed\":true,\"capabilityId\":\"CAPABILITY_ID\",\"releasedBy\":\"Alex Kim\",\"audience\":\"team\",\"version\":\"v1.0.0\"}"

# 6. Unauthorized (employee tries to approve) -> expect HTTP 403, ok:false,
#    sanitized message, no stack/token/bearer anywhere in the body
curl -si -X POST $MCP/tools/approve_capability -H "x-sf-actor-id: actor-priya" -H "Content-Type: application/json" -d "{$SCOPE,\"correlationId\":\"corr-walk-006\",\"idempotencyKey\":\"idem-walk-unauth\",\"confirmed\":true,\"proposalId\":\"PROPOSAL_ID\",\"reviewer\":\"Priya Shah\",\"approvalNotes\":\"Self-approval attempt.\"}" | head -1

# 7. Confirmation gate -> repeat step 1 with \"confirmed\":true removed
#    -> expect 400 "Explicit confirmation required before mutation."
```

UI checks after the flow: released card in the capability list and pipeline,
Release Packet drawer with version/owner/reviewer/correlation ID, MCP Activity
Rail showing all five actions plus the rejected attempt, Signal Atlas updated.
When finished: `Ctrl+C` the dev servers, then `npm run reset` again.

## Phase 3 — Deployed smoke (3 min) — read the warning first

> **The Azure deployment is STALE relative to main.** It predates the advisory
> module, grounded work context, cards, filters, and the branded icon. Health
> and the old golden flow work; the new features do not exist there until you
> redeploy.

```bash
curl -s https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/health
curl -s https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/tools | head -c 300
```

Expected: health ok JSON; tools list begins with `search_capabilities`.

**Optional redeploy to bring Azure current** (do this before recording the
video if you want the deployed URLs to show the new UI). Blast radius: replaces
the Container App revision and SWA content in `rg-signal-foundry-hackathon`;
rollback is redeploying the previous image/revision.

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --plan
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --what-if
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --apply --build-image --deploy-static
```

Then re-run the two curl checks and load the SWA URL (real Entra login).

## Phase 4 — Optional: live advisory arbitration

Needs the Azure AI Foundry resource (not yet provisioned — pending approval).
Once provisioned and `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry` is set, follow
`apps/copilot-agent/docs/advisory-disagreement-demo.md`: reset, score the
seeded `prop-autonomous-renewal-outreach` with the documented inputs, and
verify the amber arbitration callout reproduces 3 runs in a row. Without it,
the demo line is "and when the model is down, the deterministic gate stands
alone" — also true and also a feature.

## Phase 5 — Submission finishers (the human list)

1. Repo visibility: still PRIVATE → flip to Public (Settings → General).
2. Record the 2:00 video per `docs/submission/demo-video-script.md`; upload;
   paste the URL into SUBMISSION.md and the Innovation Studios description.
3. Innovation Studios: create/finalize the project from
   `docs/submission/SUBMISSION.md`; upload `signal-foundry-cover.png` as the
   project image; Code Repository Link → the GitHub URL; tracks: Enterprise +
   Reasoning.
4. Team: every member registered, activated, requested, and accepted (max 5).
5. Sideload (if tenant access materialized): follow the Tenant Unblock
   Playbook in `evidence/copilot/copilot-evidence-capture-runbook.md` and
   capture the five screenshots.
