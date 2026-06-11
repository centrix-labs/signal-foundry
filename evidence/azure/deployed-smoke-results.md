# Deployed Smoke Results

Date: 2026-06-11

## Live URLs

- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`

## Runtime Image

- ACR image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:checkpoint-f`
- Digest: `sha256:c3e23c73da751ad3397a47056d897ac4c1474224def9eaa21f79c90c73aa6713`
- Revision: `ca-signal-foundry-mcp--0000021`
- Deployment note: Bicep was reapplied on 2026-06-11 and the MCP image was rebuilt with live Azure AI Foundry advisory mode enabled through managed identity.

## Smoke Checks

- Health endpoint: passed.
- Tool-list endpoint: passed with 12 tools.
- Active Container Apps revision: passed with 100% traffic on `ca-signal-foundry-mcp--0000021`.
- MCP tool metadata: passed with `Asteria Dynamics`, `tenant-asteria-dynamics`, and `revenue-ops-launchpad` defaults.
- OpenAPI endpoint: passed with HTTPS server URL and 12 tool paths.
- MCP JSON-RPC `tools/list`: passed with 12 tools.
- MCP JSON-RPC `tools/call`: passed for `search_capabilities`.
- Read-only work context: passed for `get_user_work_context` with bearer auth and sanitized Presales Architect / Sales Engineering context.
- Authorized synthetic read: passed for role recommendations.
- Authorized synthetic write: passed for proposal creation.
- Authorized OAuth-style write: passed for `create_capability_proposal` with `ok:true`, `proposalId: prop-idem-live-oauth-create-2037`, and `correlationId: corr-live-oauth-create`.
- Audit verification: passed with `list_mcp_activity` showing `create_capability_proposal` success for `corr-live-oauth-create`.
- Unauthorized approval rejection: passed with HTTP 403 and sanitized body.
- Golden flow: passed through risk score, review submit, approve, release, and release packet.
- Deterministic risk gate: passed; medium sensitivity plus customer data scored `medium`.
- Azure AI Foundry advisory: passed with `advisory.status: available`, model `gpt-4.1-mini-2025-04-14`, deterministic gate still source of truth.
- Azure Table registry mirror: passed for `Actors`, `Capabilities`, and `McpActivity` table rows.
- Static Web Apps load: passed with HTTP 200 for the existing deployed portal.
- Static Web Apps redeploy: not completed on 2026-06-11 because the local SWA native deploy client exited with an unknown exception after backend deployment. Re-run SWA deploy from an environment where the native client runs cleanly before claiming the latest frontend bundle is live.
- Log Analytics sample: captured sanitized audit event with correlation ID only.
- Budget: resource-group cost budget created with redacted evidence.
- Key Vault: Static Web Apps deployment token stored; evidence contains metadata only.
- Live demo video: captured deployed Foundry Floor flow.

## Evidence Files

- `evidence/azure/resource-list.json`
- `evidence/azure/container-app-state.json`
- `evidence/azure/foundry-account-state.json`
- `evidence/azure/foundry-deployment-state.json`
- `evidence/azure/foundry-advisory-smoke.md`
- `evidence/azure/static-web-app-state.json`
- `evidence/azure/sanitized-log-analytics-sample.json`
- `evidence/azure/budget.json`
- `evidence/azure/key-vault-secret-metadata.json`
- `evidence/azure/key-vault-role-assignment.json`
- `evidence/azure/table-registry-sample.json`
- `evidence/screenshots/azure-foundry-floor-desktop.png`
- `evidence/screenshots/review-queue-interactive-release.png`
- `evidence/screenshots/review-release-atlas-flow.png`
- `evidence/screenshots/azure-signal-atlas.png`
- `evidence/screenshots/azure-foundry-floor-mobile.png`
- `evidence/videos/signal-foundry-live-demo.webm`
