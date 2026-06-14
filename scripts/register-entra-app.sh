#!/usr/bin/env bash
set -euo pipefail

MODE="plan"
TENANT_ID="${SIGNAL_FOUNDRY_TENANT_ID:-YOUR-ENTRA-TENANT-ID}"
APP_NAME="${SIGNAL_FOUNDRY_ENTRA_APP_NAME:-Signal Foundry MCP API}"
API_URL="${SIGNAL_FOUNDRY_AZURE_MCP_URL:-https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io}"
REDIRECT_URI="${SIGNAL_FOUNDRY_OAUTH_REDIRECT_URI:-}"

usage() {
  cat <<USAGE
Usage: bash scripts/register-entra-app.sh [--plan|--apply]

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

APP_JSON=$(az ad app create \
  --display-name "$APP_NAME" \
  --sign-in-audience AzureADMyOrg \
  --web-redirect-uris "$REDIRECT_URI" \
  --query "{appId:appId,id:id,displayName:displayName}" \
  -o json)
echo "$APP_JSON"
APP_ID=$(echo "$APP_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["appId"])')
OBJ_ID=$(echo "$APP_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
SCOPE_ID=$(uuidgen | tr 'A-Z' 'a-z')

# Expose the delegated scope Copilot's OAuth registration requests. Without
# this, a bare access_as_user scope resolves against Microsoft Graph and
# sign-in fails with AADSTS650053.
az rest --method PATCH --url "https://graph.microsoft.com/v1.0/applications/$OBJ_ID" \
  --headers "Content-Type=application/json" \
  --body "{
    \"identifierUris\": [\"api://$APP_ID\"],
    \"api\": {
      \"requestedAccessTokenVersion\": 2,
      \"oauth2PermissionScopes\": [{
        \"id\": \"$SCOPE_ID\",
        \"adminConsentDescription\": \"Allows Microsoft 365 Copilot to call the Signal Foundry MCP API as the signed-in user.\",
        \"adminConsentDisplayName\": \"Access Signal Foundry MCP as the user\",
        \"userConsentDescription\": \"Allows Copilot to call Signal Foundry on your behalf.\",
        \"userConsentDisplayName\": \"Access Signal Foundry on your behalf\",
        \"isEnabled\": true,
        \"type\": \"User\",
        \"value\": \"access_as_user\"
      }]
    }
  }"
echo "OAuth client registration Scope field must be: api://$APP_ID/access_as_user"
