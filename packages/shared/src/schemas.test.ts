import { describe, expect, it } from "vitest";
import { toolSchemas, type ToolName } from "./schemas";

const writeTools: ToolName[] = [
  "create_capability_proposal",
  "score_capability_risk",
  "submit_capability_review",
  "approve_capability",
  "reject_capability",
  "release_capability",
  "record_copilot_checkpoint"
];

const validWriteInputs: Record<string, Record<string, unknown>> = {
  create_capability_proposal: {
    title: "Renewal Brief Generator",
    description: "Generates a renewal brief from approved registry data only.",
    role: "Account Manager",
    department: "Customer Success",
    owner: "Priya Shah",
    intendedAudience: "team",
    inputsRequired: ["account name"],
    proposedOutputs: ["renewal brief"],
    sourceSummary: "Synthetic demo workflow for renewals."
  },
  score_capability_risk: {
    proposalId: "prop-001",
    dataSensitivity: "low",
    externalSharing: "low",
    automationLevel: "assistive",
    audienceScope: "team",
    usesCustomerData: false,
    requiresHumanReview: true
  },
  submit_capability_review: { proposalId: "prop-001", reviewer: "Alex Kim", dueDate: "2026-06-20" },
  approve_capability: { proposalId: "prop-001", reviewer: "Alex Kim", approvalNotes: "Approved for team use." },
  reject_capability: { proposalId: "prop-001", reviewer: "Alex Kim", reason: "Scope too broad.", nextAction: "Narrow audience." },
  release_capability: { capabilityId: "cap-001", releasedBy: "Alex Kim", audience: "team", version: "v1.0.0" },
  record_copilot_checkpoint: {
    sessionId: "session-test-001",
    speaker: "copilot",
    stage: "discovery",
    source: "tool_result_summary",
    sourceTool: "recommend_capabilities_for_role",
    approvalState: "system_approved",
    actor: "Signal Foundry",
    displayText: "Copilot found governed renewal workflow candidates from approved summaries."
  }
};

const scope = {
  tenantId: "tenant-asteria-dynamics",
  projectId: "revenue-ops-launchpad",
  correlationId: "corr-test-001",
  idempotencyKey: "idem-test-0001"
};

describe("mutation schema confirmation gate", () => {
  for (const tool of writeTools) {
    const base = { ...scope, ...validWriteInputs[tool] };

    it(`${tool} accepts confirmed: true`, () => {
      expect(toolSchemas[tool].safeParse({ ...base, confirmed: true }).success).toBe(true);
    });

    it(`${tool} rejects missing confirmed`, () => {
      expect(toolSchemas[tool].safeParse(base).success).toBe(false);
    });

    it(`${tool} rejects confirmed: false`, () => {
      expect(toolSchemas[tool].safeParse({ ...base, confirmed: false }).success).toBe(false);
    });
  }
});

describe("Copilot checkpoint schema", () => {
  const validCheckpoint = {
    ...scope,
    ...validWriteInputs.record_copilot_checkpoint,
    confirmed: true
  };

  it("accepts a valid checkpoint", () => {
    expect(toolSchemas.record_copilot_checkpoint.safeParse(validCheckpoint).success).toBe(true);
  });

  it("rejects invalid stage values", () => {
    expect(toolSchemas.record_copilot_checkpoint.safeParse({ ...validCheckpoint, stage: "made_up" }).success).toBe(false);
  });

  it("rejects overlong display text", () => {
    expect(toolSchemas.record_copilot_checkpoint.safeParse({ ...validCheckpoint, displayText: "x".repeat(421) }).success).toBe(false);
  });
});

describe("LLM client typing tolerance", () => {
  const base = { ...scope, ...validWriteInputs["create_capability_proposal"] };

  it("accepts confirmed as the strings 'True' and 'true'", () => {
    expect(toolSchemas.create_capability_proposal.safeParse({ ...base, confirmed: "True" }).success).toBe(true);
    expect(toolSchemas.create_capability_proposal.safeParse({ ...base, confirmed: "true" }).success).toBe(true);
  });

  it("still rejects false-like confirmations", () => {
    expect(toolSchemas.create_capability_proposal.safeParse({ ...base, confirmed: "False" }).success).toBe(false);
    expect(toolSchemas.create_capability_proposal.safeParse({ ...base, confirmed: "yes" }).success).toBe(false);
  });

  it("accepts risk booleans and arrays in string form", () => {
    const risk = { ...scope, ...validWriteInputs["score_capability_risk"], confirmed: true, usesCustomerData: "False", requiresHumanReview: "True" };
    expect(toolSchemas.score_capability_risk.safeParse(risk).success).toBe(true);
    const proposal = { ...base, confirmed: true, inputsRequired: '["Account summary"]', proposedOutputs: '["Renewal brief"]' };
    expect(toolSchemas.create_capability_proposal.safeParse(proposal).success).toBe(true);
  });

  it("normalizes loose release versions to a 3-part semver", () => {
    const releaseBase = { ...scope, ...validWriteInputs["release_capability"], confirmed: true };
    for (const version of ["v1.0", "1.0", "1", "v1", "1.0.0", "v1.0.0", "2.3"]) {
      const parsed = toolSchemas.release_capability.safeParse({ ...releaseBase, version });
      expect(parsed.success, `version "${version}" should parse`).toBe(true);
      if (parsed.success) {
        expect((parsed.data as { version: string }).version).toMatch(/^v\d+\.\d+\.\d+$/);
      }
    }
    // Missing version defaults; genuinely malformed values still fail.
    const omitted = { ...releaseBase } as Record<string, unknown>;
    delete omitted["version"];
    expect(toolSchemas.release_capability.safeParse(omitted).success).toBe(true);
    expect(toolSchemas.release_capability.safeParse({ ...releaseBase, version: "latest" }).success).toBe(false);
  });
});

