#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Users/mattgraves/Documents/hackathon-enterprise"
MCP_PORT="${SIGNAL_FOUNDRY_LOCAL_PORT:-7071}"
FRONTEND_HOST="${SIGNAL_FOUNDRY_FRONTEND_HOST:-127.0.0.1}"

npm --prefix "$REPO_ROOT" run reset

npm --prefix "$REPO_ROOT" run dev:mcp &
MCP_PID="$!"

npm --prefix "$REPO_ROOT/apps/foundry-floor" run dev -- --host "$FRONTEND_HOST" &
FRONTEND_PID="$!"

cleanup() {
  kill "$MCP_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "MCP: http://127.0.0.1:$MCP_PORT"
echo "Foundry Floor: http://$FRONTEND_HOST:5173"
wait
