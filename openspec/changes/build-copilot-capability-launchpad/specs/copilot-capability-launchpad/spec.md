# Signal Foundry Specification

## ADDED Requirements

### Requirement: Copilot Chat Surface
The system SHALL expose Signal Foundry through Microsoft 365 Copilot Chat.

#### Scenario: User invokes the agent
- **GIVEN** a user with access to the sideloaded agent
- **WHEN** the user asks for AI capability ideas, approved playbooks, or capability release help in Microsoft 365 Copilot Chat
- **THEN** the agent responds inside the Copilot Chat experience
- **AND** the response is scoped to the user's available Microsoft 365 context and registry permissions

### Requirement: Role-Based Capability Discovery
The system SHALL recommend role-relevant Copilot capabilities from approved registry data and permission-aware work context.

#### Scenario: Discover useful capabilities
- **GIVEN** synthetic enterprise roles, departments, and approved capability records exist
- **WHEN** the user asks what Copilot capabilities could help their role
- **THEN** the agent recommends relevant approved capabilities and candidate new capabilities
- **AND** the agent explains why each recommendation is relevant without exposing raw Microsoft 365 content

### Requirement: Microsoft IQ Grounding
The system SHALL use Microsoft 365 work context / Work IQ as the required Microsoft IQ intelligence layer for capability discovery.

#### Scenario: Ground recommendations in work context
- **GIVEN** the user asks for capabilities relevant to their role or current work
- **WHEN** the agent generates recommendations
- **THEN** the agent uses permission-aware Microsoft 365 work context or synthetic Work IQ-style context for the hackathon demo
- **AND** the agent summarizes source types, role signals, and workflow patterns without exposing raw emails, chats, meeting transcripts, or document bodies
- **AND** the repository includes explicit evidence that maps this behavior to the Microsoft IQ hackathon requirement

### Requirement: Capability Proposal Creation
The system SHALL convert a selected use case into a governed capability proposal through the external MCP server.

#### Scenario: Create capability proposal
- **GIVEN** the user selects a candidate AI use case
- **WHEN** the user confirms they want to create a proposal
- **THEN** the agent calls the MCP server to create a capability proposal
- **AND** the registry stores title, description, role, department, owner, intended audience, inputs, proposed output, status, source summary, and audit metadata

### Requirement: AI Capability Risk Gate
The system SHALL score proposed capabilities before approval or release.

#### Scenario: Score capability risk
- **GIVEN** a capability proposal exists
- **WHEN** the agent or reviewer requests risk scoring
- **THEN** the MCP server evaluates data sensitivity, external sharing risk, automation risk, prompt-injection exposure, audience scope, required human review, and release readiness
- **AND** the system records an explainable risk review linked to the proposal

### Requirement: Human Review Workflow
The system SHALL require human review before a capability can be released.

#### Scenario: Submit for review
- **GIVEN** a capability proposal has a completed risk score
- **WHEN** the user submits the proposal for review
- **THEN** the MCP server creates a review item
- **AND** the review item includes reviewer, due date, risk level, required controls, recommended decision, and audit metadata

### Requirement: Approval And Release
The system SHALL support approved, rejected, change-requested, and released capability states.

#### Scenario: Approve and release capability
- **GIVEN** a reviewer is authorized to approve capabilities
- **WHEN** the reviewer approves and releases a capability
- **THEN** the MCP server updates the capability status to released
- **AND** the system creates a release packet with owner, version, approved audience, approved source types, required human review, usage guidance, reviewer, timestamp, and correlation ID

### Requirement: Human-Confirmed Mutations
The system SHALL require explicit confirmation before creating, approving, rejecting, or releasing registry records.

#### Scenario: Prevent accidental release
- **GIVEN** the agent has enough information to perform a write operation
- **WHEN** the user has not explicitly confirmed the write
- **THEN** the agent presents the proposed mutation for review
- **AND** the agent does not call mutation tools until confirmation is provided

### Requirement: External MCP Read And Write Tools
The system SHALL use an external MCP server to read and write capability, risk review, approval, release, and audit records.

#### Scenario: MCP registry write
- **GIVEN** the agent receives confirmation for a registry mutation
- **WHEN** the agent invokes the MCP tool
- **THEN** the MCP server validates input, authorization, tenant scope, idempotency, and correlation ID
- **AND** the MCP server writes the record to the registry

### Requirement: OAuth-Secured MCP Access
The system SHALL secure MCP tool access using Microsoft Entra ID or OAuth-compatible authentication.

#### Scenario: Unauthorized MCP call
- **GIVEN** a request to the MCP server has no valid access token or lacks required role authorization
- **WHEN** the request attempts to read, approve, reject, or release registry data
- **THEN** the MCP server rejects the request
- **AND** the rejection is logged without exposing secrets, tokens, raw content, or stack traces

### Requirement: Foundry Floor
The system SHALL provide a judge-facing frontend console that visualizes raw signals, capability proposals, risk gates, reviews, releases, and MCP activity.

#### Scenario: Judge follows end-to-end workflow
- **GIVEN** a demo operator runs the Copilot Chat scenario
- **WHEN** the agent creates, scores, reviews, and releases a capability through MCP
- **THEN** the Foundry Floor updates the capability pipeline and selected release packet
- **AND** the console shows audit-safe MCP activity with correlation identifiers

### Requirement: Signal Atlas
The system SHALL generate a visual map of raw signals, capabilities, roles, departments, owners, risk states, and release states.

#### Scenario: Visualize capability portfolio
- **GIVEN** capability and risk review records exist
- **WHEN** the user asks for a capability map
- **THEN** the agent retrieves registry data through MCP
- **AND** the frontend presents relationships among raw signals, capabilities, roles, owners, departments, risk gates, and release states
- **AND** high-risk or blocked capabilities are visually distinguishable

### Requirement: Audit-Safe Evidence
The system SHALL avoid storing or displaying raw Microsoft 365 content, secrets, tokens, credentials, or PII.

#### Scenario: Create release packet
- **GIVEN** a capability is approved or released
- **WHEN** the system creates a release packet
- **THEN** the packet stores summaries, approved source types, risk controls, actor, timestamp, and correlation ID
- **AND** the packet excludes raw emails, chats, meeting transcripts, document bodies, access tokens, client secrets, and private keys

### Requirement: Anti-Surveillance Boundary
The system SHALL focus on capability governance and SHALL NOT score or monitor individual employee behavior.

#### Scenario: User asks for employee productivity insight
- **GIVEN** a user asks the agent to rank employees, monitor responsiveness, or identify who is not using AI enough
- **WHEN** the agent responds
- **THEN** the agent refuses employee surveillance framing
- **AND** the agent redirects to approved capability adoption, training, or release-readiness guidance

### Requirement: Judge Evidence Mapping
The system SHALL provide submission evidence that maps implemented functionality to hackathon requirements and bonus criteria.

#### Scenario: Judge reviews repository
- **GIVEN** the judge reviews the repository, screenshots, or demo materials
- **WHEN** they evaluate required and bonus criteria
- **THEN** they can find explicit evidence for Copilot Chat hosting, Microsoft IQ / Work IQ grounding, MCP App or API plugin usage, external MCP read/write operations, OAuth/security controls, human review, responsible AI controls, and frontend demo quality

### Requirement: Evaluation Harness
The system SHALL include repeatable demo scenarios that validate core behavior before submission.

#### Scenario: Golden scenario validation
- **GIVEN** synthetic enterprise data exists for customer success renewals
- **WHEN** the team runs the demo validation checklist
- **THEN** the checklist verifies role-based discovery, proposal creation, risk scoring, review submission, approval, release, unauthorized MCP rejection, audit logging, and frontend update
- **AND** failures identify missing evidence needed before submission

### Requirement: P0 Build Gate
The system SHALL complete all P0 scope from the execution plan before submission polish is considered complete.

#### Scenario: Build readiness review
- **GIVEN** the team claims the build is hackathon-ready
- **WHEN** the acceptance rubric is reviewed
- **THEN** every P0 gate is marked pass with linked evidence
- **AND** unresolved P0 failures block final submission

### Requirement: Model And Task Governance
The system SHALL define runtime model roles, temperature guidance, reasoning depth, and output contracts for all LLM-assisted behavior.

#### Scenario: Runtime task uses an LLM
- **GIVEN** a runtime task uses Copilot or optional Azure AI Foundry / Azure OpenAI
- **WHEN** the task generates recommendations, proposals, risk rationale, release packets, or review summaries
- **THEN** the task follows the model and task matrix
- **AND** security-sensitive tasks use low temperature, constrained outputs, and deterministic validation

### Requirement: Build Prompt Readiness
The system SHALL include enough implementation guidance to generate a build prompt without relying on prior chat history.

#### Scenario: Generate final build prompt
- **GIVEN** a build agent receives the OpenSpec change folder
- **WHEN** it reads the proposal, design, frontend brief, MCP contract, execution plan, model-task matrix, acceptance rubric, and build prompt source
- **THEN** it can identify required stack, P0 scope, P1 differentiators, safety boundaries, demo flow, visual targets, and verification commands
- **AND** it can implement Signal Foundry without using raw Microsoft 365 content or personal non-Microsoft runtime accounts
