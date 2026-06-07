# Azure Deployment Plan: Signal Foundry

## Subscription

Use subscription:

- `YOUR-AZURE-SUBSCRIPTION-ID`

## Resource Group

Recommended:

- Name: `rg-signal-foundry-hackathon`
- Region: `eastus2`

## Required Services

| Component | Azure Service | Purpose |
| --- | --- | --- |
| MCP server | Azure Container Apps | Host remote TypeScript/Node MCP server |
| Container images | Azure Container Registry | Store MCP server image |
| Foundry Floor | Azure Static Web Apps | Host judge-facing frontend |
| Registry store | Azure Table Storage for MVP | Capability, proposal, review, release, and audit records |
| Secrets | Azure Key Vault | Store client secrets and deployment config |
| Logs | Application Insights + Log Analytics | Audit-safe telemetry and correlation IDs |
| Auth | Microsoft Entra ID | OAuth app registrations and role checks |

## Optional Services

| Component | Azure Service | Purpose |
| --- | --- | --- |
| Advanced risk rationale | Azure AI Foundry / Azure OpenAI | Explainable review text and policy reasoning |
| Managed API front door | Azure API Management | Central auth/policy layer if time allows |
| Alternate registry | Cosmos DB serverless | Use if Table Storage becomes too limiting |

## Resource Names

- Container app environment: `cae-signal-foundry`
- MCP container app: `ca-signal-foundry-mcp`
- Container registry: `acrsignalfoundry`
- Static web app: `swa-signal-foundry`
- Storage account: `stsignalfoundry`
- Key Vault: `kv-signal-foundry`
- Log Analytics workspace: `law-signal-foundry`
- Application Insights: `appi-signal-foundry`

## Deployment Order

1. Create resource group.
2. Create Log Analytics workspace.
3. Create Application Insights.
4. Create Azure Container Registry.
5. Create Azure Storage account and registry tables.
6. Create Key Vault.
7. Create Entra app registration for MCP access.
8. Build and push MCP server container image.
9. Deploy Azure Container Apps environment and MCP app.
10. Deploy Foundry Floor to Azure Static Web Apps.
11. Configure Copilot action/MCP plugin endpoint.
12. Run end-to-end smoke test.

## Registry Tables

- `Capabilities`
- `CapabilityProposals`
- `RiskReviews`
- `ReviewItems`
- `ReleasePackets`
- `McpActivity`
- `AuditEvents`

## Deployment Acceptance Criteria

- MCP health endpoint returns healthy.
- MCP tool list is available.
- Unauthorized MCP call is rejected without secrets or stack traces.
- Authorized read returns synthetic capability data.
- Authorized write creates proposal, risk review, approval, and release records.
- Foundry Floor loads from Static Web Apps.
- Foundry Floor can read registry state through MCP/API path.
- Application Insights shows audit-safe correlation IDs.
