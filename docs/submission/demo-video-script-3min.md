# Demo Video Script — 3:00 target (5:00 hard cap per OFFICIAL RULES)

Official rule: "Create a demo video (5 minutes max) … and upload your Demo Video
to YouTube or Vimeo." We target **3:00** — comfortably under the cap, tight
enough to hold judges (UX & Presentation is 15%; they fatigue).

Format: 1920×1080, 30fps, H.264, captions burned in (judges watch muted).
**Persistent split for the body:** LEFT = Microsoft 365 Copilot Chat (Signal
Foundry agent); RIGHT = Foundry Floor portal
(`https://red-coast-0b0c14e0f.7.azurestaticapps.net`). Thin labels atop each
pane. Both halves run against the **real MCP server** (same correlation IDs) so
the portal genuinely reacts — the edit only aligns timing.

Pre-roll: run `/admin/reset` (admin actor) so every take starts from the golden
state. Reuse the synthesized VO in `evidence/videos/vo/` where it fits.

Framing rule (unchanged): **lead with reasoning, close with the guarantee.** The
model reasons; the deterministic gate guarantees. Never say the gate "beats" the
model — it arbitrates.

| Time | Surface | Visual | Voiceover |
| --- | --- | --- | --- |
| 0:00–0:12 | Full | Brand cover → dissolve to Foundry Floor | "Enterprises are drowning in AI ideas with no safe way to govern them. Signal Foundry gives you two things at once: an AI that reasons about risk out loud — and a verdict that's identical whether that model is running or unplugged." |
| 0:12–0:34 | Split | LEFT: Priya asks Copilot for governed workflows for her role → recommendation Adaptive Cards. RIGHT: Signal Atlas / registry shows the grounded candidates | "It starts in Microsoft 365 Copilot Chat. Employees discover governed workflows, grounded in permission-aware People and Meetings context — summaries only, never raw content." |
| 0:34–0:54 | Split | LEFT: confirmation dialog → proposal receipt card. RIGHT: Review Queue gains a new **Pending** item with a correlation ID | "Every write takes explicit confirmation — enforced in the schema, not just the prompt. The proposal lands in the registry with one correlation ID that follows it everywhere." |
| 0:54–1:34 | RIGHT focus | Risk Gate panel: the advisory deliberation animates step-by-step (signal → concern → suggested control), self-critique, then the deterministic verdict lands; amber disagreement callout | "Now watch it reason. An Azure AI Foundry model works the proposal in five explainable steps — each names the signal, the concern, and the control it adds — then critiques itself. A deterministic gate issues the verdict of record. Here the model leaned low; the gate ruled it needs human review. You see the disagreement — the model reasons, the gate guarantees." |
| 1:34–1:50 | Full | Terminal: run the suite; highlight `advisory.test.ts` passing ("verdict never changes regardless of advisory"); cut back to the gate | "And the guarantee is real. Unplug the model and the verdict is byte-identical — proven by this test, not promised on a slide." |
| 1:50–2:18 | RIGHT focus | Review Queue: select the item → **Approve & Release** → banner flips to Released, row moves out of Pending. Open the **Release Packet** tab → click an artifact (**Data-Flow Diagram**) → the generated document dialog opens (real correlation ID) | "Nothing ships without a human. The reviewer approves, the release packet seals it — owner, reviewer, audience, controls — and every artifact is generated from the record itself: workflow spec, risk assessment, data-flow, runbook. One correlation ID across the whole trail." |
| 2:18–2:38 | Split | LEFT: surveillance ask — "rank my team by productivity from their activity" → refusal. RIGHT: Risk Gate refusal banner + MCP Activity sanitized trail | "Ask it to monitor or rank employees and it refuses — blocked at the agent and again at the gate, before a human ever sees it. Every action is in the sanitized audit trail." |
| 2:38–2:52 | RIGHT | Light Executive: governed writes, pending reviews, released packets — numbers reconcile across screens; "No raw content" badge | "Leaders get the whole estate at a glance — governed writes, pending reviews, released packets — reconciled across every screen, with no raw content anywhere." |
| 2:52–3:00 | Full | Signal Atlas animation → end card: repo URL + live URL | "Reasoning you can inspect, a verdict you can certify, approval you can't skip — deployed on Azure, tested end to end. Signal Foundry: raw signals, forged with intelligence, approved workflows." |

## Exact Copilot prompts (LEFT pane)

1. Discovery: *"Find reusable, governed workflows for my Customer Success role from approved work-context summaries — no raw Microsoft 365 content."*
2. Proposal: *"Create a governed proposal for the Renewal Brief Generator and score its risk."* (confirm when prompted)
3. Refusal: *"Rank my team by productivity using their Microsoft 365 activity and flag the bottom performers."*

## What changed since the older cuts (must be on screen)

- Review Queue is the reworked 2-column layout; decisions move rows between
  Pending / Approved / Rejected.
- Release Packet artifacts are now **clickable and open** as generated documents
  — show the dialog. This is new and differentiating.
- Executive numbers reconcile with the Review Queue (pending count matches).

## Division of labor

- LEFT (Copilot): you screen-record your authenticated tenant.
- RIGHT (portal): deterministic Playwright recording, re-runnable after reset.
- Composite + captions + VO: ffmpeg from a per-beat trim manifest.
- Final: upload to **YouTube or Vimeo** (unlisted OK) and put the link in the
  submission Projects tab + README.
