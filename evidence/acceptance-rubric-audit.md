# Acceptance Rubric Audit

Date: 2026-06-08

## P0 Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Copilot surface | Passed for package readiness; tenant screenshot pending | `apps/copilot-agent/package/manifest.json`, `evidence/copilot/signal-foundry-copilot-asteria-live-20260608-1145.zip`, `evidence/copilot/package-map.md`, `evidence/copilot/copilot-evidence-capture-runbook.md` |
| Work IQ grounding | Passed | `apps/copilot-agent/docs/instructions.md`, `evidence/signal-foundry-demo-evidence.json` |
| MCP read/write | Passed | `evidence/azure/deployed-smoke-results.md` |
| External MCP server | Passed | `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/health` |
| OAuth/auth boundary | Passed for demo auth; production OAuth pending tenant vault | Deployed 403 unauthorized smoke in `evidence/azure/deployed-smoke-results.md` |
| Human review | Passed | Golden deployed flow in `evidence/azure/deployed-smoke-results.md` |
| Risk gate | Passed | Golden deployed flow and screenshots under `evidence/screenshots` |
| Release packet | Passed | Golden deployed flow in `evidence/azure/deployed-smoke-results.md` |
| Signal Atlas | Passed | `evidence/screenshots/azure-signal-atlas.png` |
| Review Queue | Passed | `evidence/screenshots/review-queue.png` |
| Audit safety | Passed | `npm run validate`, secret scan, `evidence/azure/sanitized-log-analytics-sample.json` |
| Anti-surveillance | Passed in evidence and agent instructions; tenant screenshot pending | `evidence/signal-foundry-demo-evidence.json`, `apps/copilot-agent/docs/safety-boundaries.md` |
| Demo repeatability | Passed | `npm run reset`, `/admin/reset`, deployed golden smoke |
| Visual quality | Passed | `evidence/screenshots/foundry-floor-desktop.png`, `evidence/screenshots/azure-foundry-floor-desktop.png` |
| Evidence mapping | Passed | `evidence/judge-evidence-checklist.md` |

## P1 Differentiators Verified

- Animated Signal Atlas links: `apps/foundry-floor/src/visuals.tsx`, `evidence/screenshots/azure-signal-atlas.png`.
- MCP Activity Rail: `evidence/screenshots/foundry-floor-desktop.png`.
- Release Packet Drawer: `evidence/screenshots/foundry-floor-desktop.png`.
- Copilot Mirror: `evidence/screenshots/copilot-mirror.png`.
- Unauthorized-state evidence: `evidence/azure/deployed-smoke-results.md`.
- Azure deployment evidence: `evidence/azure/resource-list.json`.
- Light executive view: `evidence/screenshots/light-executive.png`.
- Live demo video: `evidence/videos/signal-foundry-live-demo.webm`.

## Budget And LLM Use

- Runtime does not depend on personal ChatGPT, Claude, or other non-Microsoft LLM accounts.
- Azure AI Foundry / Azure OpenAI advisory rationale remains optional and unused in the deployed smoke tests.
- Deterministic risk scoring is the source of truth.
- Azure Budget evidence: `evidence/azure/budget.json`.
- Key Vault secret metadata: `evidence/azure/key-vault-secret-metadata.json`.
