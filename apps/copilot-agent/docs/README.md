# Signal Foundry Copilot Agent Package

This directory contains the Microsoft 365 Copilot Chat declarative agent assets for Signal Foundry.

## Package Layout

- `package/manifest.json`: default local sideload app manifest.
- `package/manifest.local.json`: local endpoint app manifest.
- `package/manifest.azure.json`: Azure endpoint app manifest.
- `package/declarative-agent.local.json`: local declarative agent manifest.
- `package/declarative-agent.azure.json`: Azure declarative agent manifest.
- `package/actions/signal-foundry-mcp.local.json`: local MCP plugin action manifest.
- `package/actions/signal-foundry-mcp.azure.json`: Azure MCP plugin action manifest.
- `package/actions/signal-foundry-api.local.json`: local OpenAPI fallback action manifest.
- `package/actions/signal-foundry-api.azure.json`: Azure OpenAPI fallback action manifest.
- `package/actions/mcp-tools.json`: MCP `tools/list` contract aligned to the OpenSpec tool contract.
- `package/openapi/signal-foundry.local.json`: local REST API fallback contract.
- `package/openapi/signal-foundry.azure.json`: Azure REST API fallback contract.
- `package/color.png` and `package/outline.png`: required Microsoft 365 app package icons.

## Sideload Steps

1. For local MCP testing, keep `manifest.json` as-is or copy `manifest.local.json` over it.
2. For Azure MCP testing, copy `manifest.azure.json` over `manifest.json`.
3. Confirm the app manifest points to the intended declarative agent file.
4. Confirm the declarative agent action points to the intended MCP plugin file.
5. Replace placeholder Azure domains, app IDs, and `OAuthPluginVault` reference IDs with tenant-owned Microsoft values.
6. Zip the contents of `apps/copilot-agent/package`, not the directory itself.
7. Upload the package through the tenant's Microsoft 365 app sideload or app catalog flow.

## Runtime Requirements

- Microsoft 365 Copilot Chat declarative agent runtime.
- Microsoft Entra ID or OAuth-compatible authentication for Azure MCP/API access.
- Local development can use the local MCP/API endpoint, but production and judging should use tenant-owned Microsoft/Azure hosting.
- No personal non-Microsoft LLM account is required or allowed for the runtime path.

## Confirmation And Audit

All mutation tools require explicit user confirmation, authenticated actor context, tenant/project scope, idempotency key, and correlation ID. The agent instructions refuse employee-monitoring requests and require synthetic Work IQ-style summaries instead of raw Microsoft 365 content.
