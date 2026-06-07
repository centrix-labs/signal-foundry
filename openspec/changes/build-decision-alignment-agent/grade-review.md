# Grade Review: Decision & Alignment Agent

## Target

Functional target: 9.8+ hackathon-grade submission.

## Current Spec Grade

Planned functionality grade: 9.85 / 10.

This grade assumes the team implements all required items, the Alignment Map, evidence packets, OAuth-secured external MCP read/write tools, human-confirmed mutations, golden scenarios, and judge evidence mapping.

## Scorecard

| Category | Weight | Planned Score | Evidence In Spec |
| --- | ---: | ---: | --- |
| Challenge fit | 20% | 20.0 | Microsoft 365 Copilot Chat, Work IQ/Microsoft 365 context, Declarative Agent path. |
| Enterprise value | 15% | 14.8 | Decision debt and organizational alignment are cross-functional enterprise problems. |
| MCP capability | 15% | 15.0 | External MCP server with read/write registry tools, evidence packets, review queue, and map generation. |
| Security | 15% | 14.7 | OAuth, tenant scoping, user confirmation, audit-safe logging, Key Vault, no production data. |
| Novelty | 10% | 9.9 | Alignment Map, Confidence Ledger, Evidence Packets, Human Review Queue. |
| Demo quality | 10% | 9.8 | Golden scenarios, judge prompts, executive brief, screenshots, submission README. |
| Technical quality | 10% | 9.7 | TypeScript/Node MCP server, schemas, idempotency, observability, repeatable deployment. |
| Responsible AI | 5% | 5.0 | Confidence scoring, uncertainty disclosure, human review, adversarial tests. |

## Remaining Risks

- MCP App support and OAuth behavior must be verified in the actual Microsoft 365 tenant.
- Azure model availability and quota must be confirmed for the target region before using optional `gpt-5.5` or `gpt-5.4-pro` deployments.
- The final grade will drop below 9.8 if the Alignment Map is only described and not demoed.
- The final grade will drop below 9.8 if the repository lacks screenshots or demo artifacts that show Copilot Chat, MCP read/write actions, OAuth/security handling, and registry state changes.

## Required To Preserve 9.8+

- Keep Declarative Agent as the baseline path.
- Demo external MCP read and write operations.
- Show user confirmation before every mutation.
- Show unauthorized MCP rejection.
- Show audit-safe logs with correlation IDs.
- Include a visible Alignment Map and Executive Brief.
- Include a judge evidence map that ties every required and bonus criterion to concrete files, screenshots, or demo steps.
- Run golden scenarios and adversarial tests before submission.

