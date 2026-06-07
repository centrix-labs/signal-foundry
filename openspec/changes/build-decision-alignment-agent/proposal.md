# Proposal: Build Decision & Alignment Agent

## Why

Enterprise teams lose execution quality when decisions, approvals, assumptions, and commitments are scattered across meetings, Teams chats, emails, and documents. Microsoft 365 Copilot can see much of this work context, but organizations still need a governed registry that turns conversational intelligence into owned, auditable records.

## What Changes

- Add a Microsoft 365 Copilot Chat Declarative Agent focused on decision debt and alignment risk.
- Connect the agent to Microsoft 365 work context for grounding.
- Add an external MCP server that exposes read/write tools for a Decision Registry and Alignment Risk Registry.
- Add OAuth-secured access to MCP tools.
- Add a lightweight synthetic enterprise data store for hackathon demo scenarios.
- Add an Alignment Map experience that turns fragmented work signals into a visual executive-ready view.
- Add confidence scoring, evidence packets, and reviewer workflows so users can distinguish grounded findings from weak signals.
- Add an evaluation harness and judge-facing evidence map designed to make the submission easy to score above 9.8.
- Add optional Phase 2 support for Azure AI Foundry or Azure OpenAI if custom contradiction detection, structured extraction, or adversarial self-review is needed.

## Impact

- Users can ask the agent to find unresolved decisions, conflicting assumptions, and stale approvals.
- The agent can create or update governed registry records after user confirmation.
- The project satisfies the Enterprise Agents required surface and Microsoft IQ integration, while targeting bonus criteria through MCP Apps and external MCP integration.
- Judges can inspect concrete repository evidence for every required and bonus criterion instead of relying on claims in the pitch.

## Non-Goals

- No production tenant data.
- No company/customer confidential project import.
- No broad "general corporate assistant" scope.
- No autonomous writes without human confirmation.
- No dependency on personal Codex, Claude, or ChatGPT accounts at runtime.
- No hidden model calls that bypass Microsoft 365 Copilot permissions or MCP authorization.
