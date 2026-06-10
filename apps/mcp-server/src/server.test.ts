import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { demoScope } from "@signal-foundry/shared";
import { describe, expect, it } from "vitest";
import { createServer } from "./server";
import { RegistryStore } from "./store";
import { executeTool } from "./tools";

function testStore() {
  return new RegistryStore(join(mkdtempSync(join(tmpdir(), "sf-")), "registry.json"));
}

describe("Signal Foundry MCP tools", () => {
  it("lists role-relevant recommendations with correlation IDs", async () => {
    const store = testStore();
    const actor = store.read().actors[0];
    const result = await executeTool(store, "recommend_capabilities_for_role", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      role: "Enterprise Account Manager",
      department: "Customer Success",
      workSignalSummary: "Synthetic renewal, meeting, and support summaries.",
      maxResults: 5,
      correlationId: "corr-test-read"
    }, actor);
    expect(result.status).toBe(200);
    expect(result.body.correlationId).toBe("corr-test-read");
  });

  it("returns sanitized user work context without raw content", async () => {
    const store = testStore();
    const actor = store.read().actors[0];
    const result = await executeTool(store, "get_user_work_context", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      requestedRole: "Presales Architect",
      requestedDepartment: "Sales Engineering",
      sourceHint: "synthetic_demo",
      correlationId: "corr-work-context"
    }, actor);
    expect(result.status).toBe(200);
    expect(result.body.correlationId).toBe("corr-work-context");
    expect(JSON.stringify(result.body)).toContain("Presales Architect");
    expect(JSON.stringify(result.body)).toContain("Sales Engineering");
    expect(JSON.stringify(result.body)).not.toContain("oauth-token");
    expect(store.read().mcpActivity.some((activity) => activity.action === "get_user_work_context")).toBe(false);
  });

  it("rejects mutation without confirmation", async () => {
    const store = testStore();
    const actor = store.read().actors[0];
    const result = await executeTool(store, "create_capability_proposal", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
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

  it("runs proposal, risk, review, approval, and release flow", async () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const reviewer = store.read().actors[1];
    const created = await executeTool(store, "create_capability_proposal", proposalBody("idem-flow-create"), employee);
    const proposalId = created.body.proposalId as string;
    const risk = await executeTool(store, "score_capability_risk", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
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
    const review = await executeTool(store, "submit_capability_review", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      idempotencyKey: "idem-flow-review",
      proposalId,
      reviewer: "Alex Kim",
      dueDate: "2026-06-08",
      confirmed: true
    }, reviewer);
    const approved = await executeTool(store, "approve_capability", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      idempotencyKey: "idem-flow-approve",
      proposalId,
      reviewer: "Alex Kim",
      approvalNotes: "Controls accepted.",
      confirmed: true
    }, reviewer);
    const released = await executeTool(store, "release_capability", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
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

  it("rejects employee approval attempts with sanitized error", async () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const result = await executeTool(store, "approve_capability", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      idempotencyKey: "idem-bad-approve",
      proposalId: "prop-missing",
      reviewer: "Priya Shah",
      approvalNotes: "Approve anyway.",
      confirmed: true
    }, employee);
    expect(result.status).toBe(403);
    expect(JSON.stringify(result.body)).not.toContain("stack");
  });

  it("records unauthorized attempts without raw request content", async () => {
    const store = testStore();
    const result = await executeTool(store, "approve_capability", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      idempotencyKey: "idem-unauth-audit",
      proposalId: "prop-missing",
      reviewer: "Unknown",
      approvalNotes: "Should not pass.",
      confirmed: true,
      correlationId: "corr-unauth-audit"
    }, undefined);
    const serialized = JSON.stringify(store.read());
    expect(result.status).toBe(401);
    expect(store.read().mcpActivity[0]?.status).toBe("rejected");
    expect(serialized).not.toContain("Should not pass");
  });

  it("keeps repeated proposal creation idempotent", async () => {
    const store = testStore();
    const employee = store.read().actors[0];
    const seededCount = store.read().proposals.length;
    const first = await executeTool(store, "create_capability_proposal", proposalBody("idem-repeat"), employee);
    const second = await executeTool(store, "create_capability_proposal", proposalBody("idem-repeat"), employee);
    expect(first.body.proposalId).toBe(second.body.proposalId);
    expect(store.read().proposals).toHaveLength(seededCount + 1);
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
      const openapi = await fetch(`${baseUrl}/openapi.json`);
      const rejected = await fetch(`${baseUrl}/tools/search_capabilities`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId: demoScope.tenantId, projectId: demoScope.projectId })
      });
      const toolsBody = await tools.json();
      expect(health.status).toBe(200);
      expect(toolsBody.tools).toContain("create_capability_proposal");
      expect(toolsBody.tools).toContain("get_user_work_context");
      expect((await openapi.json()).paths["/tools/search_capabilities"]).toBeDefined();
      expect(rejected.status).toBe(401);
      expect(JSON.stringify(await rejected.json())).not.toContain("token");
    } finally {
      server.close();
    }
  });

  it("serves authorized registry snapshots without actor records", async () => {
    const store = testStore();
    const reviewer = store.read().actors[1];
    await executeTool(store, "create_capability_proposal", proposalBody("idem-snapshot-create"), store.read().actors[0]);
    const proposalId = store.read().proposals[0]?.id;
    if (!proposalId || !reviewer) {
      throw new Error("Expected proposal and reviewer fixtures.");
    }
    await executeTool(store, "submit_capability_review", {
      tenantId: demoScope.tenantId,
      projectId: demoScope.projectId,
      idempotencyKey: "idem-snapshot-review",
      proposalId,
      reviewer: reviewer.name,
      dueDate: "2026-06-08",
      confirmed: true
    }, reviewer);
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
      const rejected = await fetch(`${baseUrl}/registry/snapshot`);
      const employeeRejected = await fetch(`${baseUrl}/registry/snapshot`, { headers: { "x-sf-actor-id": "actor-priya" } });
      const accepted = await fetch(`${baseUrl}/registry/snapshot`, { headers: { "x-sf-actor-id": "actor-alex" } });
      const body = await accepted.json();
      expect(rejected.status).toBe(401);
      expect(employeeRejected.status).toBe(403);
      expect(accepted.status).toBe(200);
      expect(body.registry.reviewItems).toHaveLength(1);
      expect(body.registry.proposals[0].id).toBe(proposalId);
      expect(body.registry.actors).toBeUndefined();
    } finally {
      server.close();
    }
  });

  it("accepts demo bearer actor tokens without exposing token content", async () => {
    const store = testStore();
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/tools/search_capabilities`, {
        method: "POST",
        headers: {
          "authorization": "Bearer demo-actor-alex",
          "content-type": "application/json"
        },
        body: JSON.stringify({ tenantId: demoScope.tenantId, projectId: demoScope.projectId })
      });
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(JSON.stringify(body)).not.toContain("demo-actor-alex");
    } finally {
      server.close();
    }
  });

  it("accepts OAuth bearer writes through the synthetic demo auth boundary", async () => {
    const store = testStore();
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/tools/create_capability_proposal`, {
        method: "POST",
        headers: {
          "authorization": "Bearer oauth-token-redacted",
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...proposalBody("idem-oauth-create"), correlationId: "corr-oauth-create" })
      });
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.proposalId).toBeDefined();
      expect(JSON.stringify(body)).not.toContain("oauth-token-redacted");
      expect(store.read().mcpActivity[0]?.correlationId).toBe("corr-oauth-create");
    } finally {
      server.close();
    }
  });

  it("serves MCP JSON-RPC tool list and tool calls", async () => {
    const store = testStore();
    const server = createServer(store).listen(0);
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected local test port.");
    }
    try {
      const baseUrl = `http://127.0.0.1:${address.port}`;
      const listed = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: "mcp-list", method: "tools/list" })
      });
      const called = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-sf-actor-id": "actor-priya" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mcp-call",
          method: "tools/call",
          params: {
            name: "search_capabilities",
            arguments: { tenantId: demoScope.tenantId, projectId: demoScope.projectId }
          }
        })
      });
      expect(listed.status).toBe(200);
      const toolList = await listed.json();
      expect(toolList.result.tools).toHaveLength(12);
      const workContextTool = toolList.result.tools.find((tool: { name: string }) => tool.name === "get_user_work_context");
      expect(workContextTool.annotations.readOnlyHint).toBe(true);
      const submitTool = toolList.result.tools.find((tool: { name: string }) => tool.name === "submit_capability_review");
      expect(submitTool.inputSchema.required).toContain("correlationId");
      expect(submitTool.inputSchema.required).toContain("confirmed");
      expect(called.status).toBe(200);
      expect((await called.json()).result.isError).toBe(false);
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
    tenantId: demoScope.tenantId,
    projectId: demoScope.projectId,
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
