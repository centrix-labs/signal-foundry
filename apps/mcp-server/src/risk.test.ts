import { describe, expect, it } from "vitest";
import { scoreRisk } from "./risk";

const baseRiskInput = {
  tenantId: "tenant-contoso",
  projectId: "renewals-hackathon",
  idempotencyKey: "idem-risk-test",
  proposalId: "prop-risk-test",
  dataSensitivity: "low",
  externalSharing: "low",
  automationLevel: "assistive",
  audienceScope: "team",
  usesCustomerData: false,
  requiresHumanReview: true
} as const;

describe("deterministic risk gate", () => {
  it("scores low risk assistive proposals as low", () => {
    expect(scoreRisk(baseRiskInput).riskLevel).toBe("low");
  });

  it("raises customer-data proposals with broader automation", () => {
    expect(scoreRisk({
      ...baseRiskInput,
      dataSensitivity: "medium",
      automationLevel: "semi_automated",
      usesCustomerData: true
    }).riskLevel).toBe("medium");
  });

  it("scores high-risk external autonomous proposals as high", () => {
    expect(scoreRisk({
      ...baseRiskInput,
      dataSensitivity: "high",
      externalSharing: "high",
      automationLevel: "autonomous",
      audienceScope: "external",
      usesCustomerData: true,
      requiresHumanReview: false
    }).riskLevel).toBe("high");
  });

  it("blocks explicitly blocked data or sharing inputs", () => {
    expect(scoreRisk({ ...baseRiskInput, dataSensitivity: "blocked" }).riskLevel).toBe("blocked");
  });
});
