# Microsoft Entra Registration Notes

Signal Foundry's deployed MCP/API path is hosted in Azure Container Apps. The current hackathon runtime uses synthetic demo actor headers for repeatable judging. A production Microsoft 365 Copilot action path should replace that with tenant-owned Microsoft Entra/OAuth configuration.

## Registration Scope

- Tenant: `<tenantId>` (your Microsoft Entra tenant ID)
- API endpoint: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Static app: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`
- Manifest placeholder: `SIGNAL_FOUNDRY_ENTRA_OAUTH_REFERENCE_ID`

## Required Entra App Settings

- Name: `Signal Foundry MCP API`
- Supported account types: single tenant.
- Redirect URI: the Microsoft 365 Copilot plugin OAuth redirect URI supplied by the tenant's Copilot action configuration.
- API permission model: delegated access for authenticated Copilot users.
- Application ID URI: `api://<appId>`
- Exposed API scope: `access_as_user` (delegated, user-consentable, token version 2)
- OAuth client registration Scope field (Teams Developer Portal -> Tools ->
  OAuth client registration): must be the FULLY QUALIFIED string
  `api://<appId>/access_as_user`. A bare
  `access_as_user` makes Entra resolve the scope against Microsoft Graph and
  sign-in fails with AADSTS650053.
- Secret storage: Azure Key Vault `kv-signal-foundry` or Microsoft 365 plugin OAuth vault. Do not commit client secrets.

## Automation

Use `scripts/register-entra-app.sh --plan` to print the intended registration. Use `--apply` only after confirming the tenant redirect URI and plugin OAuth vault flow.

## Rollback

- Delete the Entra app registration created for Signal Foundry.
- Remove any OAuthPluginVault reference from the Copilot package.
- Remove temporary Key Vault secrets after sideload testing.


## Verified working configuration (2026-06-13, live end-to-end)

OAuth client registration (Teams Developer Portal -> Tools -> OAuth client
registration) — every field as proven in production:

| Field | Value |
| --- | --- |
| Base URL | `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io` (the API base — NOT the identity provider) |
| Client ID | the Entra app's Application (client) ID |
| Client secret | a current secret VALUE from the app (not the secret ID) |
| Authorization endpoint | `https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/authorize` |
| Token exchange endpoint | `https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/token` |
| Scope | `api://<appId>/access_as_user` (fully qualified) |
| Restrict usage by app | Any Teams app, or the CATALOG app id printed by `atk install` (not the manifest id) |

Entra app requirements (script `register-entra-app.sh --apply` covers these):
Application ID URI `api://<appId>`, delegated scope `access_as_user`, token
version 2, and BOTH web redirect URIs:
`https://teams.microsoft.com/api/platform/v1.0/oAuthConsentRedirect` and
`https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect`.

Server requirements: `GET /` on the Base URL must return 2xx (the routing
provisioner probes it), and the `/mcp` endpoint must implement the full
streamable handshake: `initialize` (echo the client's protocolVersion),
`notifications/*` -> 202, `ping`, `tools/list`, `tools/call`.

## Troubleshooting map (each observed live)

| Symptom | Cause |
| --- | --- |
| AADSTS650053 scope on resource 00000003-... | Scope field is bare; Entra resolves it against Microsoft Graph. Use the full `api://.../access_as_user` string |
| AADSTS50011 redirect mismatch | `oAuthRedirect` missing from the app's web redirect URIs |
| No sign-in prompt, no server traffic | Base URL points at the identity provider instead of the API, or app restriction names the manifest id instead of the catalog id |
| Sign-in popup blank, then "window was closed" | Browser opened the popup in a different profile/container; the auth code cannot reach the opener. Use Edge/Chrome default profile or Teams desktop |
| "Something went wrong" + RoutingAdded request id | Base URL root returned 404 to the provisioning probe |
| Tool returns no ok:true, registry unchanged, nothing logged | Confirmation sent as string "True" (fixed: coerced server-side) or MCP handshake incomplete (fixed) |
| Release fails "Invalid tool input." | Model omitted the semantic `version` (fixed: defaults to v1.0.0) |
