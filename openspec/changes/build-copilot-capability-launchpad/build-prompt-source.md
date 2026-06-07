# Build Prompt Source: Signal Foundry

Use this file as the source material for the final implementation prompt. The prompt should instruct the build agent to implement the P0 scope first, verify it, then add P1 differentiators.

## Objective

Build Signal Foundry, a Microsoft 365 Copilot Chat agent plus external MCP-backed registry and Foundry Floor console. The app turns raw work signals and employee ideas into governed, risk-reviewed, human-approved, reusable Copilot workflows.

## Required Stack

- Microsoft 365 Copilot Chat Declarative Agent.
- Microsoft 365 Agents Toolkit.
- Work IQ / Microsoft Graph context summaries or synthetic Work IQ-style grounding.
- External TypeScript / Node.js MCP server.
- Zod schemas for MCP tool inputs and outputs.
- Synthetic registry store using Azure Table Storage for deployment or JSON/SQLite for local MVP.
- Microsoft Entra ID / OAuth-compatible auth boundary.
- Azure Container Apps for MCP server.
- Azure Static Web Apps for Foundry Floor.
- Application Insights / Log Analytics for audit-safe telemetry.
- Optional Azure AI Foundry / Azure OpenAI for rationale wording only.

## Required Product Flow

1. User asks Copilot for AI workflows useful to their role.
2. Agent recommends approved and candidate capabilities using registry data and Work IQ-style summaries.
3. User confirms one candidate should become a proposal.
4. Agent calls MCP to create the proposal.
5. Agent or reviewer calls MCP to score risk.
6. Agent submits proposal to reviewer.
7. Reviewer approves or rejects.
8. Approved capability is released with a release packet.
9. Foundry Floor shows the full flow in Signal Atlas, Release Pipeline, Risk Gate, Review Queue, Release Packet, and MCP Activity Rail.

## Build Rules

- Build P0 before P1.
- Keep all demo data synthetic.
- Never render raw Microsoft 365 content.
- Never render secrets, tokens, stack traces, PII, or production data.
- Use explicit confirmation before every mutation.
- Use reviewer authorization for approve, reject, and release.
- Use idempotency keys and correlation IDs for write tools.
- Use deterministic risk scoring as the source of truth.
- Treat optional LLM risk rationale as advisory wording only.
- Keep the runtime Microsoft-centered.

## Visual Target

Use the Signal Foundry visual references as acceptance targets:

- Foundry Floor command center: `assets/visual-reference-2-foundry-floor.jpg`
- Signal Atlas: `assets/visual-reference-4-signal-atlas.jpg`
- Review Queue: `assets/visual-reference-1-review-queue.jpg`
- Copilot Mirror: `assets/visual-reference-3-copilot-mirror.jpg`
- Light Executive: `assets/visual-reference-5-light-executive.jpg`

The default visual should be a dark graphite enterprise command center with electric teal signal paths and amber risk gates.

## Output Expectations

The build agent should return:

- implemented source files,
- setup commands,
- local run commands,
- Azure deployment notes,
- screenshots generated during verification,
- test and validation results,
- remaining risks.

## Verification

Run these before claiming completion:

- MCP schema/unit tests.
- Golden demo flow.
- Unauthorized MCP flow.
- No-raw-content scan over seed data and screenshots.
- Frontend screenshot checks at desktop and mobile sizes.
- OpenSpec validation.
