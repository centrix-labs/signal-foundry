# Demo Video Script — 2:00 max

Format: screen recording with voiceover. Two surfaces side by side where noted:
Copilot Chat (or Copilot Mirror view if sideload capture is unavailable) and
Foundry Floor. No third-party trademarks beyond the Microsoft surfaces the
hackathon requires. Reset the golden scenario (`/admin/reset`) before recording
so every run is identical.

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0:00–0:12 | Title card: brand line over the Foundry Floor dark UI | "This hackathon has 135 enterprise agent ideas. Every company will face that flood. Signal Foundry is how those ideas get governed — risk-scored, human-approved, and released as reusable Copilot workflows." |
| 0:12–0:30 | Copilot Chat: Priya asks for capabilities for her role; recommendations appear (Adaptive Cards) | "In Microsoft 365 Copilot Chat, employees discover governed workflows. Recommendations are grounded in permission-aware People and Meetings context — never raw content." |
| 0:30–0:48 | Confirmation dialog → proposal created (receipt card); Foundry Floor list updates live | "Every write needs explicit confirmation — enforced in the schema, not just the prompt. The proposal lands in the registry with a correlation ID." |
| 0:48–1:12 | Risk Gate panel: deterministic HIGH verdict, advisory analysis, amber arbitration callout | "Here's the differentiator. An Azure AI Foundry model reasons about the risk step by step. A deterministic gate decides. When they disagree — advisory said medium, the gate ruled high — you see it, and the gate wins. Reasoning with guardrails." |
| 1:12–1:30 | Review Queue: Alex approves; release packet drawer opens (version, owner, reviewer, controls, correlation ID) | "A human reviewer approves before anything ships. The release packet is audit-safe: owner, reviewer, controls, audience, correlation ID." |
| 1:30–1:45 | Copilot Chat: surveillance request ("rank my team by productivity") → refusal; MCP Activity Rail showing sanitized trail | "Ask it to monitor employees and it refuses — by design. Every action is in the sanitized audit trail." |
| 1:45–2:00 | Signal Atlas animation → end card with repo URL and live URLs | "Deterministic governance, advisory AI reasoning, human approval — deployed on Azure, tested end to end. Signal Foundry: raw signals, forged with intelligence, approved workflows." |

Capture notes:
- 1080p, dark theme for Floor shots, light executive view only if time allows.
- The arbitration shot uses the seeded proposal `prop-autonomous-renewal-outreach`
  (see apps/copilot-agent/docs/advisory-disagreement-demo.md). Requires advisory
  mode live; otherwise show the "advisory unavailable" state and adjust the line
  to "and when the model is down, the deterministic gate stands alone."
- If sideload is still blocked, use the Copilot Mirror view for chat shots and
  say "shown here through the governed mirror" — do not fake a Copilot surface.
- Upload to YouTube (unlisted is acceptable if the link is public), then paste
  the URL into SUBMISSION.md and the Innovation Studios description field.
