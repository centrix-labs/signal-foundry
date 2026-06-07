# Decision & Alignment Agent Specification

## ADDED Requirements

### Requirement: Copilot Chat Surface
The system SHALL expose the Decision & Alignment Agent through Microsoft 365 Copilot Chat.

#### Scenario: User invokes the agent
- **GIVEN** a user with access to the sideloaded agent
- **WHEN** the user asks for decision or alignment help in Microsoft 365 Copilot Chat
- **THEN** the agent responds inside the Copilot Chat experience
- **AND** the response is scoped to the user's available Microsoft 365 context

### Requirement: Work Context Grounding
The system SHALL use Microsoft 365 work context to ground decision and alignment analysis.

#### Scenario: Decision debt discovery
- **GIVEN** recent meetings, emails, Teams conversations, or documents exist in the user's accessible Microsoft 365 context
- **WHEN** the user asks the agent to find unresolved decisions
- **THEN** the agent identifies candidate unresolved decisions
- **AND** the agent explains the supporting context at a summary level
- **AND** the agent does not expose content the user is not authorized to access

### Requirement: Alignment Risk Detection
The system SHALL identify alignment risks from conflicting or stale business signals.

#### Scenario: Conflicting expectations
- **GIVEN** accessible work context contains inconsistent dates, owners, commitments, assumptions, or approval states
- **WHEN** the user asks the agent to assess alignment
- **THEN** the agent summarizes the conflicting signals
- **AND** the agent proposes an owner and next action for each risk

### Requirement: Confidence Scoring
The system SHALL score decision and alignment findings by evidence strength and uncertainty.

#### Scenario: Weak signal disclosure
- **GIVEN** a candidate finding is based on incomplete or indirect work context
- **WHEN** the agent presents the finding to the user
- **THEN** the agent labels the confidence as low, medium, or high
- **AND** the agent explains what additional confirmation would raise confidence
- **AND** the agent avoids presenting inferred risks as verified facts

### Requirement: Decision Registry MCP Tools
The system SHALL use an external MCP server to read and write Decision Registry records.

#### Scenario: Create decision record
- **GIVEN** the agent has identified a candidate decision
- **WHEN** the user confirms creation of a registry record
- **THEN** the agent calls the MCP server to create the decision
- **AND** the registry stores the decision with tenant, project, owner, status, source summary, and audit metadata

### Requirement: Alignment Registry MCP Tools
The system SHALL use an external MCP server to read and write Alignment Risk Registry records.

#### Scenario: Create alignment risk
- **GIVEN** the agent has identified an alignment risk
- **WHEN** the user confirms creation of a risk record
- **THEN** the agent calls the MCP server to create the alignment risk
- **AND** the registry stores conflicting signals, impacted teams, severity, owner, status, and audit metadata

### Requirement: Alignment Map
The system SHALL generate an Alignment Map that visualizes relationships among decisions, risks, teams, owners, commitments, and conflicting signals.

#### Scenario: Visualize organizational drift
- **GIVEN** decision records and alignment risk records exist for a project
- **WHEN** the user asks for an alignment map
- **THEN** the agent retrieves registry data through the MCP server
- **AND** the agent presents nodes and relationships for decisions, risks, owners, teams, and impacted commitments
- **AND** the map highlights high-severity unresolved risks

### Requirement: Demo Console
The system SHALL provide a judge-facing frontend console that visualizes registry state, evidence, review workflow, and audit-safe activity.

#### Scenario: Judge follows end-to-end workflow
- **GIVEN** a demo operator runs the Copilot Chat scenario
- **WHEN** the agent writes a decision or alignment risk through MCP
- **THEN** the frontend console shows the created or updated registry record
- **AND** the Alignment Map updates to reflect the new relationship
- **AND** the console shows an audit-safe activity event with a correlation identifier

#### Scenario: Unauthorized state
- **GIVEN** the MCP server rejects a request because authentication or authorization is invalid
- **WHEN** the frontend displays the failed operation
- **THEN** the console explains the authorization failure without exposing tokens, secrets, raw content, or stack traces

### Requirement: Evidence Packets
The system SHALL create evidence packets for decision and alignment records.

#### Scenario: Create evidence packet
- **GIVEN** a user confirms a decision or alignment risk record
- **WHEN** the record is created or updated
- **THEN** the system stores an evidence packet with source summaries, confidence, actor, timestamp, and review status
- **AND** the packet excludes raw meeting transcripts, document bodies, secrets, and access tokens

### Requirement: Human Review Queue
The system SHALL support human review for high-impact or low-confidence findings.

#### Scenario: Escalate uncertain finding
- **GIVEN** a finding has high business impact or low confidence
- **WHEN** the user asks to proceed
- **THEN** the agent creates a review item instead of finalizing the record as resolved
- **AND** the review item includes owner, recommended action, due date, confidence, and evidence summary

### Requirement: Human-Confirmed Mutations
The system SHALL require explicit user confirmation before writing or updating external registry data.

#### Scenario: Prevent accidental writes
- **GIVEN** the agent has enough information to create or update a registry record
- **WHEN** the user has not confirmed the write action
- **THEN** the agent presents the proposed change for review
- **AND** the agent does not call mutation tools until confirmation is provided

### Requirement: OAuth-Secured MCP Access
The system SHALL secure MCP tool access using Microsoft Entra ID or OAuth-compatible authentication.

#### Scenario: Unauthorized MCP call
- **GIVEN** a request to the MCP server has no valid access token
- **WHEN** the request attempts to read or write registry data
- **THEN** the MCP server rejects the request
- **AND** the rejection is logged without exposing secrets or sensitive content

### Requirement: Audit-Safe Observability
The system SHALL capture operational logs without storing raw Microsoft 365 content, secrets, or tokens.

#### Scenario: Registry write audit
- **GIVEN** a user confirms a registry write
- **WHEN** the MCP server creates or updates a record
- **THEN** the server logs actor, tenant, action, record type, record identifier, timestamp, and correlation identifier
- **AND** the log excludes raw meeting transcripts, document bodies, access tokens, and client secrets

### Requirement: Judge Evidence Mapping
The system SHALL provide submission evidence that maps implemented functionality to hackathon requirements and bonus criteria.

#### Scenario: Judge reviews repository
- **GIVEN** the judge reviews the repository, screenshots, or demo materials
- **WHEN** they evaluate required and bonus criteria
- **THEN** they can find explicit evidence for Copilot Chat hosting, Microsoft IQ integration, MCP App usage, external MCP read/write operations, OAuth, security controls, and responsible AI controls

### Requirement: Evaluation Harness
The system SHALL include repeatable demo scenarios that validate core behavior before submission.

#### Scenario: Golden scenario validation
- **GIVEN** synthetic enterprise data exists for a project
- **WHEN** the team runs the demo validation checklist
- **THEN** the checklist verifies unresolved decision discovery, alignment risk discovery, human-confirmed writes, unauthorized MCP rejection, audit logging, and executive brief generation
- **AND** failures identify the missing evidence needed before submission
