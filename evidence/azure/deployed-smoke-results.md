# Deployed Smoke Results

Date: 2026-06-07

## Live URLs

- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`

## Runtime Image

- ACR image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:finish-build-20260607-1139`
- Digest: `sha256:dc9e0c2b5dcc854f9c148d213fc543ee391949f0e6b6fa7306a595a9c16f74fb`
- Revision: `ca-signal-foundry-mcp--0000007`

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
- Deterministic risk gate: passed; medium sensitivity plus customer data scored `medium`.
- Azure Table registry mirror: passed for `Actors`, `Capabilities`, and `McpActivity` table rows.
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
- `evidence/azure/table-registry-sample.json`
- `evidence/screenshots/azure-foundry-floor-desktop.png`
- `evidence/screenshots/review-queue-interactive-release.png`
- `evidence/screenshots/review-release-atlas-flow.png`
- `evidence/screenshots/azure-signal-atlas.png`
- `evidence/screenshots/azure-foundry-floor-mobile.png`
- `evidence/videos/signal-foundry-live-demo.webm`
