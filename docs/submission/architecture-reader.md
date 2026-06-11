# Signal Foundry Architecture Reader

Signal Foundry is designed as a Copilot-first enterprise workflow governance system. The user starts in Microsoft 365 Copilot Chat, where the Signal Foundry declarative agent helps identify governed, role-relevant AI capabilities. When a user wants to move forward, the agent routes confirmed actions through an external MCP/API server rather than letting free-form model output become the source of truth.

The MCP/API control plane runs on Azure Container Apps and exposes validated tools for discovery, recommendation, proposal creation, deterministic risk scoring, review submission, approval, rejection, release, release-packet generation, capability mapping, and MCP activity inspection. Tool inputs and outputs are constrained with Zod schemas, and every mutation requires confirmation, actor context, tenant/project scope, idempotency, and a correlation ID.

The domain workflow centers on a durable capability registry. Ideas become proposal records, proposals receive deterministic risk scores, and release is blocked until a human reviewer approves the capability. Azure AI Foundry is included as a current advisory reasoning layer for rationale and evaluation wording, but it is deliberately non-authoritative. If advisory reasoning disagrees with the deterministic gate, the deterministic gate wins.

The Foundry Floor portal is hosted on Azure Static Web Apps and gives judges and reviewers a live view of the system. It includes the Foundry Floor command center, Copilot Mirror, Signal Atlas graph, Review Queue, Risk Gate, Release Packet drawer, MCP Activity trace, and Light Executive view. The portal reads from the live registry endpoint and shows the governed workflow lifecycle without exposing raw Microsoft 365 content.

Durable state and evidence are split by purpose. The synthetic demo registry can run locally with JSON/SQLite-style data, while the Azure target state mirrors registry records to Azure Table Storage. Key Vault protects secrets and configuration. Application Insights and Log Analytics capture sanitized operational telemetry. Release packets, MCP activity, risk reviews, review items, and audit events form the judge-visible evidence trail.

The most important design constraint is that Signal Foundry governs workflows, not people. It does not display raw Microsoft 365 content, secrets, tokens, or surveillance-style user activity. Prompt-injection-prone content and model output are treated as untrusted. Employee monitoring requests are blocked, mutations require confirmation, and every approved workflow is tied to an audit-safe release packet.

For hackathon review, the medium-depth diagram should be read left to right:

`Copilot request -> MCP tools -> Registry -> Risk Gate -> Human Review -> Release Packet -> Signal Atlas / Audit Trace`

This flow demonstrates the core value: Signal Foundry converts AI ideas into governed, reusable Copilot capabilities with clear evidence, safety controls, and enterprise-ready architecture.
