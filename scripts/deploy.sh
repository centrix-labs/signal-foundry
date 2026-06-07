#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="$(realpath "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

SUBSCRIPTION_ID="${SIGNAL_FOUNDRY_AZURE_SUBSCRIPTION_ID:-YOUR-AZURE-SUBSCRIPTION-ID}"
RESOURCE_GROUP="${SIGNAL_FOUNDRY_AZURE_RESOURCE_GROUP:-rg-signal-foundry-hackathon}"
LOCATION="${SIGNAL_FOUNDRY_AZURE_REGION:-eastus2}"
DEPLOYMENT_NAME="${SIGNAL_FOUNDRY_AZURE_DEPLOYMENT_NAME:-signal-foundry-checkpoint-f}"
ACR_NAME="${SIGNAL_FOUNDRY_AZURE_ACR_NAME:-acrsignalfoundry}"
CONTAINER_APP_NAME="${SIGNAL_FOUNDRY_AZURE_CONTAINER_APP_NAME:-ca-signal-foundry-mcp}"
STATIC_WEB_APP_NAME="${SIGNAL_FOUNDRY_AZURE_STATIC_WEB_APP_NAME:-swa-signal-foundry}"
MCP_IMAGE_NAME="${SIGNAL_FOUNDRY_MCP_IMAGE_NAME:-signal-foundry-mcp}"
MCP_IMAGE_TAG="${SIGNAL_FOUNDRY_MCP_IMAGE_TAG:-checkpoint-f}"

BICEP_FILE="$REPO_ROOT/infra/main.bicep"
PARAMETERS_FILE="$REPO_ROOT/infra/main.parameters.json"
BICEP_OUTPUT="/tmp/signal-foundry-main.json"
MCP_DOCKERFILE="$REPO_ROOT/apps/mcp-server/Dockerfile"
MCP_DOCKERFILE_RELATIVE="apps/mcp-server/Dockerfile"
MCP_IMAGE_REF="$MCP_IMAGE_NAME:$MCP_IMAGE_TAG"
REMOTE_IMAGE="$ACR_NAME.azurecr.io/$MCP_IMAGE_REF"
FRONTEND_DIST="$REPO_ROOT/apps/foundry-floor/dist"

MODE="plan"
BUILD_IMAGE="0"
DEPLOY_STATIC="0"
RUN_TYPECHECK="1"

usage() {
  cat <<USAGE
Usage: bash /Users/mattgraves/Documents/hackathon-enterprise/scripts/deploy.sh [--plan|--what-if|--apply] [--build-image] [--deploy-static] [--skip-typecheck]

Default mode is --plan. It validates local assets and prints the Azure commands
without mutating Azure resources.

Modes:
  --plan          Build Bicep locally and print guarded deployment commands.
  --what-if       Run Azure subscription what-if. No Azure resource mutation.
  --apply         Create or update Azure resources. Requires explicit operator approval.

Options:
  --build-image   With --apply, build and push the MCP image through Azure Container Registry and update Container Apps.
  --deploy-static With --apply, build Foundry Floor and deploy dist through Azure Static Web Apps CLI.
  --skip-typecheck
                  Skip npm typecheck for emergencies only.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plan)
      MODE="plan"
      ;;
    --what-if)
      MODE="what-if"
      ;;
    --apply)
      MODE="apply"
      ;;
    --build-image)
      BUILD_IMAGE="1"
      ;;
    --deploy-static)
      DEPLOY_STATIC="1"
      ;;
    --skip-typecheck)
      RUN_TYPECHECK="0"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
  shift
done

if [[ "$SUBSCRIPTION_ID" != "YOUR-AZURE-SUBSCRIPTION-ID" ]]; then
  echo "Refusing to continue: expected Signal Foundry subscription, got $SUBSCRIPTION_ID" >&2
  exit 1
fi

echo "Signal Foundry Checkpoint F deployment assets"
echo "Mode: $MODE"
echo "Subscription: $SUBSCRIPTION_ID"
echo "Resource group: $RESOURCE_GROUP"
echo "Region: $LOCATION"

if [[ "$RUN_TYPECHECK" == "1" ]]; then
  npm --prefix "$REPO_ROOT" run typecheck
fi

az bicep build --file "$BICEP_FILE" --outfile "$BICEP_OUTPUT"

print_azure_commands() {
  cat <<COMMANDS
Azure commands prepared:
az account set --subscription "$SUBSCRIPTION_ID"
az deployment sub what-if --name "$DEPLOYMENT_NAME" --location "$LOCATION" --template-file "$BICEP_FILE" --parameters "@$PARAMETERS_FILE"
az deployment sub create --name "$DEPLOYMENT_NAME" --location "$LOCATION" --template-file "$BICEP_FILE" --parameters "@$PARAMETERS_FILE"
az acr build --registry "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --image "$MCP_IMAGE_REF" --file "$MCP_DOCKERFILE_RELATIVE" "$REPO_ROOT"
COMMANDS
}

if [[ "$MODE" == "plan" ]]; then
  print_azure_commands
  echo "Plan complete. No Azure resources were deployed or mutated."
  exit 0
fi

az account set --subscription "$SUBSCRIPTION_ID"

if [[ "$MODE" == "what-if" ]]; then
  az deployment sub what-if \
    --name "$DEPLOYMENT_NAME" \
    --location "$LOCATION" \
    --template-file "$BICEP_FILE" \
    --parameters "@$PARAMETERS_FILE"
  echo "What-if complete. No Azure resources were deployed or mutated."
  exit 0
fi

if [[ "$MODE" != "apply" ]]; then
  echo "Invalid mode: $MODE" >&2
  exit 2
fi

cat <<APPLY_WARNING
About to create or update Azure resources.
Blast radius: resource group $RESOURCE_GROUP in subscription $SUBSCRIPTION_ID.
Rollback: redeploy the previous Bicep parameters, update the container app to a known-good image, or delete $RESOURCE_GROUP after evidence capture.
Cost guardrails: Container Apps minReplicas=0, maxReplicas=1, Static Web Apps Free, ACR Basic, Log Analytics 30-day retention.
APPLY_WARNING

az deployment sub create \
  --name "$DEPLOYMENT_NAME" \
  --location "$LOCATION" \
  --template-file "$BICEP_FILE" \
  --parameters "@$PARAMETERS_FILE"

if [[ "$BUILD_IMAGE" == "1" ]]; then
  az acr build \
    --registry "$ACR_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$MCP_IMAGE_REF" \
    --file "$MCP_DOCKERFILE_RELATIVE" \
    "$REPO_ROOT"

  az containerapp registry set \
    --name "$CONTAINER_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --server "$ACR_NAME.azurecr.io" \
    --identity system

  az containerapp update \
    --name "$CONTAINER_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$REMOTE_IMAGE"

  echo "Image build and Container Apps update complete: $REMOTE_IMAGE"
else
  echo "Apply complete. Skipped image build; rerun with --apply --build-image for the MCP runtime image."
fi

if [[ "$DEPLOY_STATIC" == "1" ]]; then
  npm --prefix "$REPO_ROOT" run build --workspace @signal-foundry/foundry-floor
  SWA_TOKEN="$(az staticwebapp secrets list --name "$STATIC_WEB_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.apiKey" -o tsv)"
  if [[ -z "$SWA_TOKEN" ]]; then
    echo "Static Web Apps deployment token was empty; cannot deploy frontend." >&2
    exit 1
  fi
  SWA_CLI_DEPLOYMENT_TOKEN="$SWA_TOKEN" npx -y @azure/static-web-apps-cli deploy "$FRONTEND_DIST" --env production
  echo "Static Web Apps deployment complete for $STATIC_WEB_APP_NAME."
fi
