# Demo Script: Signal Foundry

## Demo Domain

Customer success renewals.

## Story

An account manager wants to know how Copilot can help reduce renewal risk this week. Signal Foundry recommends useful AI capabilities, turns one selected idea into a governed proposal, scores risk, routes human review, releases the approved capability, and shows the full audit-safe flow in Foundry Floor.

## Personas

- Employee: Priya Shah, Enterprise Account Manager.
- Reviewer: Alex Kim, AI Enablement Lead.
- Admin/Judge view: Foundry Floor operator.

## Golden Flow

### 1. Discover

Copilot prompt:

> I manage enterprise renewals. What Copilot capabilities could help me reduce renewal risk this week?

Expected agent response:

- Renewal brief generator.
- Customer meeting prep packet.
- Executive escalation brief.
- Follow-up action composer.
- Account risk summary.

Expected proof:

- Copilot Chat response is visible.
- Agent mentions recommendations are based on role/context summaries and approved registry data.
- No raw Microsoft 365 content is shown.

### 2. Propose

Copilot prompt:

> Create a proposal for the Renewal brief generator.

Expected MCP call:

- `create_capability_proposal`

Expected proof:

- Proposal appears in Foundry Floor as `Proposed`.
- MCP Activity Rail shows sanitized write with correlation ID.

### 3. Risk Score

Copilot prompt:

> Score the risk for this capability before review.

Expected MCP call:

- `score_capability_risk`

Expected proof:

- Risk Gate shows data sensitivity, external sharing, automation, audience, human review, and required controls.

### 4. Submit Review

Copilot prompt:

> Submit this to Alex Kim for review.

Expected MCP call:

- `submit_capability_review`

Expected proof:

- Proposal moves to `In Review`.
- Review item appears with reviewer, due date, risk level, and correlation ID.

### 5. Approve And Release

Reviewer prompt:

> Approve and release the Renewal brief generator for the Customer Success team.

Expected MCP calls:

- `approve_capability`
- `release_capability`
- `generate_release_packet`

Expected proof:

- Capability moves to `Released`.
- Release Packet shows version, owner, approved audience, approved source types, reviewer, timestamp, and correlation ID.
- Signal Atlas shows the released workflow tile in electric teal.

### 6. Unauthorized Demo

Attempt an approval without reviewer authorization.

Expected proof:

- MCP server rejects the request.
- Foundry Floor shows unauthorized state.
- Error excludes tokens, secrets, raw content, and stack traces.

## Closing Pitch

Signal Foundry turns raw work signals into approved, reusable Copilot workflows through a governed risk gate, MCP-backed registry, and audit-safe release workflow.
