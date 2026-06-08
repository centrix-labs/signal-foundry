#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SIGNAL_FOUNDRY_LOCAL_MCP_URL:-http://127.0.0.1:7071}"

curl -fsS "$BASE_URL/health" >/dev/null
curl -fsS "$BASE_URL/tools" >/dev/null
curl -fsS "$BASE_URL/openapi.json" >/dev/null

curl -fsS -X POST "$BASE_URL/tools/recommend_capabilities_for_role" \
  -H "content-type: application/json" \
  -H "x-sf-actor-id: actor-priya" \
  --data '{"tenantId":"tenant-asteria-dynamics","projectId":"revenue-ops-launchpad","role":"Enterprise Account Manager","department":"Customer Success","workSignalSummary":"Synthetic Asteria Dynamics summaries only.","maxResults":2,"correlationId":"local-smoke-read"}' \
  >/dev/null

status="$(curl -sS -o /tmp/signal-foundry-local-unauthorized.json -w "%{http_code}" \
  -X POST "$BASE_URL/tools/approve_capability" \
  -H "content-type: application/json" \
  -H "x-sf-actor-id: actor-priya" \
  --data '{"tenantId":"tenant-asteria-dynamics","projectId":"revenue-ops-launchpad","idempotencyKey":"local-smoke-bad-approve","proposalId":"prop-missing","reviewer":"Priya Shah","approvalNotes":"Unauthorized smoke.","confirmed":true}')"

if [[ "$status" != "403" ]]; then
  echo "Expected unauthorized approval to return 403, got $status" >&2
  exit 1
fi

echo "Local MCP smoke passed at $BASE_URL"
