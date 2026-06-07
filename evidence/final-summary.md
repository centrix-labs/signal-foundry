# Final Summary

Date: 2026-06-07

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

## Deployment Checkpoints

- Azure resource group: `rg-signal-foundry-hackathon`
- Container image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:checkpoint-f-20260607-0727`
- Container revision: `ca-signal-foundry-mcp--0000004`
- Static Web Apps site: `swa-signal-foundry`
- Budget: `signal-foundry-hackathon-budget`
- Key Vault: `kv-signal-foundry`

## Evidence Locations

- Deployed smoke: `evidence/azure/deployed-smoke-results.md`
- Resource list: `evidence/azure/resource-list.json`
- Sanitized telemetry: `evidence/azure/sanitized-log-analytics-sample.json`
- Cost posture: `evidence/azure/budget.json`
- Key Vault metadata: `evidence/azure/key-vault-secret-metadata.json`
- Screenshots: `evidence/screenshots`
- Demo video: `evidence/videos/signal-foundry-live-demo.webm`
- Copilot package: `evidence/copilot/signal-foundry-copilot-local.zip`

## Remaining Tenant-Dependent Manual Steps

- Sign in to Microsoft 365 Copilot Chat with the tenant account.
- Replace `SIGNAL_FOUNDRY_ENTRA_OAUTH_REFERENCE_ID` with the tenant-owned OAuth vault reference.
- Sideload the Copilot package.
- Capture Copilot Chat invocation, role recommendation, and anti-surveillance refusal screenshots.
