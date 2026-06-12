# 9.9+ Implementation Prompt — Live Copilot Checkpoints

You are implementing live Copilot Mirror checkpoints for Signal Foundry in
`/Users/mattgraves/Development/hackathon-enterprise`.

Use `docs/submission/live-copilot-checkpoints-spec.md` as the source of truth.
This prompt is the executable implementation brief. Follow the repo rules:
absolute paths only, read before edit, keep files under 575 lines, protect
existing user changes, use `apply_patch` for manual edits, and run the required
validation before committing or deploying.

## Objective

Implementation prompt grade target: **9.9+**. The implementation should be
complete enough that another senior coding agent can execute without inventing
contracts, routes, schemas, package steps, validators, tests, rollout order, or
rollback behavior.

Replace the static Copilot Mirror transcript fixture with live, approved Signal
Foundry conversation checkpoints written by the Microsoft 365 Copilot
declarative agent through MCP.

The result must show real MCP-backed checkpoint bubbles in Foundry Floor while
preserving the demo fallback when no live checkpoints exist.

Repo facts already verified for this prompt:

- `apps/mcp-server/src/auth.ts` has explicit `writeActions` and
  `reviewerActions` lists.
- `apps/mcp-server/src/tableStorageAdapter.ts` has an explicit `tableNames`
  map.
- The Copilot package contains local and Azure MCP action manifests, local and
  Azure declarative-agent JSON files, and REST OpenAPI fallback files.
- `apps/copilot-agent/docs/schema-verification.md` records package validator
  evidence and currently must be moved from 12 tools to 13 tools.

## Non-Negotiables

- Do not scrape, export, replay, or store raw Microsoft 365 Copilot Chat
  transcripts.
- Do not capture raw user prompts or raw Copilot responses.
- Do not store raw emails, chats, meeting transcripts, files, customer records,
  personal data, secrets, tokens, or stack traces.
- Checkpoint bubbles are sanitized evidence summaries only.
- The deterministic risk gate remains the source of truth.
- Existing mutation confirmation rules remain intact.
- Do not claim live Copilot Mirror support until a deployed MCP checkpoint
  appears in the live portal with `Live from approved MCP checkpoints`.

## Model Role Assignment

Use these role settings if delegating or staging work:

| Phase | Model role | Temp | Effort |
| --- | --- | ---: | --- |
| Shared contracts | TypeScript contract engineer | 0.1 | Medium |
| MCP metadata/package | Copilot package engineer | 0.1 | Medium |
| Server mutation/security | Backend/security engineer | 0.0 | High |
| Registry/snapshot | Data integration engineer | 0.1 | Medium |
| Portal UI/data flow | Frontend product engineer | 0.2 | Medium |
| Agent instructions | Agent prompt engineer | 0.2 | Medium |
| Package/release validation | Release engineer | 0.0 | Medium |
| Test coverage | QA automation engineer | 0.1 | High |
| Security review | Security reviewer | 0.0 | High |
| Deployment/live smoke | Release operator | 0.0 | High |

Execution order is strict. Shared contracts first, server and registry second,
portal third, Copilot package fourth, full validation fifth, deployment last.

## Required Implementation

### 1. Shared Types And Schemas

Update `packages/shared/src/types.ts`:

- Add `CopilotCheckpointSpeaker`.
- Add `CopilotCheckpointStage`.
- Add `CopilotCheckpointSource`.
- Add `CopilotCheckpointApprovalState`.
- Add `CopilotCheckpoint`.
- Add `copilotCheckpoints: CopilotCheckpoint[]` to `SignalFoundryRegistry`.
- Add `record_copilot_checkpoint` to `McpAction`.

Update `packages/shared/src/schemas.ts`:

- Add checkpoint enum schemas.
- Add `recordCopilotCheckpointInputSchema`.
- Add it to `toolSchemas`.
- Ensure the tool is treated as a write because it extends
  `idempotentRequestSchema`.

The checkpoint input must require:

- `tenantId`
- `projectId`
- `correlationId`
- `idempotencyKey`
- `confirmed: true`
- `sessionId`
- `speaker`
- `stage`
- `source`
- `approvalState`
- `actor`
- `displayText`

### 2. MCP Tool Metadata And Package Contract

Update `packages/shared/src/mcpTools.ts`:

- Add `record_copilot_checkpoint`.
- Description: records sanitized conversation checkpoints only.
- No `readOnlyHint`.
- Include length and privacy descriptions on `displayText`.

Regenerate or update:

- `apps/copilot-agent/package/actions/mcp-tools.json`
- `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json`
- `apps/copilot-agent/package/actions/signal-foundry-mcp.local.json`

Required package contract:

- Static MCP tool count becomes 13.
- `run_for_functions` includes `record_copilot_checkpoint`.
- Tool order in `run_for_functions` matches `mcp-tools.json`.
- Keep both `signal-foundry-mcp.azure.json` and
  `signal-foundry-mcp.local.json` aligned to the same tool list.
- Do not update REST OpenAPI fallback contracts unless an active package action
  or validator requires parity. If they stay unchanged, report that the live
  package path uses Remote MCP.

Update `scripts/validate-copilot-package.mjs`:

- Expect 13 tools.
- Require `record_copilot_checkpoint`.
- Require mutation fields `idempotencyKey` and `confirmed`.
- Require the package instructions to include the checkpoint boundary.
- Print or assert the new 13-tool count so stale 12-tool evidence is obvious.

### 3. Server Mutation

Update `apps/mcp-server/src/tools.ts`:

- Add `record_copilot_checkpoint` case.
- Implement `recordCopilotCheckpoint(store, input, actor)`.

Behavior:

- Use existing authorization path.
- Reject missing confirmation.
- Interpret checkpoint `confirmed:true` as confirmation that the checkpoint is a
  sanitized summary from an already-permitted Signal Foundry step. It must not
  bypass explicit confirmation for proposal, risk, review, approval, rejection,
  or release mutations.
- Update `apps/mcp-server/src/auth.ts`:
  - add `record_copilot_checkpoint` to `writeActions`
  - do not add it to `reviewerActions`
  - keep normal authenticated actor checks
- Generate ID with `makeId("cp", input.idempotencyKey)`.
- Deduplicate by ID.
- Reject unsafe `displayText`.
- Store sanitized checkpoint.
- Add MCP activity with action `record_copilot_checkpoint`.
- Return `checkpointId`, `sessionId`, `stage`, `approvalState`,
  `correlationId`, and `ok:true`.

Validation rules:

- `approvalState: "human_approved"` is allowed only for `approval` or
  `release`.
- `system_approved` checkpoints are allowed for authenticated employee,
  reviewer, or admin actors.
- `human_approved` checkpoints require reviewer or admin actor role inside the
  checkpoint mutation.
- `approval` and `release` stages require `relatedRecordId`.
- Reject unsafe content with `400`, `ok:false`, sanitized error, and rejected
  activity.

Sanitizer must reject likely raw content markers:

- long quoted blocks
- `From:`, `To:`, `Subject:` email headers
- transcript speaker/time dumps
- bearer tokens or access tokens
- stack traces
- Social Security, credit card, obvious secret/key patterns

Accepted text must be summary prose and capped at 420 characters.

### 4. Registry And Snapshot

Update all seed/fixture registry shapes:

- `data/signal-foundry-seed.json`
- shared demo fixtures
- any test registry factory

Add:

```json
"copilotCheckpoints": []
```

Update registry persistence:

- Local file store reads/writes checkpoint array.
- Update `apps/mcp-server/src/tableStorageAdapter.ts` `tableNames` with
  `copilotCheckpoints: "CopilotCheckpoints"` so Azure Table-backed persistence
  stores the collection.
- `/registry/snapshot` includes `copilotCheckpoints`.

Sort checkpoints newest-first in snapshot or client data flow.

### 5. Portal Live Data

Update `apps/foundry-floor/src/liveData.ts`:

- Include `copilotCheckpoints` in `RegistrySnapshot`.
- Include `copilotCheckpoints` in `DashboardData`.
- Live snapshot returns live checkpoints sorted newest-first.
- Fallback data returns an empty checkpoint array.
- Do not merge static demo chat turns into live checkpoint data.

Update `apps/foundry-floor/src/App.tsx`:

- Pass `dashboardData.copilotCheckpoints` into `CopilotMirror`.
- Keep `copilotTurns` only as fallback.

### 6. Copilot Mirror UI

Update `apps/foundry-floor/src/panels.tsx`:

- `CopilotMirror` accepts:

```ts
turns: CopilotTurn[];
checkpoints?: readonly CopilotCheckpoint[];
isLiveCheckpointSource?: boolean;
```

- Render checkpoints when present.
- Render static `turns` only when checkpoint array is empty.
- Add source pill:
  - `Live from approved MCP checkpoints`
  - `Demo transcript fallback`
- Each live bubble renders:
  - speaker
  - created time
  - display text
  - evidence line with stage, source tool if present, and correlation ID
- Keep content-sized response cards.
- Do not render raw JSON.

### 7. Copilot Agent Instructions And Package

Update:

- `apps/copilot-agent/docs/instructions.md`
- `apps/copilot-agent/package/declarative-agent.azure.json`
- `apps/copilot-agent/package/declarative-agent.local.json`

Instruction text must stay below the 8,000-character limit and must not weaken
existing safety rules.

Required instruction meaning:

```text
After each meaningful Signal Foundry step, write one sanitized checkpoint with
record_copilot_checkpoint. A checkpoint is summary evidence only. Never send raw
emails, chats, transcripts, documents, customer records, secrets, personal data,
or verbatim user prompts. For read-only steps, summarize user intent or tool
result. For approval or release, write the checkpoint only after the successful
approve_capability or release_capability tool result. Then verify with
list_mcp_activity before claiming the checkpoint is recorded.
```

Update the Copilot package zip:

- bump version
- include 13-tool MCP action contract
- include updated instructions
- include existing icons
- update validator hash
- update `apps/copilot-agent/docs/schema-verification.md` with the new
  validator result, 13-tool count, and package hash

### 8. Tests

Add or update tests for:

- schema accepts valid checkpoint input
- schema rejects invalid enum/overlong text
- mutation without `confirmed:true` fails
- employee can write system-approved discovery checkpoint
- employee cannot write human-approved approval/release checkpoint
- reviewer can write human-approved approval checkpoint
- human-approved checkpoint rejected for non-approval/release stages
- approval/release checkpoints require `relatedRecordId`
- unsafe display text is rejected and logged as sanitized activity
- idempotency returns existing checkpoint
- `/registry/snapshot` includes checkpoints
- portal renders live checkpoints and source pill
- portal renders demo fallback when no checkpoints exist
- Playwright writes a checkpoint through MCP and sees the mirror update after
  polling
- validators expect 13 tools and updated package hash
- schema verification docs no longer contain stale 12-tool package evidence

### 9. Validation

Run all commands:

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run typecheck
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:copilot
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:workiq-foundry
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:cards
```

After any E2E run, check whether `data/signal-foundry-seed.json` was mutated by
test fixtures. Restore generated runtime records unless the schema change itself
requires a committed baseline update.

### 10. Review

Run quick review-board mode before final response.

Review focus:

- auth and role boundaries
- sanitizer bypasses
- raw transcript leakage
- checkpoint retention and rollback behavior
- validator/package consistency
- portal fallback ambiguity
- deployment order

Findings must cite exact file and line evidence.

### 11. Deployment And Live Smoke

Only after local validation passes:

1. Declare blast radius and rollback.
2. Deploy MCP/API first.
3. Deploy Foundry Floor second.
4. Upload the new Copilot package.
5. Use the Copilot agent to write a discovery checkpoint.
6. If tenant package upload is blocked, use the deployed MCP endpoint with demo
   bearer actor `actor-priya` only as a fallback smoke for a `system_approved`
   discovery checkpoint, and label that evidence as MCP smoke rather than
   Copilot tenant smoke.
7. Approve or release a capability and write the approval/release checkpoint
   using reviewer actor `actor-alex`.
8. Open the live portal and verify:
   - Copilot Mirror shows `Live from approved MCP checkpoints`
   - approval/release checkpoint bubbles are visible
   - bubbles include correlation IDs
   - no raw transcript text appears

## Acceptance Criteria

- All validation commands pass.
- Copilot package validator passes with 13 tools.
- Live portal renders MCP-backed checkpoints when present.
- Demo fallback remains available when checkpoint list is empty.
- Approval/release checkpoint correlates to actual successful MCP mutation.
- No raw Microsoft 365 content appears in data, UI, screenshots, logs, package,
  or evidence.
- Worktree is clean after commit/push.

## Expected Final Report

Include:

- files changed
- tests run and results
- package zip path/version/hash
- commit hash
- deployed MCP URL
- deployed portal URL
- live smoke result
- any residual risk or tenant-dependent manual step
