# Signal Foundry — Agents League Submission

Copy-paste source for the Innovation Studios project fields.

## Project name

Signal Foundry

## Keywords

Microsoft 365 Copilot, Declarative Agent, Model Context Protocol, MCP, Azure
AI Foundry, Work IQ, AI Governance, Human-in-the-Loop, Risk Scoring, Reasoning
Agents, Adaptive Cards, Azure Container Apps, Microsoft Entra ID, Audit Trail,
Responsible AI, Enterprise Agents

## Description

Paste into the "Give a detailed description of your project and its goals"
field.

Signal Foundry is a governance layer for enterprise AI: a Microsoft 365
Copilot agent, an external MCP server, and a human review console that
together turn employee AI ideas into risk-scored, human-approved, audit-safe
Copilot workflows.

**The problem it solves.** Enterprise AI adoption is outpacing enterprise AI
governance. Employees everywhere are discovering Copilot workflows that could
transform their roles — but organizations have no governed path from idea to
approved, reusable capability. Good ideas die in email threads because nobody
knows how to get them approved, while shadow AI ships ungoverned — leaking raw
content, drifting into employee surveillance, skipping review, and leaving no
audit trail when compliance comes asking. IT can't say yes safely, so it says
no slowly, and the business routes around it.

**How it works.** Employees discover and propose Copilot workflows directly in
Microsoft 365 Copilot Chat. Signal Foundry's declarative agent — grounded in
permission-aware People and Meetings work context (Work IQ) — calls an
external MCP server with 13 governed tools. Every proposal is risk-scored by a
deterministic, explainable gate; an Azure AI Foundry model adds a multi-step
advisory deliberation (signal → concern → suggested control), and when the
model and the gate disagree, the disagreement is shown and the gate wins —
reasoning with guardrails, with deterministic outcomes proven byte-identical
whether the model is up or down. Nothing releases without explicit human
reviewer approval. Every interaction is recorded as a live Copilot checkpoint
with correlation IDs, and the Foundry Floor command center visualizes it all:
the animated Signal Atlas, Review Queue, Risk Gate with advisory arbitration
or fallback state, audit-safe Release Packets, and a sanitized MCP activity
trail end to end.

**Our goals:**

1. **Give every employee Work IQ-grounded discovery and a governed path from
   AI idea to released capability** — propose in the flow of work (Copilot
   Chat), get a transparent risk verdict, and ship with approval instead of
   around it.
2. **Make AI reasoning trustworthy enough to govern with** — an LLM
   deliberates, a deterministic rule engine decides, and disagreement is
   displayed rather than hidden; the system never depends on the model being
   right or even available.
3. **Keep people safe by structure, not policy** — raw Microsoft 365 content
   never reaches the MCP server by contract (schema-enforced, length-capped,
   sanitized summary fields only), and the agent refuses employee-ranking and
   monitoring requests by design.
4. **Give reviewers and compliance audit-grade evidence** — every action
   carries a correlation ID, every release produces a packet with owner,
   reviewer, controls, and audience, and the full trail is sanitized and
   replayable.
5. **Prove the pattern end to end on the Microsoft stack** — declarative
   agent in Copilot Chat, MCP tool contracts, Azure AI Foundry reasoning, and
   Azure infrastructure, verified by 83 automated tests, a Playwright
   golden-flow E2E, and a package that passes all 57 Microsoft 365 Agents
   Toolkit validation rules.

## Technologies

Microsoft 365 Copilot declarative agent (manifest v1.6, People + Meetings
capabilities, Adaptive Card response templates on plugin manifest v2.4),
external TypeScript MCP server (Express, Zod, JSON-RPC + REST), Azure AI
Foundry / Azure OpenAI advisory reasoning, Azure Container Apps, Azure Static
Web Apps, Azure Table Storage, Azure Key Vault, Application Insights,
Microsoft Entra ID, React + Vite frontend, Vitest + Playwright test harness.