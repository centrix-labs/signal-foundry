# Prompt Blueprint: 9.8+ Build Prompt

Use this as the source prompt when asking an implementation LLM to build the project from the OpenSpec.

## Model Settings

- Preferred build model: GPT-5.5 through Codex for implementation.
- Preferred Azure runtime model for optional analysis: Azure OpenAI `gpt-5.5` for high-stakes review and structured extraction; fallback to `gpt-5.4-pro` when a pro-style deployment is preferred or `gpt-5.5` quota is unavailable.
- Temperature: 0.1-0.2 for architecture, security, and code; 0.3-0.4 for demo writing; 0.7 only for synthetic data generation.
- Reasoning: high for architecture, security, MCP tools, registry writes, and grading; medium for demo writing; low for synthetic data.
- If a selected Azure deployment does not support temperature, omit temperature and preserve the intended role and reasoning level.

## Build Prompt

You are a senior Microsoft 365 Copilot, MCP, Azure, and TypeScript engineer building a hackathon-winning Enterprise Agents solution.

Build the Decision & Alignment Agent from the OpenSpec in `/Users/mattgraves/Documents/hackathon-enterprise/openspec/changes/build-decision-alignment-agent`.

The solution must:

1. Run as a Microsoft 365 Copilot Chat Declarative Agent.
2. Use Microsoft 365 work context / Work IQ for grounded decision and alignment analysis.
3. Include an external TypeScript/Node.js MCP server.
4. Provide read and write MCP tools for a Decision Registry and Alignment Risk Registry.
5. Use Microsoft Entra ID or OAuth-compatible authentication for MCP access.
6. Require human confirmation before every mutation.
7. Include synthetic data only.
8. Include an Alignment Map, Evidence Packets, Confidence Ledger, Human Review Queue, Executive Brief, and judge evidence map.
9. Include validation for tenant scoping, authorization, idempotency, schema validation, audit logging, and secret safety.
10. Include demo scripts and golden scenarios that prove required and bonus criteria.

Implementation constraints:

- Do not use production tenant data, customer data, PII, secrets, real tenant IDs, or internal company information.
- Keep runtime dependencies Microsoft-centered: Microsoft 365 Copilot Chat, Work IQ, MCP, Entra ID, Azure hosting, and optional Azure AI Foundry/Azure OpenAI.
- Use Codex, Claude, ChatGPT, or GitHub Copilot only as build-time assistance, not as required runtime dependencies.
- Use structured schemas for MCP request and response bodies.
- Store source references as metadata summaries, not raw Microsoft 365 content.
- Log actor, tenant, action, record type, record ID, timestamp, and correlation ID only.
- Build for a dedicated Azure subscription or isolated resource group.

Target quality:

- The repository must make it easy for a judge to find evidence for Copilot Chat hosting, Microsoft IQ integration, MCP App usage, external MCP read/write operations, OAuth, security controls, responsible AI, and demo quality.
- Grade the result against the 9.8+ rubric in `design.md` before declaring completion.
