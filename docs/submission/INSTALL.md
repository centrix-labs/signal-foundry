# Signal Foundry Install Guide

This page is the repo-viewable setup path for hackathon judges and reviewers.
It covers the live demo, local install, and Microsoft 365 Copilot package
sideload path.

## Fastest Review Path

No local setup is required to inspect the deployed portal.

- Foundry Floor: https://red-coast-0b0c14e0f.7.azurestaticapps.net
- MCP health: (internal Azure Container Apps endpoint)/health
- MCP tools: (internal Azure Container Apps endpoint)/tools

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

### Tenant prerequisites

- Custom app upload (sideloading) enabled for your user in the Teams admin
  center.
- A Microsoft 365 Copilot license or tenant metered usage: the agent declares
  People and Meetings grounding capabilities, and any capability beyond
  WebSearch requires one of the two (declarative agent manifest licensing
  note, verified 2026-06-10).
- Rights to create an Entra app registration and a Teams Developer Portal
  OAuth client registration (one-time, below).

### One-time Entra + OAuth setup

The MCP action authenticates with `OAuthPluginVault`. Two registrations must
agree, or sign-in fails:

1. Entra app registration `Signal Foundry MCP API` must expose a delegated
   scope. Run `bash scripts/register-entra-app.sh --apply` (creates the app,
   sets `api://<appId>` as the Application ID URI, and exposes
   `access_as_user` with v2 tokens), or follow
   `apps/copilot-agent/docs/entra-registration.md`.
2. Teams Developer Portal -> Tools -> OAuth client registration: client ID and
   secret from that app, and the Scope field set to the FULLY QUALIFIED
   string `api://<appId>/access_as_user`. A bare `access_as_user` resolves
   against Microsoft Graph and sign-in fails with `AADSTS650053`.
3. Put the resulting OAuth registration ID in the action manifest's
   `runtimes[0].auth.reference_id` before packaging (already set in the
   validated package for the demo tenant).

Expect a one-time consent dialog ("Access Signal Foundry on your behalf") on
first use, and a confirmation prompt on first plugin invocation — both are
correct behavior, not errors.

Validated package:

- Package: `evidence/copilot/signal-foundry-copilot-v103-card-polish-20260613.zip`
- Version: `1.0.3`
- SHA-256: `430efd1a34297a67aac9f6e1b42d50759f0d74ad39b75fa575d5ad3ec120db05`
- MCP endpoint: `(internal Azure Container Apps endpoint)/mcp`

Upload steps (CLI path):

```bash
npm install -g @microsoft/m365agentstoolkit-cli
atk auth login           # interactive Microsoft sign-in
atk install --file-path evidence/copilot/signal-foundry-copilot-v103-card-polish-20260613.zip
```

Or via the portal: open the Microsoft 365 tenant app upload / app catalog flow
and upload the same zip. Either way:

1. Confirm the app name is `Signal Foundry` and the version is `1.0.3`
   (an existing 1.0.x install is upgraded in place).
2. Start Microsoft 365 Copilot Chat and open the Signal Foundry agent.
3. Use the Asteria Dynamics demo defaults when prompted; say `menu` for the
   guided journey, or click the Guided Tour conversation starter.

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

- Judge guide: `docs/submission/DEMO-GUIDE.md`
- Submission copy: `docs/submission/SUBMISSION.md`
- Architecture: `docs/submission/architecture.md`
- Live Copilot checkpoints spec:
  `docs/submission/live-copilot-checkpoints-spec.md`
- Work IQ + Foundry readiness: `docs/submission/work-iq-foundry-readiness.md`
- Copilot package map: `evidence/copilot/package-map.md`
- Copilot evidence runbook:
  `evidence/copilot/copilot-evidence-capture-runbook.md`
