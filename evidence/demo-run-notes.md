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
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run reset
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
