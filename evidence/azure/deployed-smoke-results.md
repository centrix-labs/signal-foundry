# Deployed Smoke Results

Date: 2026-06-08

## Live URLs

- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`

## Runtime Image

- ACR image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:work-context-v012`
- Digest: `sha256:6de9bb44015a0fffcaedf2fd1e7e1b069a7f1ab55fef0501a101add770a33591`
- Revision: `ca-signal-foundry-mcp--0000018`
- Deployment note: Bicep was reapplied on 2026-06-09 and the MCP image was rebuilt with the read-only `get_user_work_context` tool plus OAuth bearer synthetic actor fallback for Copilot action calls.

## Smoke Checks

- Health endpoint: passed.
- Tool-list endpoint: passed with 12 tools.
- Active Container Apps revision: passed with 100% traffic on `ca-signal-foundry-mcp--0000018`.
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
- Azure Table registry mirror: passed for `Actors`, `Capabilities`, and `McpActivity` table rows.
- Static Web Apps load: passed with HTTP 200.
- Static Web Apps asset check: passed with the synthetic Asteria login placeholder and Asteria defaults.
- Log Analytics sample: captured sanitized audit event with correlation ID only.
- Budget: resource-group cost budget created with redacted evidence.
- Key Vault: Static Web Apps deployment token stored; evidence contains metadata only.
- Live demo video: captured deployed Foundry Floor flow.

## Evidence Files

- `evidence/azure/resource-list.json`
- `evidence/azure/container-app-state.json`
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
