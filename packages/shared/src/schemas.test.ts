import { describe, expect, it } from "vitest";
import { toolSchemas, type ToolName } from "./schemas";

const writeTools: ToolName[] = [
  "create_capability_proposal",
  "score_capability_risk",
  "submit_capability_review",
  "approve_capability",
  "reject_capability",
  "release_capability"
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
  release_capability: { capabilityId: "cap-001", releasedBy: "Alex Kim", audience: "team", version: "v1.0.0" }
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
