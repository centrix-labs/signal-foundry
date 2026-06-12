# Copilot Package Evidence Map

## P0 Evidence

| Rubric Gate | Evidence |
| --- | --- |
| Copilot surface | `apps/copilot-agent/package/manifest.json`, `declarative-agent.local.json`, and `declarative-agent.azure.json` define the Microsoft 365 Copilot Chat declarative agent package. |
| Work IQ grounding | Agent instructions require permission-aware summaries or synthetic Work IQ-style summaries only. |
| MCP read/write | MCP action manifests reference `mcp-tools.json`, which includes read and mutation tools with correlation IDs, including sanitized Copilot checkpoints. |
| OAuth/auth boundary | Azure action manifests use `OAuthPluginVault` placeholders; docs require tenant-owned Entra/OAuth configuration. |
| Human review | Agent instructions and tool contracts state release cannot happen before reviewer approval. |
| Risk gate | `score_capability_risk` appears in MCP and API action variants with explicit risk inputs and controls. |
| Release packet | `generate_release_packet` is a read tool and release packet prompt is included. |
| Audit safety | Safety docs and instructions ban raw Microsoft 365 content, PII, secrets, tokens, and stack traces. |
| Anti-surveillance | Safety docs and starter prompts include an employee-monitoring refusal scenario. |

## Local And Azure Variants

- Local app package: `apps/copilot-agent/package/manifest.local.json`
- Azure app package: `apps/copilot-agent/package/manifest.azure.json`
- Local MCP action: `apps/copilot-agent/package/actions/signal-foundry-mcp.local.json`
- Azure MCP action: `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json`
- Local API fallback: `apps/copilot-agent/package/actions/signal-foundry-api.local.json`
- Azure API fallback: `apps/copilot-agent/package/actions/signal-foundry-api.azure.json`

## Sideload-Ready Artifact

- Local package zip: `evidence/copilot/signal-foundry-copilot-local.zip`
- SHA-256: `96c7727d592abdab678c128adc10f4cb35d0f89850544582c32c94649e40c4d1`
- Current Azure package zip: `evidence/copilot/signal-foundry-copilot-v017-live-checkpoints-20260612.zip`
- Current Azure package SHA-256: `bfd2c4cee02db1c01be308b1c9cce729eda688da8d280c55daed6fb1e1e17183`
- Current capture runbook: `evidence/copilot/copilot-evidence-capture-runbook.md`
- Tenant-dependent follow-up: confirm the tenant-owned Entra app and `OAuthPluginVault` reference before sideload, then capture the three Copilot screenshots in the runbook.
