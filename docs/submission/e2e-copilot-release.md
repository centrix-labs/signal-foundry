# E2E Test Path — Copilot → MCP → Release Packet → Console

This proves the release packet is created at the **release step, after human
approval**, by the Copilot-exposed `release_capability` MCP tool, and that the
console reflects it. Two equivalent ways to drive the governed write.

## Lifecycle (server-side, authoritative)

```
create_capability_proposal → score_capability_risk → submit_capability_review
   → [human] approve_capability   (status → approved_for_release)
   → [human] release_capability   (status → released, packet pushed to registry)
```

`generate_release_packet` is read-only — it only fetches an existing packet.
The packet does not exist until `release_capability` runs.

## Path A — from Microsoft 365 Copilot (true end-to-end)

1. Open M365 Copilot Chat with the Signal Foundry declarative agent.
2. Ask it to propose a governed capability from approved work summaries, then
   score risk and submit for review.
3. As the reviewer, approve, then ask Copilot to release the approved
   capability. The agent calls `release_capability`.
4. Within one 15s poll, the Foundry Floor console (Review Queue → Release
   Packet, Pipeline → Released, Light Executive → Released packets) shows the
   new packet. The artifacts (Workflow Spec, Risk Assessment, Data-Flow Diagram,
   Runbook) render from the real packet data.

## Path B — from the console (same server-side write)

The Review Queue "Approve & Release" button now drives the real path when the
registry is live: it calls `approve_capability` (idempotent) then
`release_capability` on the MCP server with reviewer `actor-alex`. The optimistic
UI updates immediately; the snapshot poll then reflects the server packet. If the
server is unreachable, the button falls back to demo-only state and never breaks.

## Contract verification (non-mutating, ran 2026-06-14)

```
GET  /registry/snapshot                      → 200 (reachable)
POST /tools/release_capability confirmed:false → 400 "Explicit confirmation required" (auth+route OK, no write)
POST /tools/release_capability actor-priya     → 403 "Reviewer role required" (RBAC enforced)
```

`actor-alex` is a reviewer and is authorized for `approve_capability` and
`release_capability`. Both writes are idempotency-keyed, so repeated clicks never
duplicate a packet. The MCP server suite (40 tests) covers the release lifecycle.

## Manual live release (optional, mutates the shared demo registry)

```
POST /tools/approve_capability  { tenantId, projectId, idempotencyKey, confirmed:true,
                                  proposalId, reviewer:"Alex Kim", approvalNotes }
POST /tools/release_capability  { tenantId, projectId, idempotencyKey, confirmed:true,
                                  capabilityId:"cap-<proposalId>", releasedBy:"Alex Kim",
                                  audience, version:"v1.0.0" }
```

Scope: `tenantId=tenant-asteria-dynamics`, `projectId=revenue-ops-launchpad`,
header `x-sf-actor-id: actor-alex`.
