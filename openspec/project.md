# Project: Decision & Alignment Agent

## Purpose

Build a Microsoft 365 Copilot Chat agent for the Agents League Hackathon Enterprise Agents challenge. The agent detects unresolved decisions, conflicting assumptions, stale approvals, and alignment risks across Microsoft 365 work context, then records governed outcomes in an external registry through MCP.

## Challenge Fit

- Primary challenge: Enterprise Agents
- Required surface: Microsoft 365 Copilot Chat
- Required intelligence layer: Work IQ through Microsoft 365 work context and Microsoft Graph-backed content
- Bonus capabilities: MCP App, external MCP server, OAuth-secured tools, read/write enterprise actions

## Architecture Defaults

- Prefer a Declarative Agent for the first shippable version.
- Use Custom Engine Agent only if contradiction detection requires custom orchestration that cannot be delivered through declarative instructions and MCP tools.
- Use synthetic hackathon data only.
- Use a dedicated Azure subscription or isolated resource group.
- Use a dedicated Microsoft 365 developer tenant where possible.

## Security Constraints

- Do not commit secrets, tenant IDs, app credentials, tokens, customer data, or production configuration.
- All external MCP actions must enforce tenant/user authorization.
- All write actions must require user confirmation before mutation.
- Logs must contain metadata and correlation IDs, not message bodies, document text, tokens, or PII.
- External registry data must be scoped by tenant and project.

