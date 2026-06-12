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
- **Reasoning Agents** — the Azure AI Foundry / Azure OpenAI advisory path
  produces multi-step risk deliberation when configured; a deterministic gate
  arbitrates and wins on disagreement ("reasoning with guardrails").
- Creative Apps requires AI-assisted development with GitHub Copilot
  specifically — only claim this track if GitHub Copilot was actually part of
  the development workflow.

## Keywords

Microsoft 365 Copilot, Declarative Agent, Model Context Protocol, MCP, Azure
AI Foundry, Work IQ, AI Governance, Human-in-the-Loop, Risk Scoring, Reasoning
Agents, Adaptive Cards, Azure Container Apps, Microsoft Entra ID, Audit Trail,
Responsible AI, Enterprise Agents

## Problem

Enterprise AI adoption is outpacing enterprise AI governance. Employees
everywhere are discovering Copilot workflows that could transform their roles —
but organizations have no governed path from idea to approved, reusable
capability. The result is the worst of both worlds: good ideas die in email
threads because nobody knows how to get them approved, while shadow AI ships
ungoverned — leaking raw content, drifting into employee surveillance, skipping
review entirely, and leaving no audit trail when compliance comes asking. IT
can't say yes safely, so it says no slowly, and the business routes around it.

Signal Foundry closes that gap: a governed pipeline that turns raw work signals
and employee AI ideas into risk-scored, human-approved, audit-safe Copilot
workflows — so the organization can say yes, fast, with evidence.

## Solution

Employees discover and propose Copilot workflows directly in Microsoft 365
Copilot Chat. Signal Foundry's declarative agent — grounded in permission-aware
People and Meetings work context (Work IQ) — calls an external MCP server with
13 governed tools. Every proposal is risk-scored by a deterministic,
explainable gate; an Azure AI Foundry model adds a multi-step advisory
deliberation (signal → concern → suggested control), and when the model and the
gate disagree, the disagreement is shown and the gate wins — reasoning with
guardrails, with deterministic outcomes proven byte-identical whether the model
is up or down. Nothing releases without explicit human reviewer approval. Every
interaction is recorded as a live Copilot checkpoint with correlation IDs, and
the Foundry Floor command center visualizes it all: the animated Signal Atlas,
Review Queue, Risk Gate with advisory arbitration or fallback state, audit-safe
Release Packets, and a sanitized MCP activity trail end to end.

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