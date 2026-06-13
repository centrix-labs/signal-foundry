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

## Scorecard — exceed / meet / lack

Honest per-dimension read against the verified rubric. Estimates are deliberately
conservative — what a tough judge actually assigns, not what we'd hope for.

| Dimension (weight) | Estimate | Read |
| --- | --- | --- |
| Reliability & Safety (20) | ~18/20 | Crown jewel. Byte-identical verdict model-on/off, schema-enforced data boundary, anti-surveillance refusal. Near-max. |
| UX & Presentation (15) | ~13/15 | Now a real strength after this session — Judge Mode, Architecture view, walkthrough, live Atlas. Most governance entries are console-only. |
| Accuracy & Relevance (20) | ~16/20 | Deployed, grounded, summary-only, 83 tests, passes all 57 Toolkit rules. Strong, not differentiated. |
| Creativity & Originality (15) | ~11/15 | The two novel properties are real, but the "governance layer" headline blurs with siblings. |
| Reasoning & Multi-step (20) | ~13/20 | Biggest gap relative to weight. Reasoning is a 5-step advisory chain that is advisory and overrideable; the gate is a weighted sum. Now better framed, still the soft spot. |
| Community vote (10) | ~5/10 | Abstract problem. Hard to make a Discord crowd cheer for a release packet. Underinvested. |

**Net: solidly top-25%, knocking on top-10%. The build is winning-caliber; the
score is gated by Reasoning (20%) and Community (10%).**

**Exceed** (where we beat named competitors):

- **Reliability/Safety** beats Crucible — their GO/REVISE/KILL is LLM-generated,
  non-deterministic; ours is byte-identical, test-proven.
- **Structural data boundary by Zod contract** beats the Foundry-IQ grounding
  pack and the compliance officers who only read content.
- **Demonstrated audit fidelity** beats Governed Release Copilot's claim.
- **UX/Presentation now exceeds the category** — Architecture view, walkthrough,
  live blocked node.
- **Anti-surveillance refusal** as a designed boundary.

**Meet** (table stakes, ~0 marginal score):

- Human-in-the-loop approval.
- Cited / grounded / no-hallucination.
- Uses Azure AI Foundry.
- Risk scoring.
- Audit trail / correlation IDs.
- "We built an MCP server."

**Lack** (where rivals land harder):

- **Reasoning depth / perception** — Crucible and Clarity Ops land harder on the
  20% line; ours is single-pass and subordinate to the gate.
- **Community vote** — security entries have visceral "stopped a breach" punch.
- **Positioning collision** with Governed Release Copilot.

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
  table). This is cheap points on the 15% UX line. (Now significantly stronger —
  this session shipped a tiered Architecture view with hover-traced 90°
  connectors, a first-run spotlight walkthrough, and a live Atlas that renders
  Copilot-created proposals including a blocked "Employee Monitoring" node. UX is
  now a category-exceeding strength — see Scorecard.)

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
  Foundry makes it the understudy. Same capability, worse staging. (Now partly
  addressed in docs — SUBMISSION.md, the video script, and JUDGE-GUIDE.md have
  been reframed to LEAD with the 5-step advisory reasoning and position the
  deterministic gate as the guarantee. Still pending in the video itself — see
  Scorecard.)

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
  capability gap. (Now partly addressed — the differentiation has been pulled to
  the front of SUBMISSION.md and JUDGE-GUIDE.md; the collision still needs an
  explicit one-sentence pre-empt in the video — see Scorecard and §5.)

- **Self-inflicted: the reasoning floor.** `risk.ts` is a transparent weighted
  sum any judge can read in 20 seconds. That's a *virtue* for explainability and
  Safety, but if a judge equates "reasoning" with model sophistication and you've
  told them the model doesn't matter, you can score *low* on the 20% Reasoning
  line despite having a defensible architecture. The risk is the judge's mental
  model, and you've handed them the wrong one.

---

## 5. The winning-move refinements (prioritized, max 8)

Split into two passes: closing the remaining rubric gaps to reach 100% of the
score this build can earn, then the moves that push the entry to *exceed* its
category. The docs-side reframing is largely done this session; the highest-ROI
gap left is the video. Each item is tagged with the rubric line it moves.

### To 100% — close the gaps

1. **Make the 5-step reasoning visible and the star in the demo. [Reasoning,
   biggest lever].** The docs now lead with it; the video must too — let the five
   signal → concern → control steps land one at a time before the gate verdict.
   Single highest-ROI action left. (Script already rewritten for this.)

2. **Add one genuinely iterative reasoning beat — only if tested.** A generate →
   self-critique → revise control pass on the advisory path turns "single-pass
   advisory" into "multi-step reasoning" literally. High rubric value, real risk
   to a stable demo 24h out — only if #1 is already recorded.

3. **Engineer the Community moment. [10%].** You now have it for free: the
   blocked red node on the live Atlas + the "unplug the model, same verdict" beat.
   Make both screenshot-able and post them in the Discord vote thread.

4. **Cut table-stakes language from the top of every surface; lead with the two
   unique properties.** (Done in SUBMISSION.md — mirror it in the Innovation
   Studios description field.)

### To exceed — win the category

5. **Re-cut the 2-min video to the new script.** Nothing moves more points. The
   build is already strong enough; the submission is scored by its framing.

6. **One quotable on-screen line:** *"Unplug the model. Same verdict. Proven by
   test, not promised."* — with the test going green for 2 seconds.

7. **Pre-empt the collision in one sentence** (in the video and description):
   name that governed-release tools promise audit and adversarial agents reason
   non-deterministically — and you're the only one with both inspectable reasoning
   and a deterministic verdict.

8. **Lean the Architecture view + walkthrough into the demo as proof of
   Presentation polish.** A 5-second hover-trace of the architecture reads as
   "production system," not "hackathon script."

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
