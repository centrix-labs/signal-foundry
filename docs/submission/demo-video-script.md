# Demo Video Script — 2:00 max

Format: screen recording with voiceover. Two surfaces side by side where noted:
Copilot Chat (or Copilot Mirror view if sideload capture is unavailable) and
Foundry Floor. No third-party trademarks beyond the Microsoft surfaces the
hackathon requires. Reset the golden scenario (`/admin/reset`) before recording
so every run is identical.

Framing rule for this cut: **lead with reasoning, close with the guarantee.**
The agent's multi-step deliberation is the star (Reasoning is 20% of the
rubric); the deterministic, byte-identical gate is the safety guarantee that
makes the reasoning governable (Reliability & Safety is another 20%). Do not
open by saying the gate "beats" or "overrides" the model — the model reasons,
the gate guarantees.

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0:00–0:10 | Title card: brand line over the Foundry Floor UI | "Enterprises are drowning in AI ideas and have no safe way to govern them. Signal Foundry gives you two things nothing else does at once: an AI that reasons about risk out loud — and a verdict that's identical whether that model is up or unplugged." |
| 0:10–0:26 | Copilot Chat: Priya asks for capabilities for her role; recommendations appear (Adaptive Cards) | "It starts in Microsoft 365 Copilot Chat. Employees discover governed workflows, grounded in permission-aware People and Meetings context — summaries only, never raw content." |
| 0:26–0:42 | Confirmation dialog → proposal created (receipt card); Foundry Floor list updates live | "Every write takes explicit confirmation, enforced in the schema, not just the prompt. The proposal lands in the registry with a correlation ID." |
| 0:42–1:08 | Risk Gate panel: the advisory deliberation animates step by step (signal → concern → suggested control), then the deterministic verdict lands; amber disagreement callout | "Now watch it reason. An Azure AI Foundry model works the proposal in five explainable steps — each step names the signal, the concern, and the control it would add. Then a deterministic gate issues the verdict of record. Here the model said medium; the gate ruled high. You see the disagreement — the model reasons, the gate guarantees." |
| 1:08–1:22 | Cut to terminal: run the suite, highlight `advisory.test.ts` → "never changes the deterministic verdict regardless of advisory outcome" passing; back to the gate | "And the guarantee is real. Unplug the model and the verdict is byte-identical — proven by this test, not promised on a slide." |
| 1:22–1:38 | Review Queue: Alex approves; release packet drawer opens (version, owner, reviewer, controls, correlation ID) | "Nothing ships without a human. The reviewer approves, and the release packet seals it: owner, reviewer, controls, audience, one correlation ID across the whole trail." |
| 1:38–1:50 | Copilot Chat: surveillance request ("rank my team by productivity") → refusal; MCP Activity Rail showing sanitized trail | "Ask it to monitor employees and it refuses — by design. Every action is in the sanitized audit trail." |
| 1:50–2:00 | Signal Atlas animation → end card with repo URL and live URLs | "Reasoning you can inspect, a verdict you can certify, approval you can't skip — deployed on Azure, tested end to end. Signal Foundry: raw signals, forged with intelligence, approved workflows." |

Capture notes:
- 1080p. Single light view (the dark/theme toggle has been removed).
- **The reasoning shot (0:42–1:08) is the most important frame in the video.**
  Let the five advisory steps land one at a time before the verdict appears;
  this is the Reasoning-rubric moment. Use the seeded proposal
  `prop-autonomous-renewal-outreach` (see
  apps/copilot-agent/docs/advisory-disagreement-demo.md), which produces the
  model-vs-gate disagreement. Requires advisory mode live.
- If advisory mode is unavailable at capture time, show the "advisory
  unavailable" fallback and change the 0:42 line to "the model reasons when
  it's available — and when it isn't, the deterministic gate stands alone,
  unchanged," then go straight to the test beat. The story survives intact.
- The test beat (1:08–1:22) runs `npm test --workspace @signal-foundry/mcp-server`
  (or the full `npm test`); pause on the named advisory equivalence test going
  green. This is the byte-identical proof — keep it on screen ~2 seconds.
- The refusal beat (1:38) is the Community-vote moment — make it crisp and
  screenshot-able for the Discord vote (10% of the score).
- If sideload is still blocked, use the Copilot Mirror view for chat shots and
  say "shown here through the governed mirror" — do not fake a Copilot surface.
- Upload to YouTube (unlisted is acceptable if the link is public), then paste
  the URL into SUBMISSION.md and the Innovation Studios description field.
