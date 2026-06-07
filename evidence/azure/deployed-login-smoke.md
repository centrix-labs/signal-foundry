# Deployed Login Smoke

Date: 2026-06-07

## Target

- Foundry Floor URL: `https://red-coast-0b0c14e0f.7.azurestaticapps.net`
- Deployment surface changed: Azure Static Web Apps frontend content only.

## Results

| Check | Result |
| --- | --- |
| Login page loads | Pass |
| Background asset `/login-forge-bg.jpg` returns `200` | Pass |
| Launch Console opens Foundry Floor | Pass |
| Desktop screenshot captured | `evidence/screenshots/azure-login-page-desktop.png` |
| Mobile screenshot captured | `evidence/screenshots/azure-login-page-mobile.png` |

No credentials, tenant data, raw Microsoft 365 content, or secrets were used for this smoke test.
