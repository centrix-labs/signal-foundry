# Hackathon Sizing: Signal Foundry

## Verdict

Signal Foundry is sized correctly only if the team treats P0 as the build target and P1 as judge polish. The complete P0 + P1 + Azure + Copilot sideload path is too large for one person in a short hackathon unless the implementation is strongly scaffolded, synthetic-data-first, and checkpoint-driven.

## Recommended Team Split

| Owner | Primary Scope | Backup Scope |
| --- | --- | --- |
| Backend/MCP | MCP server, schemas, registry, risk gate, smoke tests | Azure Table Storage adapter |
| Frontend | Foundry Floor, Signal Atlas, Review Queue, screenshots | Evidence package |
| Copilot/Agent | Declarative Agent, instructions, action manifest, sideload evidence | Demo script |
| Azure/Security | Entra notes, Container Apps, Static Web Apps, telemetry, sanitized auth failures | No-secret scan |

If fewer than four people are available, combine Copilot/Agent with Azure/Security and keep Azure AI Foundry, API Management, Cosmos DB, and live Graph/Work IQ out of scope.

## Timebox Plan

### First 2 Hours

- Create scaffold, scripts, shared types, seed data, and MCP schemas.
- Keep frontend on mocked data.
- Confirm OpenSpec validation and local run command.

### Hours 2-6

- Implement local registry, deterministic risk gate, MCP read/write tools, idempotency, and correlation IDs.
- Build Foundry Floor against local/mock data.
- Add golden reset flow.

### Hours 6-10

- Connect frontend to MCP/API path.
- Implement unauthorized scenario and no-secret/no-raw-content scan.
- Package Copilot Declarative Agent instructions and action manifest.
- Capture local demo screenshots.

### Hours 10-14

- Deploy MCP server and frontend to Azure.
- Run deployed smoke tests.
- Capture Azure URLs and telemetry evidence.

### Final 2-4 Hours

- Fix demo blockers only.
- Capture final screenshots/video.
- Rehearse story.
- Do not add new features unless every P0 gate passes.

## Cut Line

Must keep:

- Copilot agent package or sideload-ready evidence.
- External MCP server with read/write tools.
- Synthetic registry.
- Deterministic risk gate.
- Human review before release.
- Foundry Floor visual proof.
- Unauthorized scenario.
- Evidence package.

Cut first:

- Azure AI Foundry rationale.
- API Management.
- Cosmos DB.
- Live Graph / Work IQ.
- MCP App widget.
- Advanced mobile polish beyond readable screenshots.
- Full production OAuth if a local synthetic auth mode plus Entra implementation notes prove the boundary.

## Success Threshold

The workload is successful when:

- P0 gates pass locally.
- At least one Azure deployment is smoke-tested.
- At least five P1 differentiators are visible.
- The demo can be reset and rerun.
- Judges can see Copilot, MCP writeback, human review, release packet, audit trail, and Signal Atlas without needing verbal hand-waving.
