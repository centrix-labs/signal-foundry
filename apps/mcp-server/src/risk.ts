import type { RiskLevel } from "@signal-foundry/shared";
import type { z } from "zod";
import type { scoreCapabilityRiskInputSchema } from "@signal-foundry/shared";

type RiskInput = z.infer<typeof scoreCapabilityRiskInputSchema>;

const riskWeights: Record<RiskLevel, number> = {
  low: 0,
  medium: 2,
  high: 4,
  blocked: 8
};

export function scoreRisk(input: RiskInput) {
  let score = riskWeights[input.dataSensitivity] + riskWeights[input.externalSharing];
  if (input.automationLevel === "semi_automated") {
    score += 2;
  }
  if (input.automationLevel === "autonomous") {
    score += 5;
  }
  if (["enterprise", "external"].includes(input.audienceScope)) {
    score += 2;
  }
  if (input.usesCustomerData) {
    score += 2;
  }
  if (!input.requiresHumanReview) {
    score += 3;
  }

  const riskLevel = input.dataSensitivity === "blocked" || input.externalSharing === "blocked"
    ? "blocked"
    : score >= 10
      ? "high"
      : score >= 5
        ? "medium"
        : "low";

  const requiredControls = buildControls(input, riskLevel);
  return {
    riskLevel: riskLevel as RiskLevel,
    requiredControls,
    rationale: `Deterministic score ${score}: ${requiredControls.join("; ")}.`
  };
}

function buildControls(input: RiskInput, riskLevel: RiskLevel) {
  const controls = [
    "Human review before release",
    "Audit-safe summaries only",
    "Prompt injection exposure tested",
    "Sensitive output blocked from release packets"
  ];
  if (input.dataSensitivity !== "low") {
    controls.push("Data classification verified");
  }
  if (input.externalSharing !== "low" || input.audienceScope === "external") {
    controls.push("External sharing disabled unless separately approved");
  }
  if (input.automationLevel !== "assistive") {
    controls.push("Automation bounded by reviewer approval");
  }
  if (input.usesCustomerData) {
    controls.push("Customer data minimized to approved summaries");
  }
  if (riskLevel === "high" || riskLevel === "blocked") {
    controls.push("AI Enablement reviewer sign-off required");
  }
  return controls;
}
