#!/usr/bin/env bash
set -euo pipefail

MODE="plan"
TENANT_ID="${SIGNAL_FOUNDRY_TENANT_ID:-YOUR-ENTRA-TENANT-ID}"
APP_NAME="${SIGNAL_FOUNDRY_ENTRA_APP_NAME:-Signal Foundry MCP API}"
API_URL="${SIGNAL_FOUNDRY_AZURE_MCP_URL:-https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io}"
REDIRECT_URI="${SIGNAL_FOUNDRY_OAUTH_REDIRECT_URI:-}"

usage() {
  cat <<USAGE
Usage: bash /Users/mattgraves/Documents/hackathon-enterprise/scripts/register-entra-app.sh [--plan|--apply]

Environment:
  SIGNAL_FOUNDRY_OAUTH_REDIRECT_URI  Required for --apply.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plan) MODE="plan" ;;
    --apply) MODE="apply" ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

cat <<PLAN
Signal Foundry Entra app registration
Mode: $MODE
Tenant: $TENANT_ID
Name: $APP_NAME
Identifier URI: $API_URL
Redirect URI: ${REDIRECT_URI:-<required before apply>}

Blast radius for --apply: creates one tenant app registration and no secrets.
Rollback: delete the created app registration and remove the OAuthPluginVault reference.
PLAN

if [[ "$MODE" == "plan" ]]; then
  exit 0
fi

if [[ -z "$REDIRECT_URI" ]]; then
  echo "SIGNAL_FOUNDRY_OAUTH_REDIRECT_URI is required for --apply." >&2
  exit 1
fi

az account show --query tenantId -o tsv | grep -Fx "$TENANT_ID" >/dev/null

az ad app create \
  --display-name "$APP_NAME" \
  --sign-in-audience AzureADMyOrg \
  --identifier-uris "$API_URL" \
  --web-redirect-uris "$REDIRECT_URI" \
  --query "{appId:appId,id:id,displayName:displayName}" \
  -o json
