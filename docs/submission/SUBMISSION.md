# Signal Foundry — Agents League Submission

Copy-paste source for the Innovation Studios project fields.

## Project name

Signal Foundry

## Tagline

Raw Signals | Forged with Intelligence | Approved Workflows — the governance
layer every enterprise agent needs.

## Tracks

- **Enterprise Agents (primary)** — a Microsoft 365 Copilot declarative agent
  with an external MCP server, human-in-the-loop release governance, and
  audit-safe evidence.
- **Reasoning Agents** — an Azure AI Foundry model produces a multi-step risk
  deliberation for every proposal; a deterministic gate arbitrates and wins on
  disagreement ("reasoning with guardrails").
- Creative Apps requires AI-assisted development with GitHub Copilot
  specifically — only claim this track if GitHub Copilot was actually part of
  the development workflow.

## Problem

This hackathon has 135 Enterprise Agents entries. Every enterprise will face
exactly that flood: hundreds of employee AI ideas with no governed path from
idea to approved, reusable workflow. Ungoverned agents ship surveillance
features, leak raw content, and skip human review. Signal Foundry is how the
other 134 agents get risk-scored, approved, and released.

## Solution

Employees discover and propose Copilot workflows in Microsoft 365 Copilot Chat.
Signal Foundry's declarative agent — grounded in permission-aware People and
Meetings work context — calls an external MCP server that risk-scores every
proposal deterministically, attaches an advisory AI deliberation from Azure AI
Foundry, and routes it to a human reviewer. Nothing releases without explicit
approval. The Foundry Floor command center shows the Signal Atlas, Review
Queue, Risk Gate with advisory arbitration, Release Packets, and a sanitized
MCP activity trail with correlation IDs end to end.

## AI value

- **Reasoning with guardrails:** an LLM deliberates (signal → concern →
  suggested control), a deterministic rule engine decides, and the
  disagreement is shown, not hidden. Deterministic outcomes are byte-identical
  with advisory on or off — proven by tests.
- **Work IQ-grounded discovery:** recommendations are personalized from
  permission-aware org and meeting context; raw Microsoft 365 content never
  reaches the MCP server by contract (schema-enforced, length-capped,
  sanitized summary fields only).
- **Anti-surveillance by design:** the agent refuses employee-ranking and
  monitoring requests and redirects to workflow-level improvement.

## Technologies

Microsoft 365 Copilot declarative agent (manifest v1.6, People + Meetings
capabilities, Adaptive Card response templates on plugin manifest v2.4),
external TypeScript MCP server (Express, Zod, JSON-RPC + REST), Azure AI
Foundry / Azure OpenAI advisory reasoning, Azure Container Apps, Azure Static
Web Apps, Azure Table Storage, Azure Key Vault, Application Insights,
Microsoft Entra ID, React + Vite frontend, Vitest + Playwright test harness.

## Links

- Live Foundry Floor: https://red-coast-0b0c14e0f.7.azurestaticapps.net
- Live MCP server: https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io
- Code repository: https://github.com/centrix-labs/signal-foundry
- Demo video: ADD YOUTUBE/VIMEO URL BEFORE SUBMITTING
- Architecture diagram: docs/submission/architecture.md (rendered in README)
- Cover image: docs/submission/signal-foundry-cover.png (1672x941, 16:9 — upload
  as the Innovation Studios project image; it visualizes the product story: raw
  signals forged through the amber risk gate into approved teal workflows)
- Avatar / thumbnail: docs/submission/signal-foundry-avatar.png (1254x1254,
  1:1 — use for any square project icon, team avatar, or small-tile slot)

## Judge quickstart

See docs/submission/JUDGE-GUIDE.md — clone, `npm install`, `npm run validate`
(52 tests + evidence/package/card validators), `npm run test:e2e` (golden flow
against the live local stack), `npm run dev:all` for the interactive demo.
