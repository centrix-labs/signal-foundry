# Architecture Cost Plan: Signal Foundry

## Cost Posture

Signal Foundry should be deployed as a low-cost hackathon architecture. The default deployment must favor consumption, scale-to-zero, synthetic data, small token budgets, and short log retention.

## Cost Guardrails

- Use Azure Container Apps consumption with `minReplicas=0` for the MCP server unless demo reliability requires a temporary warm replica.
- Use Azure Static Web Apps Free for the judge-facing frontend unless custom auth/private endpoint requirements force Standard.
- Use Azure Table Storage for the deployed registry MVP.
- Use Azure Container Registry Basic.
- Use Key Vault Standard.
- Keep Log Analytics ingestion below the free included amount where possible; log only audit-safe compact events.
- Use Azure AI Foundry / Azure OpenAI only for bounded tasks: capability recommendation, advisory risk rationale, release packet wording, and evaluation.
- Use low-cost models for most reasoning. Escalate to stronger models only for final demo-quality rationale or evaluation samples.
- Add max token limits, max eval dataset size, and per-run budget notes before running evaluations.
- Create an Azure Budget or manual cost alert before deployed demo usage begins.
- Delete or scale down resources after the hackathon if they are no longer needed.

## Suggested Hackathon Budget

Expected low-cost deployment, assuming low traffic and bounded Foundry usage:

| Component | Cost Posture | Expected Hackathon Cost |
| --- | --- | --- |
| Azure Container Apps MCP server | Consumption, scale-to-zero | Usually near $0 for tiny traffic; can rise if kept warm |
| Azure Static Web Apps | Free plan preferred | $0 |
| Azure Table Storage | Tiny synthetic registry | Less than $1 |
| Azure Container Registry | Basic registry unit plus image storage | About $5/month baseline while kept |
| Azure Key Vault | Standard operations | Pennies for hackathon usage |
| Log Analytics / Application Insights | Compact logs, low ingestion | Usually $0 if under included/free ingestion; otherwise per GB |
| Azure AI Foundry / Azure OpenAI | Token-bounded pay-as-you-go | Usually less than $5 for demo-scale usage; budget cap recommended |

Practical estimate:

- One-week hackathon with scale-to-zero and light Foundry usage: **$5-$15**.
- One-month retained demo environment: **$10-$40**.
- Warm containers, verbose telemetry, heavy evaluations, or stronger models can push this higher.

## Cost Risks

- Keeping Container Apps replicas warm.
- Verbose Application Insights logging.
- Large Azure AI Foundry evaluations.
- Using stronger models for every tool call instead of targeted calls.
- Forgetting to delete or pause resources after the event.
- Moving from Static Web Apps Free to Standard without needing it.

## Required Cost Evidence

Before final submission, capture or document:

- Azure resource list.
- Whether Container Apps is scale-to-zero.
- Current ACR tier.
- Logging retention and expected ingestion.
- Foundry model/evaluation budget assumption.
- Azure Budget or manual cost alert status.
- Post-hackathon cleanup command or manual cleanup checklist.
