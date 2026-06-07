# Signal Foundry Judge Evidence Checklist

This checklist maps judge-facing proof to committed artifacts and deployed Azure evidence. It does not include Microsoft 365 source content, credentials, raw tenant data, stack traces, or personal contact details.

## Required Evidence

| Criterion | Status | Evidence |
| --- | --- | --- |
| Copilot Chat agent | Package-ready; tenant sideload screenshot pending | `apps/copilot-agent/package/manifest.json`, `apps/copilot-agent/package/manifest.azure.json`, `evidence/copilot/signal-foundry-copilot-local.zip` |
| Work IQ grounding | Ready | `apps/copilot-agent/docs/instructions.md`, `evidence/signal-foundry-demo-evidence.json` |
| Original hackathon work | Ready | `data/signal-foundry-seed.json`, `apps/foundry-floor/src`, `apps/mcp-server/src` |
| MCP app/plugin contract | Ready | `openspec/changes/build-copilot-capability-launchpad/mcp-tool-contract.md`, `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json` |
| MCP read operations | Ready | `evidence/azure/deployed-smoke-results.md` |
| MCP write operations | Ready | `evidence/azure/deployed-smoke-results.md` |
| Auth boundary | Ready | Unauthorized approval smoke in `evidence/azure/deployed-smoke-results.md` |
| Human review | Ready | Golden deployed flow in `evidence/azure/deployed-smoke-results.md` |
| Audit-safe observability | Ready | `evidence/azure/sanitized-log-analytics-sample.json` |
| Responsible AI | Ready | `apps/copilot-agent/docs/safety-boundaries.md`, `evidence/signal-foundry-demo-evidence.json` |
| Azure deployment | Ready | `evidence/azure/resource-list.json`, `evidence/azure/container-app-state.json`, `evidence/azure/static-web-app-state.json` |
| Cost posture | Ready | `evidence/azure/budget.json`, `openspec/changes/build-copilot-capability-launchpad/architecture-cost-plan.md` |
| Key Vault secret storage | Ready | `evidence/azure/key-vault-secret-metadata.json` |
| Branded login entry | Ready | `evidence/screenshots/login-page-desktop.png`, `evidence/screenshots/login-page-mobile.png`, `evidence/screenshots/azure-login-page-desktop.png`, `evidence/screenshots/azure-login-page-mobile.png` |
| Demo video | Ready | `evidence/videos/signal-foundry-live-demo.webm` |

## Screenshot Run List

| Screenshot | Evidence |
| --- | --- |
| Login page desktop | `evidence/screenshots/login-page-desktop.png` |
| Login page mobile | `evidence/screenshots/login-page-mobile.png` |
| Azure login page desktop | `evidence/screenshots/azure-login-page-desktop.png` |
| Azure login page mobile | `evidence/screenshots/azure-login-page-mobile.png` |
| Foundry Floor desktop | `evidence/screenshots/azure-foundry-floor-desktop.png` |
| Foundry Floor mobile | `evidence/screenshots/azure-foundry-floor-mobile.png` |
| Signal Atlas released workflow | `evidence/screenshots/azure-signal-atlas.png` |
| Review Queue | `evidence/screenshots/review-queue.png` |
| Copilot Mirror | `evidence/screenshots/copilot-mirror.png` |
| Light Executive view | `evidence/screenshots/light-executive.png` |
| Local tablet view | `evidence/screenshots/foundry-floor-tablet.png` |
| Unauthorized rejection | `unauthorized-approval` in `evidence/signal-foundry-demo-evidence.json`; deployed 403 in `evidence/azure/deployed-smoke-results.md` |
| Anti-surveillance refusal | `anti-surveillance-refusal` in `evidence/signal-foundry-demo-evidence.json` |
| Live demo video | `evidence/videos/signal-foundry-live-demo.webm` |

## P0 Gate Mapping

| Gate | Evidence Asset |
| --- | --- |
| Copilot surface | `evidence/copilot/signal-foundry-copilot-local.zip`, tenant sideload pending |
| Work IQ grounding | `apps/copilot-agent/docs/instructions.md` |
| MCP read/write | `evidence/azure/deployed-smoke-results.md` |
| External MCP server | `evidence/azure/container-app-state.json` |
| OAuth/auth boundary | `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json`, unauthorized smoke |
| Human review | Golden flow in `evidence/azure/deployed-smoke-results.md` |
| Risk gate | `evidence/signal-foundry-demo-evidence.json` |
| Release packet | Golden flow in `evidence/azure/deployed-smoke-results.md` |
| Signal Atlas | `evidence/screenshots/azure-signal-atlas.png` |
| Review Queue | `evidence/screenshots/review-queue.png` |
| Audit safety | `scripts/validate-evidence.mjs`, secret scan, Log Analytics sample |
| Anti-surveillance | `evidence/signal-foundry-demo-evidence.json` |
| Demo repeatability | `scripts/reset.ts`, `/admin/reset`, `scripts/local-smoke.sh` |
| Visual quality | `evidence/screenshots/azure-foundry-floor-desktop.png` |
| Evidence mapping | This checklist and `evidence/acceptance-rubric-audit.md` |

## Remaining Tenant-Dependent Evidence

- Microsoft 365 Copilot Chat sideload screenshot.
- Copilot Chat role recommendation screenshot.
- Copilot Chat anti-surveillance refusal screenshot.

## Submission Narrative

Signal Foundry helps employees discover useful Copilot workflows, then helps the organization risk-review, approve, and release those workflows through an MCP-backed registry, human-in-the-loop governance, and an audit-safe Foundry Floor command center.
