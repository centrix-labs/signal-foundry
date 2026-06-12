import { describe, expect, it } from "vitest";
import { createCapabilityProposalInputSchema } from "./schemas";
import { demoOperatingContract, demoRegistry, demoScope, validProposalFixture } from "./fixtures";

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

  it("keeps demo defaults and all five operating rules explicit", () => {
    expect(demoScope.companyName).toBe("Asteria Dynamics");
    expect(demoRegistry.demoScope).toEqual(demoScope);
    expect(demoRegistry.copilotCheckpoints).toEqual([]);
    expect(demoOperatingContract).toHaveLength(5);
    expect(demoOperatingContract.join(" ")).toContain("Work IQ");
    expect(demoOperatingContract.join(" ")).toContain("deterministic tool results");
    expect(demoOperatingContract.join(" ")).toContain("Refuse surveillance");
  });
});
