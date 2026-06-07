# Executive Command Center: Five-Pass Review

## Pass 1: Visual Hierarchy

Current issue: the earlier command center made the Alignment Map important, but not dominant enough to win a judging room.

Decision: make one visual artifact own the screen in each concept. Supporting registry/evidence content moves into a side panel so the primary visualization is immediately legible.

## Pass 2: Information Architecture

Current issue: decision records, risks, evidence, and audit state competed as equal dashboard panels.

Decision: structure the experience around the story the judge needs to understand: scan, detect, confirm, resolve. Every concept maps to this same sequence.

## Pass 3: Enterprise Trust

Current issue: the UI needed more visible proof that this is governed enterprise infrastructure, not a pretty chatbot.

Decision: every concept shows evidence score, conflict score, source count, raw-document exclusion, and correlation ID.

## Pass 4: Visual Differentiation

Current issue: the original view risked reading as a conventional dashboard.

Decision: create three distinct visual metaphors:

- Signal Atlas: alignment cartography and evidence flow.
- Decision Theater: executive narrative and time-based explanation.
- Governance Flight Deck: operational triage and radar-style review.

## Pass 5: Hackathon Demo Readiness

Current issue: judges need a crisp way to see the idea in under two minutes.

Decision: each prototype has the same four-step story controls and can be demoed independently on the LAN.

## Recommended Direction

Lead with Signal Atlas. It is the most unique and ties directly to the product promise: reveal organizational drift and convert it into governed action.

Use Decision Theater for the executive pitch and Governance Flight Deck as the operational follow-up.

## Research-Backed Patterns

- Azure Monitor Workbooks validates tiles, graphs, honeycomb, maps, stat cards, and grids as credible Microsoft-style enterprise visualization primitives.
- Microsoft Sentinel Workbooks validates persona-specific operational monitoring views with refreshable workbook data and custom templates.
- Power BI dashboard tiles validate the command-center pattern of pinning multiple evidence surfaces into a single executive canvas.

## Allowed Technology Recommendations

- Use Fluent UI React for Microsoft-native command surfaces and component polish.
- Use React Flow for the Signal Atlas if the graph needs drag, zoom, minimap, and node interactions.
- Use D3 or Apache ECharts for bespoke scoring, timeline, evidence river, radar, and dashboard visualizations.
- Use Cytoscape.js if graph analysis matters more than custom canvas art.
- Keep the hackathon build on Microsoft 365 Copilot Chat, Agents Toolkit, Graph/Work IQ context, External MCP, Entra OAuth, and synthetic data only.
