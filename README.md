# Signal Foundry

Signal Foundry turns raw work signals and employee AI ideas into governed, risk-reviewed, human-approved, reusable Copilot workflows.

Brand promise: `Raw Signals | Forged with Intelligence | Approved Workflows`

## Live Demo

- Foundry Floor: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`
- MCP/API: `https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io`
- Evidence summary: `evidence/azure/deployed-smoke-results.md`

## Local Development

```bash
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise install
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run validate
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run dev:all
```

Local endpoints:

- MCP/API: `http://127.0.0.1:7071`
- Foundry Floor: `http://127.0.0.1:5173`

## Local Container

```bash
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run container:build
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run container:run
npm --prefix /Users/mattgraves/Documents/hackathon-enterprise run smoke:local
```

## Azure Deployment

```bash
bash /Users/mattgraves/Documents/hackathon-enterprise/scripts/deploy.sh --plan
bash /Users/mattgraves/Documents/hackathon-enterprise/scripts/deploy.sh --what-if
bash /Users/mattgraves/Documents/hackathon-enterprise/scripts/deploy.sh --apply --build-image --deploy-static
```

Before `--apply`, declare the blast radius and rollback path. The target resource group is `rg-signal-foundry-hackathon` in subscription `YOUR-AZURE-SUBSCRIPTION-ID`.

## Safety

- Synthetic enterprise data only by default.
- No raw Microsoft 365 content, secrets, tokens, PII, stack traces, or production data in UI, logs, screenshots, release packets, or evidence.
- Human review is required before release.
- Deterministic risk scoring is the source of truth; optional LLM output is advisory only.
