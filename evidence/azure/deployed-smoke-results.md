# Deployed Smoke Results

Date: 2026-06-07

## Live URLs

- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`

## Runtime Image

- ACR image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:checkpoint-f-20260607-0727`
- Digest: `sha256:d2e3cdbcd91704dd5e399880d924a6170fe4f0b71f91b5d5b30b2451ecd6bcd8`
- Revision: `ca-signal-foundry-mcp--0000004`

## Smoke Checks

- Health endpoint: passed.
- Tool-list endpoint: passed with 11 tools.
- OpenAPI endpoint: passed with HTTPS server URL and 11 tool paths.
- MCP JSON-RPC `tools/list`: passed with 11 tools.
- MCP JSON-RPC `tools/call`: passed for `search_capabilities`.
- Authorized synthetic read: passed for role recommendations.
- Authorized synthetic write: passed for proposal creation.
- Unauthorized approval rejection: passed with HTTP 403 and sanitized body.
- Golden flow: passed through risk score, review submit, approve, release, and release packet.
- Static Web Apps load: passed with HTTP 200.
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
- `evidence/screenshots/azure-foundry-floor-desktop.png`
- `evidence/screenshots/azure-signal-atlas.png`
- `evidence/screenshots/azure-foundry-floor-mobile.png`
- `evidence/videos/signal-foundry-live-demo.webm`
