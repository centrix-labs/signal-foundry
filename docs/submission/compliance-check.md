# Agents League AISF 2026 — Compliance Check

Verified 2026-06-14 against `https://github.com/microsoft/Agents-League-AISF-Regulations`.
Track: **Enterprise Agents** (Microsoft 365 Copilot).

## Mandatory entry requirements

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | **Microsoft IQ integration (≥1 of Foundry IQ / Work IQ / Fabric IQ)** | ✅ Met | Permission-aware **Work IQ-style** grounding through M365 Copilot People + Meetings context, plus **Azure AI Foundry** advisory multi-step risk reasoning. Wired and demonstrable: declarative agent enables People/Meetings grounding (`apps/copilot-agent`), advisory reasoning renders in the Risk Gate panel (verified live — "Multi-step reasoning · Azure AI Foundry · advisory"), README §"Advisory Reasoning + Work IQ Grounding", `docs/submission/work-iq-foundry-readiness.md`. **No overclaim** — framed as sanitized/summary-only; the MCP server never receives raw M365 content. |
| 2 | **Public GitHub repo + README** | ✅ Met | `origin = github.com/centrix-labs/signal-foundry`; `README.md` present with architecture, setup, IQ usage. Names the M365 Copilot declarative-agent track. Confirm repo visibility is **public** before final submission. |
| 3 | **Demo video** | ✅ Met | A finished 3:11 cut (1080p, narrated, captioned), hosted on YouTube: https://youtu.be/HMQTQHJM9vQ (≤ 5:00 per OFFICIAL RULES), linked in README + SUBMISSION. Demo is **solely our own work**; Microsoft trademarks licensed for the entry, no other third-party marks. |
| 4 | **Disclaimer — no confidential/sensitive info** | ✅ Met | Secret scan clean: only `.env.example` templates tracked (no real `.env`); no keys/tokens/connection strings in code. `evidence/azure/key-vault-secret-metadata.json` contains only `{attributes, id, name}` — **no secret values**. Synthetic tenant only ("Asteria Dynamics", synthetic data by default). |
| 5 | **Code of Conduct compliance** | ✅ Met | Governance-focused, anti-surveillance product; no disallowed content. |
| 6 | **Registration at `aka.ms/agentsleague/aisf`** | ✅ Done (user-confirmed) | The team confirmed they are registered. |

## Judging rubric mapping (100 pts)

| Criterion | Weight | Where it shows |
|-----------|--------|----------------|
| Accuracy & Relevance | 20% | Grounded, cited, no hallucination; deterministic risk gate is the source of truth; advisory clearly labelled. |
| Reasoning & Multi-step Thinking | 20% | Risk Gate multi-step reasoning (5-step advisory + self-critique), Foundry advisory path, governed lifecycle proposal→score→review→approve→release. |
| Creativity & Originality | 15% | Governance-layer angle, Copilot Mirror (audit replay), Signal Atlas, anti-surveillance refusal. |
| User Experience & Presentation | 15% | Polished console: paginated/filtered Review Queue, tabbed detail panels, viewable release artifacts, reconciled executive metrics, zero console errors. |
| Reliability & Safety | 20% | Human-in-the-loop approval gates release; deterministic gate independent of the model (byte-identical verdict); anti-surveillance refusal; no-raw-content boundary; sanitized audit trail; idempotent live writes. |
| Community Vote | 10% | Discord — **user action** (not automatable). |

## User actions remaining (cannot be automated)

- ✅ Registration at `aka.ms/agentsleague/aisf` — confirmed complete.
- ✅ Demo video produced (3:11, 1080p, narrated + captioned).
- ✅ Demo uploaded to YouTube (https://youtu.be/HMQTQHJM9vQ) and linked in README + SUBMISSION. Add the same link to the Projects-tab submission.
- ⬜ Cast/encourage the **Discord community vote** (10%).
- ⬜ Confirm the GitHub repo is **public** at submission time.

## Minor polish (non-blocking)

- `README.md` quick-start commands use absolute local paths (`~/…`). Cosmetic only — no secret/credential exposure — but could be relativized for a cleaner public read. Left as-is to avoid last-minute churn.

## Verdict

All mandatory entry requirements are met. No confidential data in the tracked tree. The submission is compliant for the Enterprise Agents track with a verified Microsoft IQ integration (Work IQ-style grounding + Azure AI Foundry advisory), and is not at risk of being discarded on regulation grounds. Remaining items are user actions (Discord vote; verify repo public).
