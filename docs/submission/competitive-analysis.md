# Signal Foundry — Competitive Analysis (Enterprise Agents, Agents League 2026)

Written as a blunt hackathon judge would score it. No flattery. The scorecard
lens drives everything below.

**Official 2026 rubric (verified):** Accuracy & Relevance 20% · Reasoning &
Multi-step Thinking 20% · Creativity & Originality 15% · UX & Presentation 15% ·
Reliability & Safety 20% · Community vote (Discord) 10%. Submission closes
**June 14, 2026, 11:59 PM PT** — roughly 24 hours from now.

Note one thing up front: the rubric does NOT have a "use of Microsoft tech" or
"business impact" line item the way the brief assumed. **40% of the score is
Reasoning + Reliability/Safety.** That is enormously good news for Signal
Foundry, and it should reshape the entire submission narrative. More below.

---

## 1. Verdict

**Top 25%, fighting for top 10%, but currently leaving points on the table in
the two categories it should dominate.** Signal Foundry is a genuinely complete,
deployed, test-backed system with a sharp thesis (governed path from AI idea to
released capability) and the single best Reliability & Safety story in its
overlap cluster — the deterministic gate that produces byte-identical outcomes
with the model on or off is a real, demonstrable, test-enforced safety property
that almost no competitor can match. That is 20% of the score nearly maxed.
The problem: the actual "reasoning" is a 30-line weighted-sum scorecard
(`apps/mcp-server/src/risk.ts`), and the LLM is explicitly *advisory and
overrideable*. In a contest where **Reasoning & Multi-step Thinking is 20% and
literally the name of a sibling track**, leading with "our deterministic gate
beats the model" can read to a tired judge as "we don't really do AI reasoning."
That is the gap between top-25% and winning. The build is there. The framing
actively undersells the half of the rubric it could win. Fix the framing in the
next 24 hours and this is a top-10% submission; ship it as-is and it's a strong-
but-not-winning governance entry that blurs into Governed Release Copilot and
the compliance-officer pack.

---

## 2. Where Signal Foundry is genuinely ahead

These are defensible, and most map directly to **Reliability & Safety (20%)**.

- **Byte-identical deterministic outcomes, advisory-on vs advisory-off, proven
  by test — not claimed.** This is the crown jewel. `risk.ts` is pure and
  deterministic; the advisory path (`advisory.ts`) degrades to
  `{status: "unavailable"}` on timeout/error/retry-exhaustion and can never move
  the verdict. Most competitors' "human approval" is a UI button in front of a
  model that's still the decision-maker. Signal Foundry's decision authority is
  provably *not* the model. **Beats Crucible** directly: Crucible's GO/REVISE/KILL
  verdict is LLM-generated, so it inherits non-determinism and hallucination risk
  at the exact moment it claims authority. Signal Foundry can say "run it with the
  GPU unplugged, same verdict, here's the test." Crucible cannot.

- **Structural data boundary, not a policy promise.** Raw M365 content never
  reaches the MCP server *by schema contract* — length-capped, summary-only,
  Zod-enforced, with an evidence scan in `npm run validate` that fails the build
  if raw content leaks. **Beats the entire Foundry-IQ-grounding pack** (ChiefIQ,
  BrieflyAI, ClarityOps, PHOENIX IQ) and the compliance officers (Aegis, DORA,
  Policy/Control Tower Sentinel), who all *read* enterprise content to function
  and can only assert they handle it responsibly. Signal Foundry's safety is an
  architectural invariant, which is a categorically stronger claim to a judge
  scoring 20% on Reliability & Safety.

- **Anti-surveillance refusal as a designed boundary.** The agent refuses
  employee-ranking / monitoring / productivity-scoring by instruction
  (`safety-boundaries.md`, declarative-agent manifest). This is a Responsible-AI
  layup that the decision-intelligence and "score the worker" adjacent entries
  walk right into. It's a differentiated, demoable "watch it say no" moment.

- **Audit correlation end-to-end + release packet.** Every action carries a
  correlation ID; release produces a packet (owner, reviewer, controls, audience,
  artifacts) and the MCP Activity Rail shows sanitized events including a
  *rejected* unauthorized 403. **Beats Governed Release Copilot** on
  *demonstrated* audit fidelity — GRC's tagline ("evidence in, approval enforced")
  is a claim; Signal Foundry shows the replayable, sanitized trail with a live
  rejection. The 403-with-no-stack-trace demo is a concrete safety artifact.

- **It's actually deployed and shippable, not a prototype.** Live Azure URLs,
  sideload-ready Copilot package (passes all 57 Agents Toolkit validation rules),
  83 tests, Playwright golden flow, Adaptive Cards inline. This lifts **Accuracy
  & Relevance (20%)** and **UX & Presentation (15%)**: "meets challenge
  requirements, demo-able, polished" is hard to argue against when the thing is
  live and validated. Many of the 297 will be local-only or storyboarded.

- **The Foundry Floor / Judge Mode UX is a real edge on Presentation.** A
  purpose-built judge surface that walks Discover→Propose→Score→Review→Release in
  one screen, with Signal Atlas visualization, is above the median polish for an
  enterprise governance entry (which usually demos as a chat transcript + a
  table). This is cheap points on the 15% UX line.

---

## 3. Where it's at parity / undifferentiated (table stakes — scores ~0 marginal)

Be honest: these are shared with 50+ entries and a judge has seen them 40 times
by the time they reach yours. Stating them prominently *wastes* demo seconds.

- **"Human-in-the-loop approval before action."** Everyone says this. Aegis,
  DORA, Governed Release Copilot, every SOC L2 agent. Table stakes.
- **"Cited, grounded, no hallucination."** Said by the entire Foundry IQ / Work
  IQ / Fabric IQ grounding pack. The grounding itself is table stakes.
- **"Uses Azure AI Foundry / Azure OpenAI."** It's in the track name. Using it is
  the entry fee, not a differentiator. Note the *advisory* model is a thin single
  chat-completion call with JSON mode — fine, but not technically novel.
- **"Risk scoring."** Crucible, the compliance pack, and several SOC entries all
  score risk. The *weighted-sum* scorer is the least impressive part of the
  codebase; do not let a judge linger on `risk.ts` expecting sophistication.
- **"Audit trail / correlation IDs."** Common in the compliance and IT-ops
  clusters. Signal Foundry's is *better executed*, but the concept earns nothing.
- **MCP server.** Increasingly common. The 13 governed tools with Zod contracts
  and idempotency is *solid engineering* and supports Reliability, but "we built
  an MCP server" is no longer a headline.

The takeaway: **roughly half of the current SUBMISSION.md description is spent on
table stakes.** Every sentence a judge spends on human-approval and grounding is
a sentence not spent on the byte-identical-fallback proof or the multi-step
deliberation. That's a positioning leak, not a build problem.

---

## 4. Where it's behind / at risk

Name the scarier competitors and why they out-score on specific rubric lines.

- **Crucible (Reasoning 20% + Creativity 15%).** This is the most dangerous
  single competitor for the rubric that actually matters. "Adversarial decision-
  quality agent, GO/REVISE/KILL with cited objections" is a *visceral,
  multi-step-reasoning* story that lands directly on the 20% Reasoning line and
  the 15% Creativity line. Signal Foundry's reasoning, by its own framing, is
  *deliberately subordinate* to a rule engine. Against a reasoning-forward
  rubric, Crucible's pitch is simply more on-theme. Signal Foundry wins on
  Safety; Crucible wins on Reasoning + Creativity. That's a 35%-vs-20% trade if
  Signal Foundry doesn't fix its reasoning narrative.

- **Clarity Ops Agent (Reasoning 20% + Presentation 15%).** "Streams live Azure
  AI Foundry reasoning over Work IQ, surfaces launch risk" is a *live, visible
  multi-step reasoning* demo — exactly what "Reasoning & Multi-step Thinking"
  rewards. Signal Foundry *has* a multi-step advisory deliberation
  (signal→concern→suggestedControl, up to 5 steps) but currently *buries it* as
  the loser in an arbitration. Clarity Ops makes reasoning the star; Signal
  Foundry makes it the understudy. Same capability, worse staging.

- **The deep-tooling security pack — Autonomous SOC L2, AttackGraph AI, MSP
  Operations Commander, The Threat Whisperer (Reasoning + Accuracy + visceral
  impact).** These have broader scope, deeper tool graphs, and a more visceral
  "stopped a breach" business punch. A judge feeling business impact (even though
  it's not an explicit line, it colors Accuracy & Relevance and the Community
  vote) may rate "autonomously triaged a live attack" above "governed an internal
  AI-idea backlog." Signal Foundry's problem (shadow AI governance) is *real but
  abstract*; theirs is *concrete and scary*. Harder to make a Discord crowd cheer
  for a release packet than for a thwarted attack — that's a **Community vote
  (10%)** risk.

- **Governed Release Copilot (direct positioning collision).** Nearly identical
  governance framing. If a judge sees GRC first, Signal Foundry risks reading as
  "the same idea." The differentiation (byte-identical fallback, structural data
  boundary, anti-surveillance) is real but *not currently the headline* — so the
  collision is more dangerous than it should be. This is a framing risk, not a
  capability gap.

- **Self-inflicted: the reasoning floor.** `risk.ts` is a transparent weighted
  sum any judge can read in 20 seconds. That's a *virtue* for explainability and
  Safety, but if a judge equates "reasoning" with model sophistication and you've
  told them the model doesn't matter, you can score *low* on the 20% Reasoning
  line despite having a defensible architecture. The risk is the judge's mental
  model, and you've handed them the wrong one.

---

## 5. The winning-move refinements (prioritized, max 8)

Split into cheap framing fixes (do all of these in the next 24h) and expensive
build (probably skip given the deadline). Each tagged with the rubric line it
moves.

### Narrative / positioning (cheap, high ROI — DO THESE)

1. **Re-stage the advisory deliberation as a STAR reasoning feature, not the
   loser of an arbitration. [Reasoning 20% — biggest single lever].**
   You already have multi-step deliberation (signal→concern→suggestedControl, ≤5
   steps). Lead the demo with it: "watch the agent reason through the proposal in
   five explainable steps." THEN reveal the gate as the safety backstop. Reframe
   from "the gate beats the model" to **"the model reasons, the gate guarantees
   — you get sophisticated reasoning AND a verdict you can trust when the model is
   wrong or down."** Same code, completely different scorecard impact. This is the
   #1 move because Reasoning is 20% and currently under-claimed.

2. **Make "advisory disagreement" a hero demo moment, not a footnote.
   [Reasoning 20% + Creativity 15%].** The seeded
   `prop-autonomous-renewal-outreach` case where the model and gate *disagree* is
   your most interesting reasoning artifact — it's literally "multi-step thinking
   that the system then adjudicates." This is more on-theme than Crucible's single
   verdict because you show *both* the reasoning and the governance resolving it.
   Put it at 0:45 in the 2-minute video.

3. **Cut table-stakes language from the top of every surface.
   [Accuracy/Relevance 20% + Presentation 15%].** In SUBMISSION.md and the video,
   demote "human-in-the-loop," "grounded/cited," "audit trail," "we built an MCP
   server." Open with the two things only you have: byte-identical fallback and
   the structural (schema-enforced) data boundary. First 10 seconds decide your
   score; don't spend them on what 50 others also say.

4. **Name the byte-identical property in one quotable line and put it on screen.
   [Reliability & Safety 20%].** e.g. *"Unplug the model. Same verdict. Proven by
   test, not promised."* Show the test passing on screen for two seconds. This is
   the single most differentiating, hardest-to-fake claim you own — make it
   impossible to miss.

5. **Pre-empt the Crucible / Governed Release Copilot collision explicitly.
   [Creativity 15% + Accuracy 20%].** One slide or one sentence:
   *"Unlike LLM-verdict tools, our authority is deterministic and provable;
   unlike approval-workflow tools, our data boundary is a schema contract, not a
   policy."* Judges compare adjacent entries; control the comparison before they
   make it for you.

6. **Engineer one Community-vote-friendly moment. [Community vote 10%].** The
   crowd won't cheer for a release packet. They *will* cheer for the agent
   visibly *refusing* a creepy "rank my employees by responsiveness" request, or
   for "unplug the model, verdict unchanged." Script one shareable, screenshot-
   able beat for Discord. 10% is decided by vibes; manufacture the vibe.

### Build more (expensive — only if you somehow have hours to spare; otherwise SKIP)

7. **Add ONE genuinely multi-step reasoning behavior to the advisory path.
   [Reasoning 20%].** Right now it's a single chat-completion. If — and only if —
   time allows, make it visibly iterate (e.g., generate concerns → self-critique
   the highest concern → propose a control), so "multi-step thinking" is literally
   true at the agent level, not just structurally in the output JSON. High rubric
   value, but real risk of breaking a stable demo 24h out. **Recommend NOT doing
   this unless the framing fixes are already done and tested.**

8. **Tighten the deterministic scorer's story (do not rewrite the code).
   [Reasoning 20% defense].** Don't touch `risk.ts` — it works and it's safe. But
   add one line in the JUDGE-GUIDE explaining *why* deterministic-and-simple is a
   deliberate engineering choice ("auditable, regulator-explainable, immune to
   prompt injection"), so a judge reading the code sees intent, not a thin
   feature. Pure documentation; near-zero risk.

---

## 6. The single biggest risk, and the single highest-leverage action

**Biggest risk:** *Self-sabotaging the Reasoning score (20% of the rubric) by
framing the system as "the deterministic gate beats / overrides the AI."* The
contest literally has a Reasoning track and a 20% multi-step-thinking line.
Signal Foundry's current narrative tells judges its AI reasoning is subordinate
and disposable — which is a brilliant *safety* posture and a *terrible* thing to
say to someone scoring you on reasoning. Combined with a `risk.ts` that's a
visibly trivial weighted sum, a judge can rationally conclude "great governance,
not much agent" and park you in the top 25% instead of the top 10%. That single
mental model is the difference between placing and winning.

**Highest-leverage action before close:** *Re-cut the 2-minute video and rewrite
the top third of SUBMISSION.md to lead with the multi-step advisory deliberation
as the reasoning star and the byte-identical fallback as the safety guarantee —
in that order.* No code changes, ~2-3 hours, and it directly lifts the two
biggest rubric lines (Reasoning 20% + Reliability/Safety 20% = 40% of the score)
while de-risking the Crucible/GRC collision. The build is already strong enough
to win; the submission is currently scored by its framing, and the framing is
costing you the exact 20% you're best positioned to take. Fix the words, not the
code.
