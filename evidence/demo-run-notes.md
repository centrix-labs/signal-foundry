# Demo Run Notes

Date: 2026-06-07

## Golden Flow

1. Open Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`.
2. Show the Foundry Floor pipeline and MCP Activity Rail.
3. Switch to Signal Atlas and show animated signal-to-workflow relationships.
4. Use deployed MCP/API to run:
   - `recommend_capabilities_for_role`
   - `create_capability_proposal`
   - `score_capability_risk`
   - `submit_capability_review`
   - `approve_capability`
   - `release_capability`
   - `generate_release_packet`
5. Show the release packet and sanitized activity trail.
6. Attempt employee approval with `actor-priya`; show HTTP 403 sanitized rejection.
7. Show anti-surveillance refusal text from `evidence/signal-foundry-demo-evidence.json`.
8. Show Azure resource and telemetry evidence.
9. Play the live demo video: `evidence/videos/signal-foundry-live-demo.webm`.

## Reset

Local reset:

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run reset
```

Deployed demo reset:

```bash
curl -fsS -X POST https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/admin/reset -H 'x-sf-actor-id: actor-dana'
```

## Judge Emphasis

- Signal Foundry is not employee monitoring.
- It uses synthetic or permission-aware summaries only.
- MCP is the system of record for governed proposals, risk, approval, release, and audit.
- Human review is required before release.
- Audit telemetry records compact metadata and correlation IDs only.

## 2026-06-10 — Foundry/Work IQ uplift verification (claude/foundry-workiq-uplift)

- Full validate chain green: 28 mcp-server tests (advisory module, grounded work
  context, schema-enforced confirmation), 24 shared tests, evidence validator
  (51 files, 4 scenarios), Copilot package validator (v0.1.5,
  0189b098cddf...), Work IQ + Foundry readiness gate, and adaptive card check
  (4 cards x 4 manifests).
- Playwright golden-flow E2E: propose -> score (advisory unavailable with mode
  off, deterministic verdict unchanged) -> submit -> approve -> release, plus
  sanitized unauthorized rejection. Passed twice consecutively from /admin/reset.
- Azure AI Foundry advisory is provisioned in `rg-signal-foundry-hackathon` with
  `aif-signal-foundry` / `sf-advisory-gpt41-mini`; live MCP smoke captured an
  available `gpt-4.1-mini-2025-04-14` advisory response while preserving the
  deterministic gate as source of truth.
- Remaining tenant-dependent captures and the unblock playbook are listed in
  evidence/copilot/copilot-evidence-capture-runbook.md.
