import { describe, expect, it } from "vitest";
import { demoScope } from "@signal-foundry/shared";
import { scoreRisk } from "./risk";

const baseRiskInput = {
  tenantId: demoScope.tenantId,
  projectId: demoScope.projectId,
  idempotencyKey: "idem-risk-test",
  confirmed: true,
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

  it("treats medium sensitivity customer data as medium even when assistive", () => {
    expect(scoreRisk({
      ...baseRiskInput,
      dataSensitivity: "medium",
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
