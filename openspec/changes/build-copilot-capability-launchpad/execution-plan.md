# Execution Plan: Signal Foundry

## Build Objective

Build a hackathon-ready Microsoft 365 Copilot-centered product that demonstrates a complete governed release loop: user asks Copilot for role-relevant AI workflow ideas, selects one idea, creates a proposal through MCP, risk-scores it, routes human review, releases it, and shows audit-safe evidence in Foundry Floor.

## P0 Demo-Critical Scope

These items must exist before any polish work is considered complete:

1. Microsoft 365 Copilot Chat Declarative Agent package with Signal Foundry instructions.
2. External TypeScript / Node.js MCP server with schema-validated tools.
3. Synthetic registry store for capabilities, proposals, risk reviews, review items, release packets, MCP activity, and audit events.
4. Deterministic risk gate with explainable rationale.
5. Human confirmation before every mutation.
6. Reviewer-only approve, reject, and release operations.
7. Foundry Floor with Signal Atlas, Release Pipeline, Risk Gate, Review Queue, Release Packet, MCP Activity, and Copilot Mirror.
8. End-to-end golden demo: discover -> propose -> risk score -> submit -> approve -> release.
9. Unauthorized MCP scenario with sanitized failure.
10. Screenshot and video evidence mapped to judge criteria.

## P1 Winning Differentiators

These items should be included if P0 is stable:

1. Animated Signal Atlas showing raw work signals flowing through risk gates into approved workflows.
2. Release packet drawer with version, owner, approved audience, source types, controls, reviewer, timestamp, and correlation ID.
3. MCP activity trace that shows read/write operations without raw content.
4. Anti-surveillance refusal scenario.
5. Azure deployment evidence for MCP server and frontend.
6. Application Insights sample with sanitized correlation IDs.
7. Light executive view for presentation screenshots.

## P2 Stretch

These items are optional and should not block submission:

1. Azure AI Foundry / Azure OpenAI deeper contradiction or risk rationale generation.
2. API Management front door.
3. Cosmos DB serverless instead of Table Storage.
4. True Graph / Work IQ live data access beyond synthetic Work IQ-style context.
5. MCP App widget reuse inside Microsoft 365 surfaces.

## Build Order

1. Scaffold repository structure and shared types.
2. Implement synthetic registry and seed data.
3. Implement MCP schemas and tool handlers.
4. Implement deterministic risk gate.
5. Add auth guard and role checks.
6. Build Foundry Floor against mocked MCP responses.
7. Connect Foundry Floor to MCP/API path.
8. Create Copilot Declarative Agent instructions and action manifest.
9. Run golden demo and unauthorized demo.
10. Capture judge evidence and fix gaps.

## Parallel Team Plan

Use `gpt-5.5` for all Codex agent-team work. The Lead / Integration agent owns sequencing, shared contracts, checkpoint acceptance, and deployment gates. Worker agents can run in parallel only inside these boundaries:

| Lane | Starts After | Owns | Blocks |
| --- | --- | --- | --- |
| Backend MCP | shared types and Zod schemas exist | MCP server, registry, risk gate, backend tests | Copilot action wiring and real frontend API mode |
| Frontend / UX | schema fixtures and seed data exist | Foundry Floor, Signal Atlas, visual states, screenshots | judge visual evidence |
| Copilot Agent | MCP tool contract is stable | Declarative Agent package, instructions, action manifest | Copilot-hosted evidence |
| Azure / DevOps | local app scripts and Docker shape exist | IaC/scripts, Container Apps, Static Web Apps, telemetry, cost guardrails | deployed evidence |
| QA / Evidence | seed data and first API mocks exist | validation harness, golden demo, unauthorized demo, screenshots checklist | final readiness |

The Lead must resolve shared-contract changes before dependent workers continue. Deployment work must not mutate shared Azure resources until the Lead declares blast radius and rollback.

## Non-Negotiable Constraints

- Do not store or display raw Microsoft 365 content.
- Do not show secrets, tokens, stack traces, PII, or production data.
- Do not frame the product as employee monitoring.
- Do not release capabilities without human review.
- Do not require personal Codex, Claude, ChatGPT, or non-Microsoft accounts at runtime.
- Use synthetic enterprise data unless real tenant data is explicitly approved and redacted.

## Done Means

The build is done only when a judge can watch the Copilot flow, see MCP writes happen, see the release state update in Foundry Floor, inspect an audit-safe release packet, and understand why this is a Microsoft 365 Copilot + MCP governance solution rather than a standalone dashboard.
