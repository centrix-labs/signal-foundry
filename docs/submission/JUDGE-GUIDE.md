# Judge Guide — Signal Foundry

## 60-second orientation

Signal Foundry turns employee AI ideas into governed, human-approved Copilot
workflows. Copilot Chat agent (discovery + proposals) → external MCP server
(deterministic risk gate + Azure AI Foundry advisory reasoning) → human review
→ audit-safe release packets, all visible on the Foundry Floor command center.

## Live demo (no setup)

- Foundry Floor: https://red-coast-0b0c14e0f.7.azurestaticapps.net
  - **Demo login (pre-filled on the page): `judge@asteria-dynamics.example` / `signal-foundry-2026`** — click **Launch Console**. (Synthetic tenant; credential is intentionally public for judging.)
- MCP health: https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/health
- Tool list: same host, `/tools`

## Run locally (Node 20+)

```bash
git clone https://github.com/centrix-labs/signal-foundry /tmp/signal-foundry
npm --prefix /tmp/signal-foundry install
npm --prefix /tmp/signal-foundry run validate
npm --prefix /tmp/signal-foundry run test:e2e
npm --prefix /tmp/signal-foundry run dev:all
```

`npm run validate` includes typecheck, tests, evidence validation, Copilot
package validation, Work IQ + Foundry readiness, and Adaptive Card validation.

Demo actors (send as `x-sf-actor-id` header or `Bearer demo-actor-<name>`):
`actor-priya` (employee), `actor-alex` (reviewer), `actor-dana` (admin).

Golden flow against the local server:

```bash
curl -s -X POST localhost:7071/admin/reset -H "x-sf-actor-id: actor-dana"
# then create -> score -> submit -> approve -> release via POST /tools/<name>
# (tests/e2e/golden-flow.spec.ts is the executable reference for exact payloads)
```

## What to look for

1. **Confirmation gate:** any mutation without `confirmed: true` fails at both
   runtime and schema level (`packages/shared/src/schemas.ts`).
2. **Multi-step reasoning, then the guarantee:** score the seeded proposal
   `prop-autonomous-renewal-outreach` per
   `apps/copilot-agent/docs/advisory-disagreement-demo.md`. First read the
   advisory deliberation — up to five explicit `signal → concern →
   suggestedControl` steps from the Azure AI Foundry model (`advisory.ts`),
   rendered in full. Then the deterministic gate issues the verdict of record;
   on disagreement the model's reasoning informs and the gate guarantees. The
   gate (`risk.ts`) is intentionally a small, pure, auditable function — that
   simplicity is the point: it is regulator-explainable, injection-immune, and
   makes the outcome **byte-identical with advisory on or off**, enforced by
   `advisory.test.ts` → "never changes the deterministic verdict regardless of
   advisory outcome." The sophistication lives in the reasoning; the
   certainty lives in the gate.
3. **Unauthorized path:** approve as `actor-priya` → sanitized 403, no stack
   traces, rejection logged in the MCP Activity Rail.
4. **Anti-surveillance:** the agent instructions refuse monitoring/ranking asks
   (`apps/copilot-agent/package/declarative-agent.azure.json`).
5. **Work IQ + Foundry proof:** `npm run validate:workiq-foundry` checks the
   Copilot grounding, MCP Work IQ tools, Foundry advisory path, portal rendering,
   and evidence honesty. See
   `docs/submission/work-iq-foundry-readiness.md`.
6. **Copilot package:** sideload-ready v0.1.5 zip under `evidence/copilot/`,
   hash-pinned by `npm run validate:copilot`; Adaptive Card templates inline in
   the Copilot action manifest (`npm run validate:cards`).

## Evidence map

`evidence/judge-evidence-checklist.md` maps every rubric criterion to its
artifact; `evidence/copilot/copilot-evidence-capture-runbook.md` documents the
sideload path and the tenant-dependent captures.
