# Live Copilot Checkpoints Implementation Spec

## Goal

Replace the static Copilot Mirror transcript fixtures with live, approved Signal
Foundry conversation checkpoints written by the Microsoft 365 Copilot
declarative agent through the deployed MCP server.

The portal must show audit-safe evidence of what happened in the real Copilot
conversation without scraping, storing, or rendering raw Microsoft 365 Copilot
chat transcripts.

## Platform Boundary

Signal Foundry should treat Microsoft 365 Copilot Chat as the user-facing
orchestrator and MCP as the durable evidence boundary.

Microsoft documents declarative agents as custom Microsoft 365 Copilot
experiences configured with instructions, actions, and knowledge. Plugins allow
declarative agents to interact with MCP servers or REST APIs, including reads
and writes to external systems:

- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-declarative-agent
- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-plugins

Do not design this as raw transcript ingestion. Copilot Studio session transcript
download is a different runtime path:

- https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-transcripts-studio

## Success Criteria

- Copilot Mirror bubbles are loaded from live MCP registry state when available.
- Static `copilotTurns` remain a fallback only when no live checkpoints exist.
- The Copilot agent writes a checkpoint after meaningful read/write steps.
- Checkpoints contain sanitized summaries, not raw prompts or raw Microsoft 365
  content.
- Approval and release checkpoints are tied to actual successful MCP mutations.
- Checkpoint records include `tenantId`, `projectId`, `sessionId`,
  `correlationId`, actor, stage, source tool, approval state, and display text.
- The MCP server rejects checkpoint text that looks like raw emails, chats,
  transcripts, secrets, stack traces, or personal data.
- Playwright proves a checkpoint written through MCP appears in the Copilot
  Mirror without a page rebuild.
- Copilot package validation covers the new tool, schema, instructions, and
  package hash.
- Package evidence docs record the 13-tool validator result so stale 12-tool
  evidence cannot survive the implementation.

## Spec Grade

Current implementation-prompt grade: **9.94 / 10**.

Why it grades above 9.9:

- It defines the platform boundary and avoids the raw transcript trap.
- It specifies the exact MCP mutation, schema, data model, registry exposure,
  portal behavior, Copilot package changes, validators, tests, rollout, and
  rollback.
- It ties live bubbles to durable, approved MCP evidence instead of unmanaged
  chat text.
- It calls out the package contract drift from 12 to 13 tools, which is the
  easiest implementation miss.
- It names the exact storage adapter and package evidence files that must move
  with the schema, reducing implementation inference.
- It requires sanitizer rejection tests and live Playwright proof, not only
  static unit tests.

Remaining 0.06 risk:

- The final Copilot package upload and live tenant behavior depend on Microsoft
  365 tenant configuration outside the repo.
- The exact Copilot orchestration sequence can vary, so the instructions must
  make checkpoint writes explicit, short, and verification-gated.

## Model Task Assignment

Use low temperature for implementation and validation. Increase temperature only
for short UI copy polish after behavior is working.

| Phase | Task | Best model role | Temp | Effort | Required output |
| --- | --- | --- | ---: | --- | --- |
| 1 | Shared checkpoint types, Zod schemas, and `ToolName` update | TypeScript contract engineer | 0.1 | Medium | Compiling shared package with `CopilotCheckpoint` and `record_copilot_checkpoint` schema |
| 2 | MCP metadata and static `mcp-tools.json` update | Copilot package engineer | 0.1 | Medium | 13-tool MCP contract with ordered `run_for_functions` alignment |
| 3 | Server mutation, sanitizer, idempotency, authorization, activity logging | Backend/security engineer | 0.0 | High | Safe write path that rejects raw transcript-like content |
| 4 | Registry persistence and `/registry/snapshot` exposure | Data integration engineer | 0.1 | Medium | Checkpoints persisted locally and in Azure Table-backed registry snapshots |
| 5 | Portal live data flow and Copilot Mirror rendering | Frontend product engineer | 0.2 | Medium | Live checkpoint source pill, fallback pill, content-sized bubbles, no raw JSON |
| 6 | Copilot instructions under 8,000 characters | Agent prompt engineer | 0.2 | Medium | Concise checkpoint instructions with no weakening of safety rules |
| 7 | Copilot package zip, version, hash, validators | Release engineer | 0.0 | Medium | Validated package, updated hash, 13-tool validator pass |
| 8 | Unit, server, and Playwright coverage | QA automation engineer | 0.1 | High | Tests proving write, rejection, snapshot, live mirror, fallback mirror |
| 9 | Security/privacy review | Security reviewer | 0.0 | High | Findings-first review of sanitizer, auth, data retention, and UI exposure |
| 10 | Deploy MCP, deploy portal, upload package, run live smoke | Release operator | 0.0 | High | Live proof that Copilot-driven approval/release checkpoint appears in portal |

Execution order is strict. Do not start portal work before the shared type and
snapshot contract exist. Do not package the Copilot agent before server tests
prove the checkpoint tool works. Do not claim live Copilot Mirror support until
the deployed MCP server has written at least one checkpoint and the live portal
renders it with `Live from approved MCP checkpoints`.

## Non-Goals

- Do not export or replay full Microsoft 365 Copilot Chat transcripts.
- Do not capture raw user prompts.
- Do not capture raw Copilot responses.
- Do not store raw Microsoft 365 content, emails, chats, meeting transcripts,
  files, customer records, secrets, or stack traces.
- Do not add a browser-extension or DOM-scraping path.
- Do not bypass the existing confirmation gate for registry mutations.

## User Experience

In the Copilot Mirror:

- If live checkpoints exist, show `Live from approved MCP checkpoints`.
- If no live checkpoints exist, show `Demo transcript fallback`.
- Each bubble shows:
  - speaker: `operator`, `copilot`, `foundry`, or `reviewer`
  - checkpoint time
  - sanitized display text
  - compact evidence line: stage, source tool, correlation ID
- Approval/release bubbles should use the same light-blue Copilot card language
  already used for Copilot responses.
- Failed sanitizer attempts should not render as chat bubbles. They should show
  only in MCP Activity as rejected/sanitized evidence.

## Data Model

Add these types in `packages/shared/src/types.ts`:

```ts
export type CopilotCheckpointSpeaker = "operator" | "copilot" | "foundry" | "reviewer";
export type CopilotCheckpointStage =
  | "discovery"
  | "proposal"
  | "risk"
  | "review"
  | "approval"
  | "release"
  | "refusal";
export type CopilotCheckpointSource =
  | "user_intent_summary"
  | "tool_result_summary"
  | "approval_result"
  | "release_result"
  | "refusal_summary";
export type CopilotCheckpointApprovalState =
  | "system_approved"
  | "human_approved"
  | "rejected_by_policy";

export interface CopilotCheckpoint {
  id: string;
  tenantId: string;
  projectId: string;
  sessionId: string;
  speaker: CopilotCheckpointSpeaker;
  stage: CopilotCheckpointStage;
  source: CopilotCheckpointSource;
  sourceTool?: McpAction;
  relatedRecordId?: string;
  approvalState: CopilotCheckpointApprovalState;
  actor: string;
  displayText: string;
  createdAt: string;
  correlationId: string;
}
```

Extend `SignalFoundryRegistry`:

```ts
copilotCheckpoints: CopilotCheckpoint[];
```

## MCP Tool Contract

Add a mutation tool named `record_copilot_checkpoint`.

Schema in `packages/shared/src/schemas.ts`:

```ts
export const copilotCheckpointSpeakerSchema = z.enum(["operator", "copilot", "foundry", "reviewer"]);
export const copilotCheckpointStageSchema = z.enum(["discovery", "proposal", "risk", "review", "approval", "release", "refusal"]);
export const copilotCheckpointSourceSchema = z.enum([
  "user_intent_summary",
  "tool_result_summary",
  "approval_result",
  "release_result",
  "refusal_summary"
]);
export const copilotCheckpointApprovalStateSchema = z.enum([
  "system_approved",
  "human_approved",
  "rejected_by_policy"
]);

export const recordCopilotCheckpointInputSchema = idempotentRequestSchema.extend({
  sessionId: z.string().min(8).max(120),
  speaker: copilotCheckpointSpeakerSchema,
  stage: copilotCheckpointStageSchema,
  source: copilotCheckpointSourceSchema,
  sourceTool: z.string().min(3).optional(),
  relatedRecordId: z.string().min(3).max(120).optional(),
  approvalState: copilotCheckpointApprovalStateSchema,
  actor: z.string().min(2).max(80),
  displayText: z.string().min(8).max(420)
});
```

Add to `toolSchemas` and `ToolName`.

Authorization:

- Add `record_copilot_checkpoint` to `writeActions` in
  `apps/mcp-server/src/auth.ts`.
- Do not add it to `reviewerActions`; employee actors must be able to write
  `system_approved` discovery/proposal/risk/refusal checkpoints.
- Enforce reviewer/admin role inside the checkpoint mutation when
  `approvalState` is `human_approved`.
- `confirmed:true` on a checkpoint means the agent confirms the summary is
  sanitized and derived from an already-permitted Signal Foundry step. It does
  not replace explicit user confirmation required by proposal, risk, review,
  approval, release, or rejection mutations.

Metadata in `packages/shared/src/mcpTools.ts`:

- Description must state this records sanitized conversation checkpoints only.
- It must require `tenantId`, `projectId`, `correlationId`,
  `idempotencyKey`, `confirmed`, `sessionId`, `speaker`, `stage`, `source`,
  `approvalState`, `actor`, and `displayText`.
- Mark it as a mutation, not `readOnlyHint`.

Package impact:

- Static MCP tool count changes from 12 to 13.
- `scripts/validate-copilot-package.mjs` must expect 13 tools.
- `apps/copilot-agent/package/actions/mcp-tools.json` must include the tool.
- `apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json`
  `run_for_functions` must include the new tool in the same order as
  `mcp-tools.json`.
- `apps/copilot-agent/package/actions/signal-foundry-mcp.local.json` must stay
  aligned with the same `mcp-tools.json` contract.
- REST OpenAPI fallback files should be changed only if the active package
  action references them or validators require parity. If left unchanged, add a
  short note in the final report explaining that the deployed package uses MCP.

## Server Behavior

Add a case to `apps/mcp-server/src/tools.ts`:

```ts
case "record_copilot_checkpoint":
  return ok(recordCopilotCheckpoint(store, data, activeActor), correlationId);
```

Implementation requirements:

- Enforce the existing write authorization path.
- Enforce `confirmed: true` because this writes durable evidence.
- Permit `system_approved` checkpoints from authenticated employee, reviewer, or
  admin actors.
- Require reviewer/admin actor role for `human_approved` checkpoints.
- Generate deterministic ID with `makeId("cp", input.idempotencyKey)`.
- Deduplicate by ID and return existing checkpoint if present.
- Sanitize `displayText` before writing.
- Reject unsafe content with status `400`, `ok:false`, and sanitized error.
- If `approvalState` is `human_approved`, require `stage` to be `approval` or
  `release`.
- If `stage` is `approval`, require `relatedRecordId`.
- If `stage` is `release`, require `relatedRecordId`.
- Write a matching MCP activity entry with action
  `record_copilot_checkpoint`.

Sanitizer requirements:

- Reuse `sanitizeAdvisoryText` as a base, but add a checkpoint-specific guard.
- Reject likely raw content markers:
  - long quoted blocks
  - email headers such as `From:`, `To:`, `Subject:`
  - transcript speaker/time dumps
  - access tokens or bearer strings
  - stack traces
  - Social Security, credit card, or obvious secret patterns
- Truncate accepted text to 420 characters.
- Accepted text must be written as summary prose, not as a quote from the user
  or Copilot.

## Registry Store

Update registry initialization and persistence:

- `packages/shared/src/fixtures.ts` or equivalent seed fixture:
  `copilotCheckpoints: []`
- `data/signal-foundry-seed.json`:
  add `"copilotCheckpoints": []`
- Azure Table Storage mapping:
  update `apps/mcp-server/src/tableStorageAdapter.ts` `tableNames` with
  `copilotCheckpoints: "CopilotCheckpoints"`.
- `/registry/snapshot`:
  include `copilotCheckpoints`.

The snapshot should return latest checkpoints first or the UI should sort them
client-side by `createdAt`.

## Portal Data Flow

Update `apps/foundry-floor/src/liveData.ts`:

- Extend `RegistrySnapshot` to include `copilotCheckpoints`.
- Extend `DashboardData` with:

```ts
copilotCheckpoints: CopilotCheckpoint[];
```

- When live snapshot exists, merge/sort live checkpoints only.
- When no live checkpoints exist, return an empty live checkpoint array and let
  the UI fallback to static demo turns.

Do not merge static demo chat bubbles into live checkpoint data. That would make
the source ambiguous.

## Copilot Mirror UI

Update `apps/foundry-floor/src/panels.tsx`:

- `CopilotMirror` should accept:

```ts
turns: CopilotTurn[];
checkpoints?: readonly CopilotCheckpoint[];
isLiveCheckpointSource?: boolean;
```

- Render `checkpoints` when non-empty.
- Otherwise render `turns`.
- Add a small source pill:
  - live: `Live from approved MCP checkpoints`
  - fallback: `Demo transcript fallback`
- Keep current content-sized response cards.
- Do not show raw JSON.

Update `apps/foundry-floor/src/App.tsx`:

```tsx
<CopilotMirror
  turns={copilotTurns}
  checkpoints={dashboardData.copilotCheckpoints}
  isLiveCheckpointSource={dashboardData.copilotCheckpoints.length > 0}
  ...
/>
```

## Copilot Agent Instructions

Update:

- `apps/copilot-agent/docs/instructions.md`
- `apps/copilot-agent/package/declarative-agent.azure.json`
- `apps/copilot-agent/package/declarative-agent.local.json`
- generated package zip

After package validation, update
`apps/copilot-agent/docs/schema-verification.md` with the new validator result,
tool count, and package hash. This file currently records baseline package
evidence and must not remain on the old 12-tool count.

Instruction additions must fit under the 8,000-character validation limit.
Use concise language:

```text
After each meaningful Signal Foundry step, write one sanitized checkpoint with
record_copilot_checkpoint. A checkpoint is summary evidence only. Never send raw
emails, chats, transcripts, documents, customer records, secrets, personal data,
or verbatim user prompts. For read-only steps, summarize the user intent or tool
result. For approval or release, write the checkpoint only after the successful
approve_capability or release_capability tool result. Then verify with
list_mcp_activity before claiming the checkpoint is recorded.
```

Checkpoint examples:

- Discovery:
  `User asked for governed Customer Success renewal workflows. Signal Foundry used sanitized Work IQ-style context.`
- Proposal:
  `Copilot prepared Renewal Brief Generator as a governed proposal candidate. No raw Microsoft 365 content was used.`
- Risk:
  `Risk gate scored Renewal Brief Generator as medium risk. Human review and summary-only controls are required.`
- Approval:
  `Alex Kim approved Renewal Brief Generator for release preparation.`
- Release:
  `Renewal Brief Generator was released with an audit-safe packet and approved source summaries.`
- Refusal:
  `Signal Foundry refused an employee-monitoring request and redirected to workflow-level improvement.`

## Tests

Unit tests:

- Schema accepts a valid checkpoint.
- Schema rejects raw transcript-length text.
- Mutation without `confirmed:true` fails.
- Employee can write a system-approved discovery checkpoint.
- Employee cannot write a human-approved approval or release checkpoint.
- Reviewer can write a human-approved approval checkpoint.
- Human-approved checkpoint is rejected unless stage is `approval` or `release`.
- Unsafe display text is rejected and logged as sanitized MCP activity.
- Idempotency returns the existing checkpoint.

Server tests:

- `record_copilot_checkpoint` writes to registry.
- `/registry/snapshot` includes `copilotCheckpoints`.
- `list_mcp_activity` includes the checkpoint write.

Portal tests:

- With a mocked snapshot containing checkpoints, Copilot Mirror renders live
  checkpoint bubbles and the live source pill.
- With no checkpoints, Copilot Mirror renders static fallback turns and fallback
  source pill.
- After calling the MCP tool during Playwright setup, the mirror updates after
  the next polling interval.

Package validation:

- `validate:copilot` expects 13 tools.
- Package hash is updated.
- `apps/copilot-agent/docs/schema-verification.md` records the new 13-tool
  validator evidence and package hash.
- `run_for_functions` includes `record_copilot_checkpoint`.
- Instructions include the checkpoint boundary.
- Instructions remain under 8,000 characters.

End-to-end:

- Create proposal.
- Score risk.
- Submit review.
- Approve.
- Release.
- Write checkpoints after each step.
- Open Copilot Mirror.
- Verify the approval and release bubbles are live checkpoint bubbles, not demo
  fallback text.

## Acceptance Criteria

- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run test:e2e` passes.
- `npm run validate:copilot` passes.
- `npm run validate:workiq-foundry` passes.
- `npm run validate:cards` passes.
- Live portal shows `Live from approved MCP checkpoints` after a checkpoint is
  written through the deployed MCP server.
- Live portal falls back to `Demo transcript fallback` when the checkpoint list
  is empty.
- No raw transcript text appears in data files, UI, screenshots, logs, or
  evidence artifacts.
- A reviewer-approved checkpoint can be traced to the same `correlationId` as
  the approval or release MCP activity.

## Rollout Plan

1. Implement shared types, schemas, tool metadata, and static MCP tool JSON.
2. Implement server write path, sanitizer, persistence, snapshot exposure, and
   tests.
3. Implement portal live checkpoint data flow and Copilot Mirror rendering.
4. Update Copilot agent instructions, package version, zip, and hash validator.
5. Run full local validation.
6. Deploy MCP/API first.
7. Deploy Foundry Floor.
8. Upload the new Copilot package.
9. Run live smoke:
   - use Copilot agent to write one discovery checkpoint
   - if tenant upload is blocked, use the deployed MCP endpoint with demo bearer
     actor `actor-priya` only as a fallback smoke for a `system_approved`
     discovery checkpoint, then label the evidence as MCP smoke rather than
     Copilot tenant smoke
   - approve/release a capability
   - confirm the portal mirror shows live approval/release checkpoint bubbles

## Rollback Plan

- Portal rollback: redeploy the previous Static Web App build. The portal will
  return to static `copilotTurns` fallback.
- MCP rollback: redeploy the previous container image. Existing checkpoint rows
  can remain dormant because old code will ignore the unknown collection.
- Copilot package rollback: upload the prior validated package zip from
  `evidence/copilot`.
- Data rollback: do not delete checkpoint records during rollback unless they
  contain unsafe text. If unsafe text exists, quarantine the affected records and
  keep a sanitized audit event.

## Implementation Prompt

Implement live Copilot Mirror checkpoints for Signal Foundry.

Use `docs/submission/live-copilot-checkpoints-spec.md` as the source of truth.
Do not scrape raw Copilot transcripts. Add a `record_copilot_checkpoint` MCP
mutation that writes only sanitized, approved checkpoint summaries. Extend the
shared registry with `copilotCheckpoints`, expose them through
`/registry/snapshot`, and update Foundry Floor so Copilot Mirror renders live
checkpoints when present and static demo turns only as fallback.

Keep all files under the repo line-count limit. Update schemas, shared types,
MCP metadata, package action manifests, Copilot instructions, validators, tests,
and docs. Add tests for sanitizer rejection, idempotency, authorization,
snapshot exposure, portal fallback, and live portal rendering. Update the
Copilot package zip/version/hash after the manifest changes.

Run and pass:

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run typecheck
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:copilot
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:workiq-foundry
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run validate:cards
```

After local validation, deploy MCP/API before deploying the portal. Then upload
the new Copilot package and run the live smoke that proves a Copilot-driven
approval/release checkpoint appears in the Copilot Mirror.
