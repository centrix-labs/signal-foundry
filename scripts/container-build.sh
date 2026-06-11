#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Users/mattgraves/Development/hackathon-enterprise"
IMAGE_NAME="${SIGNAL_FOUNDRY_LOCAL_IMAGE:-signal-foundry-mcp:local}"

docker build \
  --file "$REPO_ROOT/apps/mcp-server/Dockerfile" \
  --tag "$IMAGE_NAME" \
  "$REPO_ROOT"

echo "Built $IMAGE_NAME"
