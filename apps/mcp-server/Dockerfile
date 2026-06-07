# syntax=docker/dockerfile:1

FROM node:22-alpine

ENV PORT=7071
ENV SIGNAL_FOUNDRY_AUTH_MODE=demo
ENV SIGNAL_FOUNDRY_REGISTRY_MODE=json
ENV SIGNAL_FOUNDRY_REGISTRY_PATH=/workspace/data/signal-foundry-seed.json

COPY package.json /workspace/package.json
COPY package-lock.json /workspace/package-lock.json
COPY tsconfig.base.json /workspace/tsconfig.base.json
COPY packages/shared/package.json /workspace/packages/shared/package.json
COPY apps/mcp-server/package.json /workspace/apps/mcp-server/package.json

RUN npm --prefix /workspace ci

COPY packages/shared /workspace/packages/shared
COPY apps/mcp-server /workspace/apps/mcp-server
COPY data/signal-foundry-seed.json /workspace/data/signal-foundry-seed.json

RUN npm --prefix /workspace run typecheck --workspace @signal-foundry/mcp-server

EXPOSE 7071

CMD ["/workspace/node_modules/.bin/tsx", "/workspace/apps/mcp-server/src/index.ts"]
