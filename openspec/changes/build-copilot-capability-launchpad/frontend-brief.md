# Frontend Brief: Signal Foundry Foundry Floor

## Feature Summary

The Foundry Floor is a judge-facing and reviewer-facing console for Signal Foundry. It visualizes how a Copilot Chat conversation turns raw work signals and an employee idea into a governed AI capability proposal, passes through risk review, and becomes a released reusable playbook.

## Primary User Action

The most important action is to understand and control the release state of a proposed AI capability: what it does, who it helps, what risks it carries, who approved it, and whether it is safe to release.

## Design Direction

The interface should feel like an enterprise foundry for AI capabilities, not a generic dashboard. The visual language should be controlled, inventive, industrial, and trustworthy, with one memorable artifact: a Signal Atlas or Release Pipeline that shows raw signals becoming approved workflows.

Brand reference:

- Product name: Signal Foundry.
- Tagline: Raw Signals | Forged with Intelligence | Approved Workflows.
- Palette: Graphite `#1C1F23`, Warm Steel `#7C848E`, Electric Teal `#00D1C2`, Amber `#FFB12E`.
- Logo motif: signal traces enter a hexagonal forge/anvil and exit as approved workflow tiles.
- Visual reference set: use `visual-reference.md` and its five image assets as the pixel target for the first build.

Avoid:

- stock AI imagery,
- generic robot/brain/lightbulb illustrations,
- decorative charts,
- glass cards,
- gradient orbs,
- identical metric-card grids,
- huge icon tiles,
- generic dark neon dashboards.

Use:

- signal streams,
- forge gates,
- release lanes,
- status-coded capability nodes,
- proof-of-control panels,
- compact evidence packets,
- risk gates with meaningful controls,
- audit-safe activity trails,
- modern enterprise interaction patterns.

## Layout Strategy

Primary visual target:

- Build toward `assets/visual-reference-2-foundry-floor.jpg` and `assets/visual-reference-4-signal-atlas.jpg`.
- The default desktop experience should feel like a dark enterprise operations command center, not a SaaS marketing dashboard.
- Combine the release-lane system from the Foundry Floor reference with the Signal Atlas map as the memorable center-stage artifact.

Desktop layout:

- Left rail: role, department, and release-stage filters.
- Center workspace: Signal Atlas or Release Pipeline as the dominant surface.
- Right panel: selected capability's risk gate, release packet, and decision controls.
- Bottom rail or side rail: MCP activity and correlation IDs.
- Copilot Mirror panel: compact transcript-like proof of the Copilot Chat flow.

The command center should not be a wall of charts. It should present one primary visual system with supporting evidence.

Required screen variants:

- Foundry Floor: command center with lane-based release pipeline, Signal Atlas, MCP activity, risk gate console, and release packet drawer.
- Signal Atlas: full-screen graph of work signals, roles, risk gates, approved workflows, release state, and audit context.
- Review Queue: reviewer-focused approval screen with prioritized queue, risk checklist, release packet summary, MCP activity, and bottom approval bar.
- Copilot Mirror: Microsoft 365 Copilot Chat style conversation paired with the Signal Foundry agent panel.
- Light Executive: optional light theme version for slide screenshots and high-readability walkthroughs.

## Key States

- Empty: no proposals yet; prompt the operator to run the Copilot discovery scenario.
- Discovering: agent is generating role-relevant capability suggestions.
- Proposed: selected use case has become a registry proposal.
- Risk scored: proposal has a risk level and required controls.
- Pending review: reviewer can approve, reject, or request changes.
- Approved: release packet is generated but not yet released.
- Released: capability becomes available as an approved playbook card.
- Rejected: proposal remains visible with reason and next action.
- Unauthorized: MCP access failed without exposing tokens, secrets, raw content, or stack traces.
- Audit view: shows actor, action, record ID, timestamp, and correlation ID only.

## Interaction Model

- Selecting a signal or capability node updates the risk gate and release packet.
- Advancing the demo story updates the Copilot Mirror, MCP Activity Rail, pipeline stage, and selected record.
- Reviewer controls require explicit action and show immediate state feedback.
- Risk reasons use progressive disclosure: summary first, detailed policy notes second.
- Released capability cards expose version, owner, approved sources, and usage guidance.

## Content Requirements

Core labels:

- Discovered
- Proposed
- Risk Scored
- In Review
- Approved
- Released
- Blocked
- Risk Gate
- Release Packet
- MCP Activity
- Signal Atlas
- Copilot Mirror

Microcopy must stay operational and concise. Do not use marketing copy inside the app.

## Recommended References

Use these implementation reference areas from the impeccable skill:

- spatial design for the asymmetric command center layout,
- interaction design for review controls and progressive disclosure,
- motion design for stage transitions,
- typography for a distinctive but enterprise-readable voice,
- color and contrast for risk/status encoding.

## Pixel Target Rules

- Match the provided references at the level of information architecture, spacing rhythm, panel proportions, state density, and command hierarchy.
- Use Electric Teal for active signal paths, approved workflow states, and live indicators.
- Use Amber for risk gates, pending reviews, transformation heat points, and attention states.
- Reserve bright accents for state and motion; do not make the whole interface glow.
- Prefer precise enterprise controls, compact table/list rows, right-side activity rails, and bottom approval actions.
- Avoid fake lorem ipsum, illegible microtext, decorative charts, and image-only UI.
- Use synthetic enterprise records only; no raw Microsoft 365 text, secrets, tokens, or personal user activity.

## Build Decisions

- Final product name: Signal Foundry.
- Final demo domain: customer success renewals.
- Primary view: Signal Atlas, with Release Pipeline as the operational secondary view.
- Frontend target: standalone judge console first; reuse the Signal Atlas as an MCP App widget only if tenant support and time allow.
- Default theme: dark graphite command center. Light theme is a secondary executive variant, not the main hackathon surface.
