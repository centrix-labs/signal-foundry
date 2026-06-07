# Proposal: Build Signal Foundry

## Why

Enterprises are buying Microsoft 365 Copilot, but many employees still do not know which AI use cases apply to their daily work. At the same time, organizations need a safe way to turn raw work signals and promising AI ideas into reusable, approved workflows without spreading risky prompts, uncontrolled automations, or unreviewed capabilities.

## What Changes

- Add Signal Foundry, a Microsoft 365 Copilot Chat agent that helps users discover role-specific Copilot use cases.
- Add a governed Capability Registry where selected ideas become reusable capability records.
- Add an AI Capability Risk Gate that evaluates data sensitivity, external sharing risk, automation risk, required human review, and release readiness.
- Add an external MCP server with read/write tools for capability proposals, risk reviews, approvals, releases, release packets, and capability maps.
- Add OAuth-secured access to MCP tools and tenant/user-scoped registry authorization.
- Add a judge-facing Foundry Floor frontend that visualizes raw signals, capability pipeline, risk gate, release packets, MCP activity, and audit-safe evidence.
- Add synthetic enterprise roles, departments, capabilities, and review scenarios for the hackathon demo.

## Impact

- Employees can ask Copilot what AI capabilities would help them in their role and active work context.
- Teams can propose new AI capabilities from inside Copilot Chat.
- Reviewers can approve, reject, or request changes before a capability is released.
- The submission proves Microsoft 365 Copilot Chat hosting, Microsoft IQ / Work IQ grounding, external MCP read/write operations, OAuth, human review, and audit-safe governance.
- The product avoids employee surveillance by focusing on capabilities, workflows, and release governance rather than individual activity monitoring.
- The brand promise is: Raw Signals | Forged with Intelligence | Approved Workflows.

## Non-Goals

- No always-on personal agent or autonomous background monitoring.
- No broad replacement for the Microsoft Agent Store or Agent 365.
- No raw Microsoft 365 emails, chats, transcripts, files, secrets, tokens, or PII stored in the registry or shown in the UI.
- No production customer data or company confidential data.
- No autonomous capability release without human approval.
- No runtime dependency on personal Codex, Claude, ChatGPT, or non-Microsoft accounts.
