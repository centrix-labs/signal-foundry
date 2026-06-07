#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${SIGNAL_FOUNDRY_LOCAL_IMAGE:-signal-foundry-mcp:local}"
PORT="${SIGNAL_FOUNDRY_LOCAL_PORT:-7071}"

docker run --rm \
  --publish "$PORT:7071" \
  --env PORT=7071 \
  --env SIGNAL_FOUNDRY_AUTH_MODE=demo \
  --env SIGNAL_FOUNDRY_REGISTRY_MODE=json \
  "$IMAGE_NAME"
