# Frontend Brief: Hackathon Demo Console

## Feature Summary

The frontend is a judge-facing enterprise console that visualizes the governed system behind the Microsoft 365 Copilot agent. It shows how scattered work context becomes decision records, alignment risks, evidence packets, review items, audit events, and an executive-ready Alignment Map.

## Primary User Action

The primary user action is to inspect an alignment risk or unresolved decision, understand why it exists, and see what governed action was taken.

## Design Direction

Audience:

- Microsoft hackathon judges.
- Enterprise leaders.
- Product, program, legal, sales, and security stakeholders.
- Engineers validating that MCP/OAuth/audit behavior is real.

Tone:

- Controlled.
- Executive.
- Operational.
- Premium.
- Trustworthy under scrutiny.

The interface should feel like an enterprise command system. Avoid marketing aesthetics, generic SaaS card grids, chatbot wrappers, decorative gradients, and oversized hero sections.

## Layout Strategy

Use a dense full-width app layout:

- Left rail: product identity and major views.
- Top command bar: selected project, scenario, environment, and auth state.
- Main workspace: Alignment Map or registry content.
- Right inspector drawer: selected record details, evidence, confidence, and actions.
- Bottom or side activity rail: MCP calls, registry writes, audit events, and correlation IDs during the demo.

The Alignment Map is the visual centerpiece. It should show the connection between teams, decisions, risks, owners, commitments, and conflicting signals. Registry grids and evidence packets support the map, not the other way around.

## Key States

- Default: project selected, map visible, top risks ranked.
- Empty: no records yet, with a short prompt to run the Copilot scenario.
- Loading: skeleton map/tables, not a spinner-only state.
- Unauthorized: clear auth failure without tokens, secrets, raw content, or stack traces.
- Write pending: proposed mutation awaiting user confirmation in Copilot Chat.
- Write success: new record appears, map updates, audit event appears.
- Review required: low-confidence or high-impact finding routed to human review.
- Error: actionable recovery message and correlation ID.

## Interaction Model

- Selecting a node opens the inspector drawer.
- Selecting an edge explains the conflict or dependency.
- Filters refine by severity, confidence, owner, project, and status.
- Review actions allow confirm, reject, assign owner, request clarification, or escalate.
- Demo Command Center advances through a scripted sequence that mirrors the Copilot Chat flow.
- Motion should be restrained: map updates, drawer transitions, and timeline steps can animate with opacity/transform only.

## Content Requirements

Primary labels:

- Alignment Map
- Decision Registry
- Alignment Risks
- Evidence Packets
- Review Queue
- Executive Brief
- Demo Command Center

Record fields:

- Title
- Status
- Owner
- Severity
- Confidence
- Source summary
- Recommended action
- Review status
- Last updated
- Correlation ID

Microcopy should be short and operational. Do not explain what the product does in visible tutorial text; the workflow should be legible from the interface itself.

## Recommended Implementation References

- `reference/spatial-design.md`
- `reference/interaction-design.md`
- `reference/responsive-design.md`
- `reference/motion-design.md`
- `reference/ux-writing.md`

## Open Questions

- Should the frontend use Fluent UI v9 throughout, or only for controls while custom layout/visualization handles the map and command center?
- Will the Alignment Map run as a standalone demo console only, or also as an MCP Apps widget inside Microsoft 365 Copilot?
- Will the team prioritize live MCP-backed data for the frontend, or fixture-backed reliability for the final judging demo?

