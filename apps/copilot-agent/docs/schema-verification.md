# Schema Verification Log

Per the uplift prompt's doc freshness gate: Microsoft surface schema facts must be re-verified
against live Microsoft Learn pages before manifest or card edits, and any drift recorded here.

## 2026-06-10 — verified current

Fetched live from Microsoft Learn on 2026-06-10:

| Surface | Verified fact | Source |
| --- | --- | --- |
| API plugin manifest | Current schema `v2.4`; `response_semantics` supported since v2.1; `static_template` may be inline AC JSON or `{ "file": "./path.json" }` (v2.4+) | https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-manifest-2.4 |
| `response_semantics` | Fields: `data_path` (RFC 9535 JSONPath, required), `properties` (`title`, `subtitle`, `url`, `thumbnail_url`, `information_protection_label`, `template_selector`), `static_template` | same as above |
| Adaptive Cards | Examples use AC `1.5` + `$schema http://adaptivecards.io/schemas/adaptive-card.json`; template language `${...}`; one card per `data_path` match; `Action.OpenUrl` allowed (domain must be in app manifest `validDomains`); `Action.Execute` preview-only | https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api-plugin-adaptive-cards |
| Confirmation | `capabilities.confirmation` (`type` None/AdaptiveCard, `title`, `body`, `isNonConsequential`); OpenAPI override `x-openai-isConsequential` | https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/plugin-confirmation-prompts |
| Declarative agent | Current schema `v1.7` (`$schema` .../declarative-agent/v1.7/schema.json); `actions: [{ id, file }]`, 1-10 entries; repo manifests are v1.6 | https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.7 |
| Tooling | Agents Toolkit CLI `@microsoft/m365agentstoolkit-cli` (`atk validate`, `atk package`, `atk install`); `teamsapp` CLI deprecated | https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli |

UNCONFIRMED items (no official doc statement found; handle per the uplift prompt's fallbacks):

- `response_semantics` rendering for `RemoteMCPServer`-runtime functions (documented only for OpenApi
  runtime). Resolution: one-function in-tenant verification cycle; OpenApi action fallback.
- Hard size/element limits for cards in Copilot rendering (only responsive-design guidance published).
- `x-openai-isConsequential` vs `x-oai-isConsequential` spelling discrepancy between the schema page
  and the how-to page; using `x-openai-isConsequential` per the dedicated how-to page.

## Baseline (claude/foundry-workiq-uplift, 2026-06-10)

- `npm run validate` green end to end after fixing the stale `~/Documents` repo root in
  `scripts/validate-copilot-package.mjs` (repo moved to `~/Development`).
- Test floor: 24 (18 mcp-server, 6 shared). Evidence validator: 46 files, 4 scenarios.
  Copilot package validator: 6 files, 12 tools, hash `fd6248675f57...`.
