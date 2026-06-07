import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "./server";
import { RegistryStore } from "./store";
import { executeTool } from "./tools";

function testStore() {
  return new RegistryStore(join(mkdtempSync(join(tmpdir(), "sf-")), "registry.json"));
}

describe("Signal Foundry MCP tools", () => {
  it("lists role-relevant recommendations with correlation IDs", () => {
    const store = testStore();
    const actor = store.read().actors[0];
    const result = executeTool(store, "recommend_capabilities_for_role", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      role: "Enterprise Account Manager",
      department: "Customer Success",
      workSignalSummary: "Synthetic renewal, meeting, and support summaries.",
      maxResults: 5,
      correlationId: "corr-test-read"
    }, actor);
    expect(result.status).toBe(200);
    expect(result.body.correlationId).toBe("corr-test-read");
  });

  it("rejects mutation without confirmation", () => {
    const store = testStore();
    const actor = store.read().actors[0];
    const result = executeTool(store, "create_capability_proposal", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-test-no-confirm",
      title: "Renewal Brief Generator",
      description: "Create a governed renewal brief from approved summaries.",
      role: "Enterprise Account Manager",
      department: "Customer Success",
      owner: "Priya Shah",
      intendedAudience: "team",
      inputsRequired: ["Account summary"],
      proposedOutputs: ["Renewal brief"],
      sourceSummary: "Synthetic Work IQ-style summaries only."
    }, actor);
    expect(result.status).toBe(400);
  });

  it("runs proposal, risk, review, approval, and release flow", () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const reviewer = store.read().actors[1];
    const created = executeTool(store, "create_capability_proposal", proposalBody("idem-flow-create"), employee);
    const proposalId = created.body.proposalId as string;
    const risk = executeTool(store, "score_capability_risk", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-flow-risk",
      proposalId,
      dataSensitivity: "medium",
      externalSharing: "low",
      automationLevel: "assistive",
      audienceScope: "team",
      usesCustomerData: true,
      requiresHumanReview: true,
      confirmed: true
    }, reviewer);
    const review = executeTool(store, "submit_capability_review", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-flow-review",
      proposalId,
      reviewer: "Alex Kim",
      dueDate: "2026-06-08",
      confirmed: true
    }, reviewer);
    const approved = executeTool(store, "approve_capability", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-flow-approve",
      proposalId,
      reviewer: "Alex Kim",
      approvalNotes: "Controls accepted.",
      confirmed: true
    }, reviewer);
    const released = executeTool(store, "release_capability", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-flow-release",
      capabilityId: approved.body.capabilityId,
      releasedBy: "Alex Kim",
      audience: "team",
      version: "v1.0.0",
      confirmed: true
    }, reviewer);
    expect(risk.status).toBe(200);
    expect(review.status).toBe(200);
    expect(released.status).toBe(200);
    expect(store.read().releasePackets).toHaveLength(1);
  });

  it("rejects employee approval attempts with sanitized error", () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const result = executeTool(store, "approve_capability", {
      tenantId: "tenant-contoso",
      projectId: "renewals-hackathon",
      idempotencyKey: "idem-bad-approve",
      proposalId: "prop-missing",
      reviewer: "Priya Shah",
      approvalNotes: "Approve anyway.",
      confirmed: true
    }, employee);
    expect(result.status).toBe(403);
    expect(JSON.stringify(result.body)).not.toContain("stack");
  });

  it("keeps repeated proposal creation idempotent", () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const first = executeTool(store, "create_capability_proposal", proposalBody("idem-repeat"), employee);
    const second = executeTool(store, "create_capability_proposal", proposalBody("idem-repeat"), employee);
    expect(first.body.proposalId).toBe(second.body.proposalId);
    expect(store.read().proposals).toHaveLength(1);
  });

  it("serves health, tool list, and unauthorized rejection over HTTP", async () => {
    const store = testStore();
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
      const health = await fetch(`${baseUrl}/health`);
      const tools = await fetch(`${baseUrl}/tools`);
      const rejected = await fetch(`${baseUrl}/tools/search_capabilities`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId: "tenant-contoso", projectId: "renewals-hackathon" })
      });
      expect(health.status).toBe(200);
      expect((await tools.json()).tools).toContain("create_capability_proposal");
      expect(rejected.status).toBe(401);
      expect(JSON.stringify(await rejected.json())).not.toContain("token");
    } finally {
      server.close();
    }
  });

  it("allows admin reset for deterministic demos", async () => {
    const store = testStore();
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/admin/reset`, {
        method: "POST",
        headers: { "x-sf-actor-id": "actor-dana" }
      });
      expect(response.status).toBe(200);
      expect((await response.json()).registry.capabilities).toHaveLength(2);
    } finally {
      server.close();
    }
  });
});

function proposalBody(idempotencyKey: string) {
  return {
    tenantId: "tenant-contoso",
    projectId: "renewals-hackathon",
    idempotencyKey,
    title: "Renewal Brief Generator",
    description: "Create a governed renewal brief from approved account and workflow summaries.",
    role: "Enterprise Account Manager",
    department: "Customer Success",
    owner: "Priya Shah",
    intendedAudience: "team",
    inputsRequired: ["Account summary"],
    proposedOutputs: ["Renewal brief"],
    sourceSummary: "Synthetic Work IQ-style summaries only.",
    confirmed: true
  };
}
