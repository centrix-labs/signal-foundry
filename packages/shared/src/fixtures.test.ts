import { describe, expect, it } from "vitest";
import { createCapabilityProposalInputSchema } from "./schemas";
import { demoRegistry, validProposalFixture } from "./fixtures";

describe("Signal Foundry shared fixtures", () => {
  it("keeps seed data synthetic and audit safe", () => {
    const serialized = JSON.stringify(demoRegistry).toLowerCase();
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("@");
  });

  it("validates the proposal fixture against the MCP schema", () => {
    expect(createCapabilityProposalInputSchema.parse(validProposalFixture).title).toBe(
      "Renewal Brief Generator"
    );
  });
});
