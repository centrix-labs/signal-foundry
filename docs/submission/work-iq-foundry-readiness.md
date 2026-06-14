# Work IQ And Foundry Readiness

This is the judge-safe proof map for the two highest-value Microsoft signals in
the submission: Work IQ-grounded discovery and Azure AI Foundry advisory
reasoning.

## What Is In Place

### Work IQ-grounded discovery

- The Copilot declarative agent enables People and Meetings grounding, with
  People related content disabled.
- Agent instructions require permission-aware Microsoft 365 Copilot/Work IQ
  summaries or synthetic Work IQ-style summaries only.
- The MCP server exposes `get_user_work_context` and
  `recommend_capabilities_for_role`.
- Runtime output returns sanitized role, title, department, team, source
  category, active project, recurring workflow, and recommended use-case areas.
- Raw emails, chats, transcripts, documents, secrets, customer records,
  employee monitoring data, and productivity scores are excluded by instruction,
  schema wording, runtime sanitization, and tests.

Claim this as: permission-aware Work IQ-style grounding through Microsoft 365
Copilot People and Meetings context.

Do not claim: direct raw Work IQ API ingestion or raw Microsoft Graph content
flowing into the MCP server.

### Azure AI Foundry advisory reasoning

- `SIGNAL_FOUNDRY_ADVISORY_MODE=foundry` enables the Azure AI Foundry /
  Azure OpenAI advisory path.
- The server calls the configured deployment with strict JSON response format.
- Advisory output is sanitized, capped, and stored beside the deterministic risk
  review.
- The deterministic risk gate remains authoritative. If the model is down,
  misconfigured, or disagrees, the gate still decides.
- Unit tests prove available advisory output, disagreement, agreement,
  sanitization, retry/degrade behavior, and deterministic isolation.
- The Foundry Floor renders advisory analysis when available and an explicit
  unavailable state when it is not.

Claim this as: Azure AI Foundry/Azure OpenAI advisory reasoning implemented as a
guardrailed reasoning layer.

Do not claim: live model output in a deployed recording until the Azure AI
Foundry resource is provisioned, environment variables are set, and the
advisory-disagreement demo is captured.

## Winning Demo Sequence

1. Open Microsoft 365 Copilot Chat with the Signal Foundry agent.
2. Use the `Presales Use Cases` starter. The agent should call
   `get_user_work_context`, then recommend governed use cases for a Presales
   Architect in Sales Engineering.
3. Pick one use case and ask the agent to draft the proposal. Confirm the write
   only after the agent names the tenant, project, expected write, and audit
   event.
4. Score risk. The Risk Gate should show deterministic verdict, required
   controls, and advisory state.
5. If live Foundry is configured, run the advisory disagreement scenario for
   `prop-autonomous-renewal-outreach`. The winning moment is: advisory reasoning
   is visible, but the deterministic gate wins.
6. Submit for human review, approve as the reviewer, release, then show the
   Release Packet and MCP Activity Rail correlation IDs in Foundry Floor.

## Configuration For Live Foundry

Preferred path: apply `infra/main.bicep` with
`infra/main.parameters.json`. It creates the Azure AI Foundry / Azure OpenAI
account, deploys the advisory model, grants the MCP Container App managed
identity the inference role, and sets the runtime environment variables.

Manual fallback: set these on the MCP server environment before claiming live
Azure AI Foundry output:

```bash
SIGNAL_FOUNDRY_ADVISORY_MODE=foundry
SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT=https://<resource-name>.openai.azure.com
SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT=<deployment-name>
SIGNAL_FOUNDRY_FOUNDRY_API_VERSION=<api-version>
SIGNAL_FOUNDRY_FOUNDRY_API_KEY=<optional-key-if-managed-identity-is-not-used>
```

If `SIGNAL_FOUNDRY_FOUNDRY_API_KEY` is omitted, the server uses
`DefaultAzureCredential` for `https://cognitiveservices.azure.com/.default`.

After setting the variables, follow
`apps/copilot-agent/docs/advisory-disagreement-demo.md` and capture the Risk Gate
showing advisory output. Without those variables, the honest demo line is:
`Advisory unavailable -- deterministic verdict stands.`

## Automated Readiness Gate

Run:

```bash
npm --prefix . run validate:workiq-foundry
```

This checks:

- Copilot People/Meetings grounding and Work IQ instruction boundaries.
- MCP Work IQ tools and runtime sanitization behavior.
- Azure AI Foundry advisory code path and tests.
- Azure AI Foundry subscription provisioning in Bicep.
- Foundry Floor advisory visibility.
- Submission honesty around live Foundry availability.
- Deployed smoke evidence for `get_user_work_context`.
