# Submission Checklist (Agents League)

| Requirement | Status | Where / action |
| --- | --- | --- |
| Working project with required tools | DONE | Live on Azure; `npm run validate` + `npm run test:e2e` green |
| Project description (problem, solution, AI value, tech) | DONE — paste it | docs/submission/SUBMISSION.md → Innovation Studios fields |
| Demo video ≤ 2:00 on YouTube/Vimeo | USER ACTION | Record per docs/submission/demo-video-script.md; existing `evidence/videos/signal-foundry-live-demo.webm` predates advisory/cards — re-record; add URL to SUBMISSION.md + project description |
| Public GitHub repository | USER ACTION | Remote: github.com/centrix-labs/signal-foundry. Confirm repo visibility is Public; push `claude/foundry-workiq-uplift` and merge to `main` so judges see the final state; paste URL in the Code Repository Link field |
| Architecture diagram | DONE | docs/submission/architecture.md (Mermaid renders on GitHub; also embedded in README) |
| Setup/usage/walkthrough instructions | DONE | docs/submission/JUDGE-GUIDE.md + README |
| Submitted on Innovation Studios before close | USER ACTION | Create/finalize project; tracks: Enterprise (primary) + Reasoning |
| All team members registered + added to project | USER ACTION | Max 5; originator accepts requests |

## Pre-publish scrub (before making the repo public)

- `npm run validate` green (includes no-raw-content evidence scan). DONE
- No `.env` files tracked: only `.env.example` with placeholders. VERIFY at push time (`git ls-files | grep -i env`)
- OAuth `reference_id` in action manifests is a vault reference, not a secret. OK
- Azure subscription ID appears in README/deploy docs — it is an identifier,
  not a credential; acceptable, but remove if the team prefers (`README.md`,
  `openspec/` docs).

## Track framing reminders

- Enterprise: lead with human-in-the-loop release governance + audit safety.
- Reasoning: lead with advisory deliberation vs deterministic arbitration
  (byte-identical outcomes with advisory on/off — tested, not claimed).
- Creative Apps requires GitHub Copilot-assisted development — claim only if true.
