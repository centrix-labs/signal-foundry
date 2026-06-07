# Microsoft Entra Registration Notes

Signal Foundry's deployed MCP/API path is hosted in Azure Container Apps. The current hackathon runtime uses synthetic demo actor headers for repeatable judging. A production Microsoft 365 Copilot action path should replace that with tenant-owned Microsoft Entra/OAuth configuration.

## Registration Scope

- Tenant: `YOUR-ENTRA-TENANT-ID`
- API endpoint: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Static app: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`
- Manifest placeholder: `SIGNAL_FOUNDRY_ENTRA_OAUTH_REFERENCE_ID`

## Required Entra App Settings

- Name: `Signal Foundry MCP API`
- Supported account types: single tenant.
- Redirect URI: the Microsoft 365 Copilot plugin OAuth redirect URI supplied by the tenant's Copilot action configuration.
- API permission model: delegated access for authenticated Copilot users.
- Exposed API scope: `SignalFoundry.Mcp.Access`
- Secret storage: Azure Key Vault `kv-signal-foundry` or Microsoft 365 plugin OAuth vault. Do not commit client secrets.

## Automation

Use `scripts/register-entra-app.sh --plan` to print the intended registration. Use `--apply` only after confirming the tenant redirect URI and plugin OAuth vault flow.

## Rollback

- Delete the Entra app registration created for Signal Foundry.
- Remove any OAuthPluginVault reference from the Copilot package.
- Remove temporary Key Vault secrets after sideload testing.
