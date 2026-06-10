# Signal Foundry Validation

## End-to-end golden flow (Playwright)

`tests/e2e/golden-flow.spec.ts` boots the MCP server (advisory mode off) and the
Foundry Floor dev server, resets the registry, drives
propose → score → submit → approve → release over HTTP, and asserts the released
state, MCP activity trail, advisory panel, and sanitized unauthorized rejection
in the UI.

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise run test:e2e
```

Requires Playwright browsers (`npx --prefix <repo> playwright install chromium`).
The suite is intentionally `retries: 0, workers: 1` — it must pass twice
consecutively from a fresh reset before any checkpoint claim. It is a separate
script and not part of `npm run validate`, so environments without browsers
stay green.

## Evidence validation

`tests/evidence-validation.test.ts` runs the judge evidence validator.

```bash
npm --prefix /Users/mattgraves/Development/hackathon-enterprise exec -- vitest run tests/evidence-validation.test.ts
```
