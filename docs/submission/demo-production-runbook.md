# Signal Foundry — Demo Production Runbook (winning cut)

Validated against the live agent on 2026-06-14 (full lifecycle passed; release
fix confirmed). This is the build sheet for the final video.

- **Final:** 1920×1080, 30 fps, H.264, captions burned in, ElevenLabs VO. Target
  **3:00** (5:00 hard cap per OFFICIAL RULES).
- **Two source tracks:**
  - **Copilot (LEFT)** — you screen-record the browser window while I drive it.
  - **Foundry portal (RIGHT)** — I record deterministically via Playwright.
- **Edit style:** *hybrid*. Persistent side-by-side for cause→effect; the portal
  goes full-frame for the Risk Gate reasoning, the release artifacts, and the
  executive view (its strongest visuals).

---

## 1. Final cut — beat sheet (the target timeline)

| # | Time | Frame | On screen | VO (ElevenLabs) |
|---|------|-------|-----------|-----------------|
| 1 | 0:00–0:12 | Title | Brand cover → dissolve to portal | "Enterprises are drowning in AI ideas with no safe way to govern them. Signal Foundry gives you two things at once — an AI that reasons about risk out loud, and a verdict that's identical whether that model is running or unplugged." |
| 2 | 0:12–0:30 | SxS (Copilot focus) | Copilot: discovery prompt → proposal draft. **Work IQ toggle visible/ON.** | "It starts in Microsoft 365 Copilot Chat, grounded in permission-aware People and Meetings context through Work IQ — summaries only, never raw content." |
| 3 | 0:30–0:48 | SxS (Copilot focus) | "Yes, create the proposal" → **native Confirm card** (tenant, correlation ID, idempotency key) → Proposal Created ✅ | "Every write takes explicit confirmation — enforced in the schema, not just the prompt — and lands in the registry with one correlation ID." |
| 4 | 0:48–0:58 | Portal full | New proposal appears in the registry / Review Queue, same correlation ID | "The moment it's written, the governance surface sees it." |
| 5 | 0:58–1:34 | Portal full | **Risk Gate multi-step reasoning** animates: signal → concern → control, self-critique, then the deterministic verdict; advisory-vs-gate callout | "Now watch it reason. An Azure AI Foundry model works the proposal in explainable steps — each names a signal, a concern, and the control it adds — then a deterministic gate issues the verdict of record. The model reasons; the gate guarantees." |
| 6 | 1:34–1:48 | Terminal | `advisory.test.ts` passes — verdict unchanged with the model off | "And the guarantee is real. Unplug the model and the verdict is byte-identical — proven by test, not promised." |
| 7 | 1:48–2:06 | SxS (Copilot focus) | Copilot: approve → release → **Release Success + audit packet** (this is the path we fixed) | "Nothing ships without a human. The reviewer approves, and the capability releases with an audit-safe packet." |
| 8 | 2:06–2:32 | Portal full | Review Queue → Approve & Release → Released; open **Release Packet artifact** (Data-Flow Diagram dialog) | "Every release artifact is generated from the record itself — workflow spec, risk assessment, data-flow, runbook — one correlation ID across the whole trail." |
| 9 | 2:32–2:46 | SxS (Copilot focus) | Copilot: surveillance prompt → refusal | "Ask it to monitor or rank employees and it refuses — by design, before a human ever sees it." |
| 10 | 2:46–2:56 | Portal full | Light Executive: reconciled numbers, "No raw content" | "Leaders get the whole estate at a glance — reconciled across every screen, with no raw content anywhere." |
| 11 | 2:56–3:00 | Title | Signal Atlas → end card: repo + live URL | "Reasoning you can inspect, a verdict you can certify, approval you can't skip. Signal Foundry." |

Copilot owns beats 2, 3, 7, 9 (~70s of final). Portal owns 4, 5, 8, 10, 11.

---

## 2. Copilot raw capture — what I drive (one continuous take)

Pre-roll: I run `POST /admin/reset` as `actor-dana` so the registry is golden.
Window 1080×1040, **Work IQ ON**, Signal Foundry agent, fresh chat.

I drive these in order, holding ~3 s on each finished response. I post a **live
beat log with elapsed timestamps** in chat so the edit is frame-precise.

1. **[KEEP → beat 2]** Discovery prompt → proposal draft. Hold on the draft.
2. **[KEEP → beat 3]** "Yes, create the proposal" → click native **Confirm** → "Proposal Created ✅". Hold on the consent card *and* the result.
3. **[TRIM / speed-ramp]** "Yes, score the risk" → Confirm → verdict. (Needed to reach release; in the edit this becomes a 2× "through each governed gate" ramp, or is cut.)
4. **[TRIM / speed-ramp]** "Yes, submit for review" → Confirm → submitted.
5. **[TRIM]** "Yes, approve the capability" → Confirm → approved.
6. **[KEEP → beat 7]** "Yes, release the capability" → Confirm → **Release Success + packet**. Hold.
7. **[KEEP → beat 9]** New chat → surveillance prompt → refusal. Hold.

Capability name: "Customer Health Summary Brief" (clean post-reset). Total raw
≈ 4–5 min; final Copilot usage ≈ 70 s after trims.

**Trim map I will output:** `beat → [mm:ss start, mm:ss end]` for every KEEP, so
you (or I) cut exactly.

---

## 3. Portal raw capture — deterministic (I record via Playwright)

Recorded at 960×1080 against the deployed portal, re-runnable after reset so it
matches. Beats: 4 (proposal in Review Queue), 5 (Risk Gate reasoning animation —
the centerpiece, let it play fully), 8 (Approve & Release → Released → open the
Data-Flow Diagram artifact dialog), 10 (Light Executive), 11 (Signal Atlas).
I'll deliver this as a clean MP4 + a beat-timestamp list.

---

## 4. ElevenLabs VO script (record as one narration track)

Use a warm, confident senior-architect voice. ~155 words ≈ 3:00 with the holds.
Lines are beats 1→11 above, in order:

1. Enterprises are drowning in AI ideas with no safe way to govern them. Signal Foundry gives you two things at once — an AI that reasons about risk out loud, and a verdict that's identical whether that model is running or unplugged.
2. It starts in Microsoft 365 Copilot Chat, grounded in permission-aware People and Meetings context through Work IQ — summaries only, never raw content.
3. Every write takes explicit confirmation — enforced in the schema, not just the prompt — and lands in the registry with one correlation ID.
4. The moment it's written, the governance surface sees it.
5. Now watch it reason. An Azure AI Foundry model works the proposal in explainable steps — each names a signal, a concern, and the control it adds — then a deterministic gate issues the verdict of record. The model reasons; the gate guarantees.
6. And the guarantee is real. Unplug the model and the verdict is byte-identical — proven by test, not promised.
7. Nothing ships without a human. The reviewer approves, and the capability releases with an audit-safe packet.
8. Every release artifact is generated from the record itself — workflow spec, risk assessment, data-flow, runbook — one correlation ID across the whole trail.
9. Ask it to monitor or rank employees and it refuses — by design, before a human ever sees it.
10. Leaders get the whole estate at a glance — reconciled across every screen, with no raw content anywhere.
11. Reasoning you can inspect, a verdict you can certify, approval you can't skip. Signal Foundry.

---

## 5. Assembly (ffmpeg)

1. **Trim** each KEEP segment from the two raw tracks per the manifest.
2. **Side-by-side beats** (2,3,7,9): scale Copilot→960×1080, portal→960×1080, `hstack`; add thin top labels "Microsoft 365 Copilot Chat" / "Signal Foundry — Foundry Floor".
3. **Full-frame beats** (4,5,8,10,11): portal scaled to 1920×1080 (pad if needed).
4. **Concatenate** all beats in order; add the title/end cards.
5. **Captions** burned in (judges watch muted) from the VO lines.
6. **Mux** the ElevenLabs VO track; duck nothing (no music required, or a soft bed).
7. Export H.264, 1080p30. Upload to **YouTube/Vimeo (unlisted)**; link it in the Projects tab + README.

A `make-demo` ffmpeg script will be generated once both raw tracks + the VO file
exist; it reads the trim manifest so re-cuts are one command.

---

## 6. Recording protocol (start / stop cues)

When you're ready:
1. Tell me **"reset"** (I run the golden reset) or **"keep"**.
2. Arm QuickTime on the **Copilot browser window** (bring it to the foreground; 1080×1040). Silence notifications.
3. Hit **Record**, then type **"rolling"** in chat.
4. I immediately drive the take and post the live beat log. I hold on each key frame.
5. When the refusal beat lands, I post **"⏹ STOP RECORDING NOW."**
6. Stop QuickTime, save the file, and tell me the filename/path (or just the duration). I'll produce the trim manifest + record the portal track + assemble.

Dead air at the head/tail is fine — it's trimmed.
