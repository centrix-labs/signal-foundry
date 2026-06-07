# Checkpoint F Deployment Assets

Status: prepared only. No Azure resources were deployed or mutated by this work.

## Prepared Assets

- `infra/main.bicep` creates the target resource group and invokes the resource
  group module.
- `infra/resources.bicep` defines Log Analytics, Application Insights, ACR
  Basic, Storage Tables, Key Vault Standard, Container Apps, Static Web Apps,
  and least-scope ACR Pull plus Storage Table Data Contributor assignments for
  the Container App managed identity.
- `infra/main.parameters.json` pins the subscription, resource group, region,
  service names, scale-to-zero, and Free/Basic SKUs.
- `scripts/deploy.sh` provides guarded `--plan`, `--what-if`, `--apply`,
  `--build-image`, and `--deploy-static` modes.
- `apps/mcp-server/Dockerfile` prepares the MCP container image build path.

## Azure Resources

| Resource | Name | Cost posture |
| --- | --- | --- |
| Resource group | `rg-signal-foundry-hackathon` | delete after judging |
| Log Analytics | `law-signal-foundry` | 30-day retention |
| Application Insights | `appi-signal-foundry` | workspace-based compact telemetry |
| Azure Container Registry | `acrsignalfoundry` | Basic SKU |
| Storage account | `stsignalfoundry` | Standard LRS Table Storage |
| Key Vault | `kv-signal-foundry` | Standard, RBAC, no seeded secrets |
| Container Apps environment | `cae-signal-foundry` | consumption |
| MCP Container App | `ca-signal-foundry-mcp` | `minReplicas=0`, `maxReplicas=1`, managed identity |
| Static Web Apps | `swa-signal-foundry` | Free SKU |

## Registry Tables

- `Capabilities`
- `CapabilityProposals`
- `RiskReviews`
- `ReviewItems`
- `ReleasePackets`
- `McpActivity`
- `AuditEvents`

## Budget And Manual Alert Notes

Before demo traffic begins, create an Azure Budget scoped to
`rg-signal-foundry-hackathon` or add a manual calendar reminder to inspect Cost
Management before and after each demo block. Recommended temporary alert:

- Amount: `$25`
- Thresholds: 50%, 80%, and 100%
- Recipients: hackathon operator and lead
- Cleanup: remove recipients and delete the resource group after judging

## Rollback Notes

- Container image rollback: update `ca-signal-foundry-mcp` to the previous ACR
  tag or the public placeholder image.
- Scale rollback: keep `minReplicas=0`; set `maxReplicas=0` during idle windows
  if Azure allows the setting, otherwise disable ingress or delete the app.
- Registry rollback: export needed table rows, then delete individual tables or
  the whole storage account.
- Secret rollback: remove temporary Key Vault secrets; no secrets are created by
  these assets.
- Full cleanup: delete `rg-signal-foundry-hackathon` after evidence capture.

## Current Blockers

Azure smoke tests require an authorized deployment and were intentionally not run
for Checkpoint F asset preparation. The deployment script uses ACR cloud build so
the local Docker daemon is not required for the hackathon deployment path.
