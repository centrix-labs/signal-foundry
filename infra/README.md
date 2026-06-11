# Signal Foundry Checkpoint F Azure Assets

These files prepare the Azure deployment surface only. Do not run an apply during
Checkpoint F unless the lead explicitly authorizes a real Azure mutation.

## Scope

- Subscription: `YOUR-AZURE-SUBSCRIPTION-ID`
- Resource group: `rg-signal-foundry-hackathon`
- Region: `eastus2`
- Services: Log Analytics, Application Insights, ACR Basic, Storage Tables,
  Key Vault Standard, Container Apps consumption, Static Web Apps Free, and an
  Azure AI Foundry / Azure OpenAI advisory deployment.

## Cost Guards

- Container Apps uses `minReplicas: 0` and `maxReplicas: 1`.
- Static Web Apps defaults to the Free SKU.
- ACR uses the Basic SKU.
- Storage uses Standard LRS tables for the MVP registry.
- Key Vault uses Standard with RBAC enabled and no seeded secrets.
- Foundry advisory uses one low-capacity `Standard` deployment and
  managed identity. No API key is stored.
- Log Analytics retention defaults to 30 days.
- The deployment tags every resource with `costGuard` and `cleanup` metadata.

Create a budget or manual cost alert before demo usage starts. If the Azure
Budget feature is unavailable to the operator, manually check Cost Management for
`rg-signal-foundry-hackathon` before and after each demo block and delete the
resource group after judging.

## Commands

Local validation only:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --plan
```

Azure what-if, no resource mutation:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --what-if
```

Authorized apply:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --apply
```

Build and push the MCP image through Azure Container Registry cloud build after
deployment is explicitly authorized:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --apply --build-image
```

Deploy Foundry Floor to Static Web Apps using the deployment token returned by
Azure CLI and consumed by the Static Web Apps CLI:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --apply --deploy-static
```

Deploy both runtime surfaces:

```bash
bash /Users/mattgraves/Development/hackathon-enterprise/scripts/deploy.sh --apply --build-image --deploy-static
```

## Azure AI Foundry Advisory

`infra/main.parameters.json` sets `enableFoundryAdvisory` to `true`. Applying the
Bicep creates:

- `Microsoft.CognitiveServices/accounts` with `kind: OpenAI`.
- A `gpt-4.1-mini` advisory deployment named `sf-advisory-gpt41-mini`.
- A managed-identity role assignment giving the MCP Container App the
  `Cognitive Services OpenAI User` role on the advisory account.
- Container App environment variables:
  - `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry`
  - `SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT`
  - `SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT`
  - `SIGNAL_FOUNDRY_FOUNDRY_API_VERSION`

The parameter file preserves the current deployed MCP image unless the operator
also uses `--build-image`.

If subscription quota or regional model availability blocks the model
deployment, set `enableFoundryAdvisory` to `false`, apply the rest of the stack,
then provision the model manually in Azure AI Foundry and set the same Container
App environment variables. Until the variables are present on the running MCP
revision, the honest demo line remains: `Advisory unavailable -- deterministic
verdict stands.`

## Rollback

- Fast rollback: scale the MCP app to zero revisions or update it back to the
  last known-good image.
- Infra rollback: redeploy the last known-good Bicep parameters.
- Foundry rollback: set `enableFoundryAdvisory=false` and redeploy, or remove the
  four `SIGNAL_FOUNDRY_FOUNDRY_*`/advisory environment variables from the
  Container App revision.
- Full cleanup: delete `rg-signal-foundry-hackathon`.
- Budget rollback: remove any temporary alert recipient after the hackathon.

Do not delete shared subscriptions, provider registrations, Entra app
registrations, or external tenant resources from this script.
