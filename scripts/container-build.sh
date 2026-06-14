#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="${SIGNAL_FOUNDRY_LOCAL_IMAGE:-signal-foundry-mcp:local}"

docker build \
  --file "$REPO_ROOT/apps/mcp-server/Dockerfile" \
  --tag "$IMAGE_NAME" \
  "$REPO_ROOT"

echo "Built $IMAGE_NAME"
