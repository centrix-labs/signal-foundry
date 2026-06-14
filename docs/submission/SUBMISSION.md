# Signal Foundry — Agents League Submission

Copy-paste source for the Innovation Studios project fields.

## Links (required submission fields)

- **Live demo (Foundry Floor):** https://red-coast-0b0c14e0f.7.azurestaticapps.net — login pre-filled (`alex.kim@asteriadynamics.com` / `signal-foundry-2026`), click **Launch Console**.
- **Code repository:** https://github.com/centrix-labs/signal-foundry
- **Demo video:** _add YouTube/Vimeo link after upload_

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

Two things set it apart, and they are the two things enterprises cannot get
anywhere else at once. **First, an AI that reasons about risk out loud** — an
Azure AI Foundry model walks each proposal through up to five explicit steps,
naming the input signal, the concern it raises, and the control it suggests,
before landing a recommended risk level. **Second, a deterministic guarantee on
top of that reasoning** — the verdict of record is byte-identical whether the
model is up, degraded, or unplugged entirely. The model reasons; the gate
guarantees. Proven by automated test, not promised in a slide.

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
permission-aware People and Meetings work context (Work IQ) — calls an external
MCP server with 13 governed tools.

The reasoning is the heart of it. For every proposal, an Azure AI Foundry model
runs a multi-step risk deliberation you can watch unfold: up to five explicit
steps, each naming the input signal, the concern it raises, and the specific
control that would mitigate it, ending in a recommended risk level. That
reasoning is shown in full — not a black-box score, but an auditable chain a
compliance officer can read.

A deterministic, explainable gate then issues the verdict of record. Where the
model and the gate disagree, the disagreement is surfaced rather than hidden:
the model's reasoning informs, the gate's rule guarantees. And because the gate
is pure and the advisory path degrades safely to "unavailable" on any timeout
or error, the verdict is **byte-identical with the model on, off, or unplugged
— enforced by automated test.** Reasoning you can inspect; an outcome you can
certify.

This is the gap nothing else in the category closes at once: governed-release
tools promise an audit trail but show no reasoning; adversarial-verdict agents
reason but their ruling is itself model-generated, and so non-deterministic at
the exact moment it claims authority. Signal Foundry gives you both — rich,
inspectable reasoning and a verdict that is deterministic by construction.

Nothing releases without explicit human reviewer approval. Every interaction is
recorded as a live Copilot checkpoint with correlation IDs, and the Foundry
Floor command center visualizes it all: the animated Signal Atlas, Review
Queue, Risk Gate with advisory arbitration or fallback state, audit-safe
Release Packets, and a sanitized MCP activity trail end to end.

**Our goals:**

1. **Give every employee Work IQ-grounded discovery and a governed path from
   AI idea to released capability** — propose in the flow of work (Copilot
   Chat), get a transparent risk verdict, and ship with approval instead of
   around it.
2. **Make AI reasoning both rich and trustworthy enough to govern with** — the
   Azure AI Foundry / Azure OpenAI advisory path deliberates in explainable,
   multi-step reasoning (signal → concern → suggested control), and a
   deterministic rule engine guarantees the outcome. The reasoning informs, the
   gate guarantees, and disagreement is displayed rather than hidden — so the
   verdict is certifiable whether or not the model is right, or even available.
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
   Azure infrastructure, verified by 92 automated tests, a Playwright
   golden-flow E2E, and a package that passes all 57 Microsoft 365 Agents
   Toolkit validation rules.

## Technologies

Microsoft 365 Copilot declarative agent (manifest v1.6, People + Meetings
capabilities, Adaptive Card response templates on plugin manifest v2.4),
external TypeScript MCP server (Express, Zod, JSON-RPC + REST), Azure AI
Foundry / Azure OpenAI advisory reasoning, Azure Container Apps, Azure Static
Web Apps, Azure Table Storage, Azure Key Vault, Application Insights,
Microsoft Entra ID, React + Vite frontend, Vitest + Playwright test harness.