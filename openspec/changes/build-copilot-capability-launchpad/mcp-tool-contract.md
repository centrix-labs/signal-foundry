# MCP Tool Contract: Signal Foundry

## Shared Requirements

All tools SHALL:

- validate inputs with Zod schemas,
- require tenant and project scope,
- attach or return a correlation ID,
- redact secrets, tokens, raw Microsoft 365 content, stack traces, and PII,
- return structured JSON,
- log audit-safe activity,
- reject unauthorized calls with sanitized errors.

All write tools SHALL:

- require authenticated user context,
- require explicit user confirmation from the agent flow,
- require an idempotency key,
- record actor, action, target record, timestamp, and correlation ID.

## Roles

- `employee`: search and recommend capabilities; create own proposals.
- `reviewer`: score, review, approve, reject, and release capabilities.
- `admin`: manage synthetic data, reset demo state, and inspect audit activity.

## Tools

### `search_capabilities`

Purpose: Read approved or proposed capabilities by role, department, stage, risk, or keyword.

Input:

- `tenantId`
- `projectId`
- `query`
- `role`
- `department`
- `status`
- `riskLevel`

Output:

- `capabilities[]`
- `correlationId`

### `recommend_capabilities_for_role`

Purpose: Recommend useful approved and candidate capabilities for a role.

Input:

- `tenantId`
- `projectId`
- `role`
- `department`
- `workSignalSummary`
- `maxResults`

Output:

- `approvedCapabilities[]`
- `candidateCapabilities[]`
- `rationale`
- `correlationId`

### `create_capability_proposal`

Purpose: Create a governed proposal from a selected use case.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `title`
- `description`
- `role`
- `department`
- `owner`
- `intendedAudience`
- `inputsRequired[]`
- `proposedOutputs[]`
- `sourceSummary`

Output:

- `proposalId`
- `status`
- `correlationId`

### `score_capability_risk`

Purpose: Produce deterministic risk review for a proposal.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `proposalId`
- `dataSensitivity`
- `externalSharing`
- `automationLevel`
- `audienceScope`
- `usesCustomerData`
- `requiresHumanReview`

Output:

- `riskReviewId`
- `riskLevel`
- `requiredControls[]`
- `rationale`
- `correlationId`

### `submit_capability_review`

Purpose: Route a scored proposal to a reviewer.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `proposalId`
- `reviewer`
- `dueDate`

Output:

- `reviewItemId`
- `status`
- `correlationId`

### `approve_capability`

Purpose: Approve a capability proposal for release.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `proposalId`
- `reviewer`
- `approvalNotes`

Output:

- `capabilityId`
- `status`
- `correlationId`

### `reject_capability`

Purpose: Reject a capability proposal with reason and next action.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `proposalId`
- `reviewer`
- `reason`
- `nextAction`

Output:

- `proposalId`
- `status`
- `correlationId`

### `release_capability`

Purpose: Release an approved capability as a reusable playbook.

Input:

- `tenantId`
- `projectId`
- `idempotencyKey`
- `capabilityId`
- `releasedBy`
- `audience`
- `version`

Output:

- `releasePacketId`
- `status`
- `correlationId`

### `generate_release_packet`

Purpose: Generate an audit-safe release packet for judges and reviewers.

Input:

- `tenantId`
- `projectId`
- `capabilityId`

Output:

- `releasePacket`
- `correlationId`

### `generate_capability_map`

Purpose: Return Signal Atlas graph data.

Input:

- `tenantId`
- `projectId`
- `filters`

Output:

- `nodes[]`
- `edges[]`
- `legend`
- `correlationId`

### `list_mcp_activity`

Purpose: Return audit-safe MCP activity for the Foundry Floor.

Input:

- `tenantId`
- `projectId`
- `limit`

Output:

- `activity[]`
- `correlationId`
