# Signal Foundry — Demo Video Production Prompt (9.9+)

Goal: a 2:00 (hard max) side-by-side demo that wins the Microsoft Agents League
**Enterprise** track, with a Reasoning-track angle. Everything below is real and
already captured tonight — this is a recording/edit brief, not a fabrication.
A silent reference cut exists at
`evidence/videos/signal-foundry-demo-side-by-side-1080p.mp4`; this prompt adds
narration, live screen capture, and polish.

## Format and layout

- 1920x1080, 30fps, H.264, captions burned in (judges often watch muted).
- **Persistent split layout for the demo body:** LEFT pane = Microsoft 365
  Copilot Chat (the Signal Foundry agent); RIGHT pane = the Foundry Floor portal
  (`https://red-coast-0b0c14e0f.7.azurestaticapps.net`). A thin label sits atop
  each pane: "Microsoft 365 Copilot Chat" / "Signal Foundry — Foundry Floor".
- The point of the split, stated once on screen and once in VO: **the
  conversation happens where work happens (Copilot); the governance happens on
  the Foundry Floor — same correlation ID linking both.**
- Brand cover (`docs/submission/signal-foundry-cover.png`) for the title; light
  cover for the end card. Palette: graphite, electric teal, amber.

## Voice direction (human, not robotic)

- One narrator, warm and confident — a senior enterprise architect explaining
  something they're proud of, not an ad read. Conversational pacing, ~150 wpm,
  natural micro-pauses at em-dashes, slight downward inflection on the proof
  points ("...and the gate wins.").
- If using a TTS engine: pick a premium neural voice (e.g. ElevenLabs
  "Adam"/"Rachel" at stability ~0.45, similarity ~0.8, style ~0.3; or Azure
  Neural `en-US-AndrewMultilingualNeural` / `en-US-AvaNeural` with `<prosody
  rate="-4%">` and `<break time="250ms"/>` at each em-dash). Avoid default
  cadence — add SSML breaks and let numbers breathe.
- No background music under narration louder than -22 LUFS; a soft graphite
  pad is fine. Duck to silence on the two "money" beats (advisory arbitration,
  the released packet).

## The narration script (timed to 2:00)

> **[0:00–0:09 · Title card — forge cover]**
> "Every enterprise is about to face the same flood — hundreds of employee AI
> ideas, and no governed way to ship them. Signal Foundry is the layer that
> turns that flood into approved, auditable Copilot workflows."

> **[0:09–0:32 · Split: Copilot left, portal Discover/Atlas right]**
> "It starts in Microsoft 365 Copilot Chat. I ask for governed ideas for my
> role — and it's grounded in my real work context through Work IQ: my team, my
> meetings — summaries only, never raw content. On the right, the Foundry Floor
> shows those same signals flowing through the forge in real time."

> **[0:32–0:52 · Copilot: propose + confirmation card; portal: capability appears]**
> "I propose a capability — an Incident Summarization Copilot. Watch the
> confirmation gate: nothing is written until I explicitly approve it. The
> moment I confirm, it lands in the governed registry with a correlation ID —
> and appears on the Foundry Floor instantly."

> **[0:52–1:14 · Copilot: risk-verdict Adaptive Card; portal: Risk Gate]**
> "Now the part that matters. A deterministic risk gate scores it — explainable,
> five required controls. And a live Azure AI Foundry model adds an advisory
> opinion. When they agree, you see it. When they'd disagree — the gate wins,
> and the disagreement is shown, never hidden. That's reasoning you can govern
> with."

> **[1:14–1:30 · Copilot: a monitoring request → refusal]**
> "Ask it to rank employees by productivity, and it refuses — by design. This
> governs AI adoption; it does not surveil people."

> **[1:30–1:48 · Copilot: approve + release packet card; portal: Review Queue → released]**
> "A human reviewer approves — no release without it. Signal Foundry seals an
> audit-safe release packet: owner, reviewer, controls, version, correlation ID.
> One human decision, fully traceable."

> **[1:48–2:00 · Portal: Judge Deck, then end card]**
> "Every claim, verified live against the registry — no hand-waving. Signal
> Foundry: raw signals, forged with intelligence, approved workflows."

## Shot list / capture notes

| Time | Left (Copilot) | Right (Portal) | Capture |
| --- | --- | --- | --- |
| Title | — | — | cover PNG + VO |
| 0:09 | Type role discovery prompt, recommendations render | Judge Mode story, click Advance through Discover→Propose | screen-record both live |
| 0:32 | "Propose Incident Summarization Copilot", confirmation card, confirm | Foundry Floor; selected capability detail | live |
| 0:52 | Risk-verdict Adaptive Card (deterministic + advisory agrees) | Risk Gate panel with advisory analysis | live; this is the hero shot — hold 3s |
| 1:14 | Boundary Check starter → refusal text | (hold portal) | live |
| 1:30 | "approve and release as v1.0.0", release-packet card with Open Foundry Floor | Review Queue → released; audit drawer open | live; click the card button to transition |
| 1:48 | — | Judge Deck scorecard, MCP healthy pill | live |
| End | — | — | light cover + brand line |

Real artifacts already captured for inserts if any live take fails: Copilot
screenshots in this session (proposal card, risk-verdict advisory card, release
packet card, refusal). The silent reference cut shows the exact portal motions.

## Capture mechanics (for the screen recording)

- Record Copilot in **Edge or the Teams desktop app** (the auth path that works
  — see `apps/copilot-agent/docs/entra-registration.md`), 1080p, hide bookmarks
  bar and personal tabs.
- Reset the demo first: `POST /admin/reset` as `actor-dana`, then re-run the
  golden flow so timestamps are fresh and the trail is clean. (Registry now
  persists across deploys, so the released capability and audit trail survive.)
- Record the portal separately at 960x1080 or capture full and crop; composite
  in the editor or reuse the ffmpeg hstack approach in `scripts/demo-capture.mjs`.
- Upload to YouTube (unlisted-but-public link is fine) and paste the URL into
  `docs/submission/SUBMISSION.md` and the Innovation Studios description.

## Why this wins Enterprise

Lead every beat with the governance proof, not the chrome: confirmation gate,
deterministic-gate-plus-advisory arbitration, anti-surveillance refusal, human
approval, audit-safe packet, live verification. Most entries demo a clever
agent; this demos the control plane every enterprise needs before it can let a
hundred agents loose — and proves it live, end to end, on the Microsoft stack.
