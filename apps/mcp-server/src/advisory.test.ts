import { describe, expect, it } from "vitest";
import { computeAgreement, generateAdvisoryRiskAnalysis, sanitizeAdvisoryText } from "./advisory";
import { scoreRisk } from "./risk";

const proposal = {
  title: "Renewal Brief Generator",
  description: "Synthetic demo proposal.",
  role: "Account Manager",
  department: "Customer Success"
};

const riskInput = {
  dataSensitivity: "low",
  externalSharing: "low",
  automationLevel: "autonomous",
  audienceScope: "enterprise",
  usesCustomerData: false,
  requiresHumanReview: false
} as const;

const deterministic: { riskLevel: "high"; requiredControls: string[] } = {
  riskLevel: "high",
  requiredControls: ["Human review before release"]
};

const foundryEnv = {
  SIGNAL_FOUNDRY_ADVISORY_MODE: "foundry",
  SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT: "https://example.openai.azure.com",
  SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT: "advisory-model",
  SIGNAL_FOUNDRY_FOUNDRY_API_VERSION: "2024-10-21",
  SIGNAL_FOUNDRY_FOUNDRY_API_KEY: "test-key-not-real"
} as NodeJS.ProcessEnv;

function mockFetchReturning(content: unknown): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({ model: "advisory-model", choices: [{ message: { content: JSON.stringify(content) } }] }),
      { status: 200 }
    )) as typeof fetch;
}

function advisoryResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({ model: "advisory-model", choices: [{ message: { content: JSON.stringify(content) } }] }),
    { status: 200 }
  );
}

// Returns a fetch mock that yields each queued response in order; once exhausted
// it throws (which the draft loop treats as an upstream failure).
function mockFetchSequence(responses: Array<() => Response | Promise<Response>>): { fetchImpl: typeof fetch; calls: () => number } {
  let index = 0;
  const fetchImpl = (async () => {
    const factory = responses[index];
    index += 1;
    if (!factory) {
      throw new Error("network down");
    }
    return factory();
  }) as unknown as typeof fetch;
  return { fetchImpl, calls: () => index };
}

const critiqueEnv = { ...foundryEnv, SIGNAL_FOUNDRY_ADVISORY_SELF_CRITIQUE: "on" } as NodeJS.ProcessEnv;

describe("advisory risk analysis", () => {
  it("returns unavailable when advisory mode is off", async () => {
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, { SIGNAL_FOUNDRY_ADVISORY_MODE: "off" } as NodeJS.ProcessEnv);
    expect(result).toEqual({ status: "unavailable" });
  });

  it("returns unavailable when config is incomplete", async () => {
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, { SIGNAL_FOUNDRY_ADVISORY_MODE: "foundry" } as NodeJS.ProcessEnv);
    expect(result).toEqual({ status: "unavailable" });
  });

  it("parses a valid advisory payload and computes disagreement deterministically", async () => {
    const fetchImpl = mockFetchReturning({
      summary: "Automation without review raises operational risk.",
      steps: [
        { signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Reviewer approval" }
      ],
      suggestedRiskLevel: "medium"
    });
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, fetchImpl);
    expect(result.status).toBe("available");
    expect(result.suggestedRiskLevel).toBe("medium");
    expect(result.agreesWithGate).toBe(false);
    expect(result.steps).toHaveLength(1);
    expect(result.model).toBe("advisory-model");
  });

  it("marks agreement when the suggested level matches the gate", async () => {
    const fetchImpl = mockFetchReturning({ summary: "High risk confirmed.", steps: [], suggestedRiskLevel: "high" });
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, fetchImpl);
    expect(result.agreesWithGate).toBe(true);
  });

  it("degrades to unavailable on upstream failure after one retry", async () => {
    let calls = 0;
    const failingFetch = (async () => {
      calls += 1;
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, failingFetch);
    expect(result).toEqual({ status: "unavailable" });
    expect(calls).toBe(2);
  });

  it("degrades to unavailable on malformed payloads", async () => {
    const fetchImpl = (async () => new Response("not json at all", { status: 200 })) as typeof fetch;
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, fetchImpl);
    expect(result).toEqual({ status: "unavailable" });
  });

  it("sanitizes credential-like and contact strings from advisory text", () => {
    const dirty = "Contact admin@example.com with api_key=abc123secret and Bearer abcdefghijkl token.";
    const clean = sanitizeAdvisoryText(dirty, 600);
    expect(clean).not.toContain("admin@example.com");
    expect(clean).not.toContain("abc123secret");
    expect(clean).not.toMatch(/Bearer abcdefghijkl/);
  });

  it("computeAgreement is undefined without a suggestion", () => {
    expect(computeAgreement(undefined, "high")).toBeUndefined();
  });

  it("self-critique ON: returns the revised analysis with selfCritique text after two calls", async () => {
    const draft = {
      summary: "Draft: autonomous automation is risky.",
      steps: [{ signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Reviewer approval" }],
      suggestedRiskLevel: "medium"
    };
    const revised = {
      summary: "Revised: autonomous automation plus enterprise audience is risky.",
      steps: [
        { signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Mandatory reviewer approval" },
        { signal: "audienceScope=enterprise", concern: "Broad blast radius", suggestedControl: "Staged rollout" }
      ],
      suggestedRiskLevel: "high",
      critique: "Added the enterprise audience signal and strengthened the reviewer control."
    };
    const { fetchImpl, calls } = mockFetchSequence([
      () => advisoryResponse(draft),
      () => advisoryResponse(revised)
    ]);
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, critiqueEnv, fetchImpl);
    expect(calls()).toBe(2);
    expect(result.status).toBe("available");
    expect(result.suggestedRiskLevel).toBe("high");
    expect(result.agreesWithGate).toBe(true);
    expect(result.steps).toHaveLength(2);
    expect(result.selfCritique).toBe(
      "Added the enterprise audience signal and strengthened the reviewer control."
    );
  });

  it("self-critique ON: falls back to the draft when the critique call fails", async () => {
    const draft = {
      summary: "Draft analysis stands.",
      steps: [{ signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Reviewer approval" }],
      suggestedRiskLevel: "medium"
    };
    const { fetchImpl, calls } = mockFetchSequence([
      () => advisoryResponse(draft)
      // second call exhausts the queue -> throws -> falls back to draft
    ]);
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, critiqueEnv, fetchImpl);
    expect(calls()).toBe(2);
    expect(result.status).toBe("available");
    expect(result.suggestedRiskLevel).toBe("medium");
    expect(result.steps).toHaveLength(1);
    expect(result.selfCritique).toBeUndefined();
  });

  it("self-critique ON: falls back to the draft when the critique payload is malformed", async () => {
    const draft = {
      summary: "Draft analysis stands.",
      steps: [{ signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Reviewer approval" }],
      suggestedRiskLevel: "medium"
    };
    const { fetchImpl } = mockFetchSequence([
      () => advisoryResponse(draft),
      () => new Response("not json at all", { status: 200 })
    ]);
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, critiqueEnv, fetchImpl);
    expect(result.status).toBe("available");
    expect(result.suggestedRiskLevel).toBe("medium");
    expect(result.selfCritique).toBeUndefined();
  });

  it("self-critique ON: still degrades to unavailable when the draft call fails after retry", async () => {
    let calls = 0;
    const failingFetch = (async () => {
      calls += 1;
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, critiqueEnv, failingFetch);
    expect(result).toEqual({ status: "unavailable" });
    expect(calls).toBe(2);
  });

  it("self-critique OFF: makes exactly one model call and behaves as today", async () => {
    const { fetchImpl, calls } = mockFetchSequence([
      () =>
        advisoryResponse({
          summary: "Single pass.",
          steps: [{ signal: "automationLevel=autonomous", concern: "No human in the loop", suggestedControl: "Reviewer approval" }],
          suggestedRiskLevel: "medium"
        })
    ]);
    const result = await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, fetchImpl);
    expect(calls()).toBe(1);
    expect(result.status).toBe("available");
    expect(result.suggestedRiskLevel).toBe("medium");
    expect(result.selfCritique).toBeUndefined();
  });

  it("never changes the deterministic verdict regardless of advisory outcome", async () => {
    const base = {
      tenantId: "tenant-asteria-dynamics",
      projectId: "revenue-ops-launchpad",
      idempotencyKey: "idem-advisory-iso",
      confirmed: true,
      proposalId: "prop-advisory-iso",
      ...riskInput
    } as const;
    const verdictBefore = scoreRisk(base);
    await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, foundryEnv, mockFetchReturning({ summary: "x", steps: [], suggestedRiskLevel: "low" }));
    // The self-critique path must hold the same invariant: advisory never mutates the gate verdict.
    const { fetchImpl } = mockFetchSequence([
      () => advisoryResponse({ summary: "draft", steps: [], suggestedRiskLevel: "low" }),
      () => advisoryResponse({ summary: "revised", steps: [], suggestedRiskLevel: "blocked", critique: "Escalated." })
    ]);
    await generateAdvisoryRiskAnalysis(proposal, riskInput, deterministic, critiqueEnv, fetchImpl);
    const verdictAfter = scoreRisk(base);
    expect(JSON.stringify(verdictAfter)).toBe(JSON.stringify(verdictBefore));
  });
});
