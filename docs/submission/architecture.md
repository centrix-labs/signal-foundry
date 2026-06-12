# Signal Foundry Architecture

```mermaid
flowchart LR
    subgraph M365["Microsoft 365 Copilot Chat"]
        DA["Signal Foundry declarative agent\nPeople + Meetings grounding (Work IQ)\nAdaptive Card responses\nconfirmation gates - anti-surveillance refusal"]
    end

    subgraph ACA["Azure Container Apps"]
        MCP["External MCP server (TypeScript)\n13 tools - Zod contracts\nJSON-RPC + REST - correlation IDs\nidempotency - sanitized errors"]
        GATE["Deterministic risk gate\nsource of truth"]
        ADV["Advisory reasoning client\n6s timeout - degrade to unavailable"]
    end

    subgraph FOUNDRY["Azure AI Foundry"]
        LLM["Azure OpenAI deployment\nmulti-step risk deliberation\nmax 800 output tokens/call"]
    end

    subgraph SWA["Azure Static Web Apps + Entra ID"]
        FLOOR["Foundry Floor command center\nSignal Atlas - Review Queue\nRisk Gate + advisory arbitration\nRelease Packets - MCP Activity Rail"]
    end

    subgraph DATA["State & telemetry"]
        REG["Synthetic registry (JSON)\nAzure Table Storage mirror"]
        KV["Azure Key Vault"]
        AI["Application Insights\nLog Analytics"]
    end

    USER["Employee / Reviewer"] -->|"discover - propose - confirm"| DA
    DA -->|"OAuth (Entra) - RemoteMCPServer action"| MCP
    MCP --> GATE
    GATE -->|"verdict + controls"| ADV
    ADV -->|"advisory only"| LLM
    LLM -->|"deliberation steps"| ADV
    ADV -->|"gate arbitrates disagreement"| MCP
    MCP --> REG
    MCP --> AI
    MCP -.->|"secrets via managed identity / KV refs"| KV
    REVIEWER["Human reviewer"] -->|"approve / reject / release"| FLOOR
    FLOOR -->|"/registry/snapshot (Entra-authenticated)"| MCP
```

## Trust boundaries

1. **Copilot surface → MCP server:** OAuth via Entra; only schema-validated,
   length-capped summary fields cross. Raw Microsoft 365 content stays inside
   the Copilot grounding boundary.
2. **Deterministic gate → advisory model:** the model receives only the
   proposal's synthetic fields and the gate's verdict; its output is sanitized,
   capped, and can never change a deterministic outcome (test-enforced).
3. **Release boundary:** no capability reaches `released` without an explicit
   reviewer approval recorded with a correlation ID.

## Verification

`npm run validate` chains OpenSpec strict validation, typecheck, unit and
integration tests, the judge-evidence validator, the Copilot package validator
(hash-pinned v0.1.7), the Work IQ + Foundry readiness gate, and the Adaptive
Card check. `npm run test:e2e` runs the Playwright golden flow against a freshly
reset local stack.
