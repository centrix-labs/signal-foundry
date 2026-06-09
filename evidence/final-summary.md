# Final Summary

Date: 2026-06-08

## Local Commands

- `npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run validate`
- `npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run build`
- `npm --prefix /Users/mattgraves/Documents/hackathon-enterprise audit --omit=optional`
- `npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run smoke:local`

## Azure URLs

- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`
- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`

## Commit Checkpoints

- `235d1b3` Checkpoint A scaffold Signal Foundry
- `0dc97f2` Checkpoint B implement MCP core
- `6ac890a` Checkpoint C add security validation evidence
- `312775f` Checkpoint D build Foundry Floor
- `ac4152c` Checkpoint E add Copilot agent package
- `f902d38` Prepare Azure deployment assets
- `6aeed2b` Checkpoint F deploy Azure demo
- `ae51824` Checkpoint G add readiness evidence
- `56b54a4` Checkpoint G finalize evidence package
- `90d1b2f` Document Copilot tenant access retry
- Add branded Signal Foundry login page
- Finish interactive review, risk, atlas, registry mirror, and Azure deployment hardening
- `e392865` Align demo defaults with Asteria Dynamics
- `b1cc4fb` Record Asteria deployment evidence
- `48919b0` Refresh Copilot evidence capture package
- `13d4b12` Add Copilot package validation
- `4f7890d` Add Asteria Copilot operating contract
- `26ab24d` Add Copilot evidence diagnostic
- `93d6c38` Capture Copilot Chat evidence
- `547f5de` Add Asteria demo defaults guardrails

## Deployment Checkpoints

- Azure resource group: `rg-signal-foundry-hackathon`
- Container image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:checkpoint-f`
- Container digest: `sha256:b4476a02af78cdf0608b51982acb70b3166bb6a28e49badb3f8b7a9a0fcd7dea`
- Container revision: `ca-signal-foundry-mcp--0000016`
- Static Web Apps site: `swa-signal-foundry`
- Azure Table registry mirror: `Actors`, `Capabilities`, `CapabilityProposals`, `RiskReviews`, `ReviewItems`, `ReleasePackets`, `McpActivity`, `AuditEvents`
- Budget: `signal-foundry-hackathon-budget`
- Key Vault: `kv-signal-foundry`

## Evidence Locations

- Deployed smoke: `evidence/azure/deployed-smoke-results.md`
- Deployed login smoke: `evidence/azure/deployed-login-smoke.md`
- Resource list: `evidence/azure/resource-list.json`
- Azure Table registry sample: `evidence/azure/table-registry-sample.json`
- Sanitized telemetry: `evidence/azure/sanitized-log-analytics-sample.json`
- Cost posture: `evidence/azure/budget.json`
- Key Vault metadata: `evidence/azure/key-vault-secret-metadata.json`
- Screenshots: `evidence/screenshots`, including deployed login screenshots
- Copilot Chat screenshots: `evidence/screenshots/copilot-agent-invocation-asteria.png`, `evidence/screenshots/copilot-workiq-recommendation-asteria.png`, `evidence/screenshots/copilot-anti-surveillance-refusal-asteria.png`
- Demo video: `evidence/videos/signal-foundry-live-demo.webm`
- Copilot package: `evidence/copilot/signal-foundry-copilot-v011-root-mcp-tools-20260608-1542.zip`
- Copilot capture runbook: `evidence/copilot/copilot-evidence-capture-runbook.md`
- Final readiness audit: `npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run audit:final-readiness`

## Remaining Tenant-Dependent Manual Steps

- None for the current hackathon evidence package. Reconfirm the tenant-owned OAuth vault reference only if the Copilot package is reinstalled or republished.
