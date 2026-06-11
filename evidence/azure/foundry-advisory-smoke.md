# Azure AI Foundry Advisory Smoke

Date: 2026-06-11

## Resource State

- Azure AI Foundry / Azure OpenAI account: `aif-signal-foundry`
- Resource group: `rg-signal-foundry-hackathon`
- Endpoint: `https://aif-signal-foundry.openai.azure.com`
- Deployment: `sf-advisory-gpt41-mini`
- Model: `gpt-4.1-mini`
- Model version: `2025-04-14`
- SKU: `Standard`
- Capacity: `1`
- Local auth: disabled; MCP uses the Container App system-assigned managed identity.

## Runtime State

- MCP image: `acrsignalfoundry.azurecr.io/signal-foundry-mcp:checkpoint-f`
- Container App revision: `ca-signal-foundry-mcp--0000021`
- `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry`
- `SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT=https://aif-signal-foundry.openai.azure.com`
- `SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT=sf-advisory-gpt41-mini`
- `SIGNAL_FOUNDRY_FOUNDRY_API_VERSION=2024-10-21`

## Live Smoke

Live MCP proposal/risk smoke passed on 2026-06-11:

- Created proposal: `prop-idem-live-foundry-create-mqa3bc29`
- Scored proposal through deployed MCP endpoint.
- Deterministic risk level: `high`
- Advisory status: `available`
- Advisory model returned by runtime: `gpt-4.1-mini-2025-04-14`
- Advisory agreement with deterministic gate: `true`
- Correlation ID: `corr-live-foundry-score-mqa3bc29`

The advisory response included five sanitized reasoning steps. No raw Microsoft 365 content, customer records, secrets, tokens, or personal data were used in the request or response.

## Evidence Files

- `evidence/azure/foundry-account-state.json`
- `evidence/azure/foundry-deployment-state.json`
- `evidence/azure/container-app-state.json`
- `evidence/azure/resource-list.json`
