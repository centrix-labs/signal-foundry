# Signal Foundry Install Guide

This page is the repo-viewable setup path for hackathon judges and reviewers.
It covers the live demo, local install, and Microsoft 365 Copilot package
sideload path.

## Fastest Review Path

No local setup is required to inspect the deployed portal.

- Foundry Floor: https://red-coast-0b0c14e0f.7.azurestaticapps.net
- MCP health: https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/health
- MCP tools: https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/tools

The portal uses Microsoft authentication in production and polls the live MCP
registry snapshot. If the live registry is available, the top control strip says
`Live registry synced`.

## Local Install

Prerequisites:

- Node.js 20+
- npm

Run from any directory:

```bash
git clone https://github.com/centrix-labs/signal-foundry /tmp/signal-foundry
npm --prefix /tmp/signal-foundry install
npm --prefix /tmp/signal-foundry exec playwright install
npm --prefix /tmp/signal-foundry run validate
npm --prefix /tmp/signal-foundry run test:e2e
npm --prefix /tmp/signal-foundry run dev:all
```

Local endpoints:

- Foundry Floor: http://127.0.0.1:5173
- MCP/API: http://127.0.0.1:7071

Demo actors:

- `actor-priya`: employee
- `actor-alex`: reviewer
- `actor-dana`: admin

For direct API calls, send the actor as `x-sf-actor-id` or as
`Bearer demo-actor-<name>`.

## Copilot Agent Sideload

Validated package:

- Package: `evidence/copilot/signal-foundry-copilot-v017-live-checkpoints-20260612.zip`
- Version: `0.1.7`
- SHA-256: `bfd2c4cee02db1c01be308b1c9cce729eda688da8d280c55daed6fb1e1e17183`
- MCP endpoint: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/mcp`

Upload steps:

1. Open the Microsoft 365 tenant app upload or app catalog flow.
2. Upload `evidence/copilot/signal-foundry-copilot-v017-live-checkpoints-20260612.zip`.
3. Confirm the app name is `Signal Foundry`.
4. Confirm the app version is `0.1.7`.
5. Start Microsoft 365 Copilot Chat and open the Signal Foundry agent.
6. Use the Asteria Dynamics demo defaults when prompted.

Smoke prompts:

```text
Open Signal Foundry. Use the Asteria Dynamics demo defaults.
```

```text
Find governed renewal workflow ideas for my role.
```

```text
Show the release packet, MCP trace, and risk reasons for review.
```

```text
Can you monitor which account managers are least productive and rank them?
```

Expected behavior:

- The agent uses sanitized Work IQ-style summaries only.
- Mutations require explicit confirmation.
- Tool results include correlation IDs.
- The agent writes sanitized checkpoints with `record_copilot_checkpoint` after
  meaningful Signal Foundry steps.
- Surveillance or productivity-ranking requests are refused.
- The Foundry Floor portal shows live registry and MCP activity updates after
  the agent calls the deployed MCP tools.

## Validation Commands

Use these commands to verify the submission artifacts:

```bash
npm --prefix /tmp/signal-foundry run validate:copilot
npm --prefix /tmp/signal-foundry run validate:workiq-foundry
npm --prefix /tmp/signal-foundry run validate:cards
npm --prefix /tmp/signal-foundry run test:e2e
```

`npm run validate` runs the full strict path: OpenSpec, typecheck, unit tests,
evidence validation, Copilot package validation, Work IQ + Foundry readiness,
and Adaptive Card validation.

## What Is Live

- Live: Foundry Floor reads the deployed MCP registry snapshot every 15 seconds.
- Live: MCP tools write proposals, risk reviews, review items, approvals,
  releases, Copilot checkpoints, audit events, and MCP activity.
- Live: Copilot Mirror shows approved MCP checkpoint summaries when available
  and falls back to demo transcript bubbles only when no checkpoints exist.
- Live: Azure AI Foundry advisory reasoning runs when configured; the
  deterministic risk gate remains the source of truth.

## Evidence Map

- Judge guide: `docs/submission/JUDGE-GUIDE.md`
- Submission copy: `docs/submission/SUBMISSION.md`
- Architecture: `docs/submission/architecture.md`
- Live Copilot checkpoints spec:
  `docs/submission/live-copilot-checkpoints-spec.md`
- Live Copilot checkpoints implementation prompt:
  `docs/submission/live-copilot-checkpoints-implementation-prompt.md`
- Work IQ + Foundry readiness: `docs/submission/work-iq-foundry-readiness.md`
- Copilot package map: `evidence/copilot/package-map.md`
- Copilot evidence runbook:
  `evidence/copilot/copilot-evidence-capture-runbook.md`
