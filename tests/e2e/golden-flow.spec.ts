import { expect, test, type APIRequestContext } from "@playwright/test";

const MCP = "http://127.0.0.1:7071";
const scope = { tenantId: "tenant-asteria-dynamics", projectId: "revenue-ops-launchpad" };
const PROPOSAL_TITLE = "E2E Renewal Brief Generator";

async function callTool(request: APIRequestContext, tool: string, actorId: string, data: Record<string, unknown>) {
  return request.post(`${MCP}/tools/${tool}`, { headers: { "x-sf-actor-id": actorId }, data });
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ request }) => {
  const reset = await request.post(`${MCP}/admin/reset`, { headers: { "x-sf-actor-id": "actor-dana" } });
  expect(reset.ok()).toBe(true);
});

test("golden flow: propose, score, review, approve, release, verify on Foundry Floor", async ({ page, request }) => {
  const created = await callTool(request, "create_capability_proposal", "actor-priya", {
    ...scope,
    correlationId: "corr-e2e-golden-001",
    idempotencyKey: "idem-e2e-golden-create",
    confirmed: true,
    title: PROPOSAL_TITLE,
    description: "Create a governed renewal brief from approved synthetic summaries only.",
    role: "Enterprise Account Manager",
    department: "Customer Success",
    owner: "Priya Shah",
    intendedAudience: "team",
    inputsRequired: ["Account summary"],
    proposedOutputs: ["Renewal brief"],
    sourceSummary: "Synthetic Work IQ-style CRM and meeting summaries."
  });
  expect(created.ok()).toBe(true);
  const proposalId = (await created.json()).proposalId as string;
  expect(proposalId).toMatch(/^prop-/);

  const scored = await callTool(request, "score_capability_risk", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-002",
    idempotencyKey: "idem-e2e-golden-score",
    confirmed: true,
    proposalId,
    dataSensitivity: "low",
    externalSharing: "low",
    automationLevel: "assistive",
    audienceScope: "team",
    usesCustomerData: false,
    requiresHumanReview: true
  });
  expect(scored.ok()).toBe(true);
  const scoredBody = await scored.json();
  expect(scoredBody.riskLevel).toBe("low");
  expect(scoredBody.advisory.status).toBe("unavailable");
  expect(Array.isArray(scoredBody.requiredControls)).toBe(true);
  expect(scoredBody.requiredControls.length).toBeGreaterThanOrEqual(3);

  const submitted = await callTool(request, "submit_capability_review", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-003",
    idempotencyKey: "idem-e2e-golden-review",
    confirmed: true,
    proposalId,
    reviewer: "Alex Kim",
    dueDate: "2026-06-20"
  });
  expect(submitted.ok()).toBe(true);

  const approved = await callTool(request, "approve_capability", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-004",
    idempotencyKey: "idem-e2e-golden-approve",
    confirmed: true,
    proposalId,
    reviewer: "Alex Kim",
    approvalNotes: "Approved for the renewal team."
  });
  expect(approved.ok()).toBe(true);
  const capabilityId = (await approved.json()).capabilityId as string;
  expect(capabilityId).toMatch(/^cap-/);

  const released = await callTool(request, "release_capability", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-005",
    idempotencyKey: "idem-e2e-golden-release",
    confirmed: true,
    capabilityId,
    releasedBy: "Alex Kim",
    audience: "team",
    version: "v1.0.0"
  });
  expect(released.ok()).toBe(true);
  expect((await released.json()).status).toBe("released");

  const checkpoint = await callTool(request, "record_copilot_checkpoint", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-005",
    idempotencyKey: "idem-e2e-golden-release-checkpoint",
    confirmed: true,
    sessionId: "session-e2e-golden",
    speaker: "reviewer",
    stage: "release",
    source: "release_result",
    sourceTool: "release_capability",
    relatedRecordId: capabilityId,
    approvalState: "human_approved",
    actor: "Alex Kim",
    displayText: "Alex Kim released E2E Renewal Brief Generator with approved source summaries."
  });
  expect(checkpoint.ok()).toBe(true);

  const activity = await callTool(request, "list_mcp_activity", "actor-alex", {
    ...scope,
    correlationId: "corr-e2e-golden-006",
    limit: 25
  });
  const actions = ((await activity.json()).activity as Array<{ action: string }>).map((item) => item.action);
  for (const expected of ["create_capability_proposal", "score_capability_risk", "submit_capability_review", "approve_capability", "release_capability", "record_copilot_checkpoint"]) {
    expect(actions).toContain(expected);
  }

  await page.addInitScript(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
  await page.route("**/.auth/me", (route) =>
    route.fulfill({
      json: {
        clientPrincipal: {
          identityProvider: "aad",
          userDetails: "e2e-operator@asteria-dynamics.example",
          userId: "e2e-operator",
          userRoles: ["authenticated"]
        }
      }
    })
  );
  await page.goto("/");
  await expect(page.getByText("Live registry synced")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Foundry Floor" }).click();
  await expect(page.getByRole("button", { name: new RegExp(PROPOSAL_TITLE) }).first()).toBeVisible();
  await expect(page.getByText("MCP Activity")).toBeVisible();
  await expect(page.getByText("release_capability").first()).toBeVisible();
  await expect(page.getByLabel("Advisory analysis")).toBeVisible();
  await page.getByRole("button", { name: "Copilot Mirror" }).click();
  await expect(page.getByText("Live from approved MCP checkpoints")).toBeVisible();
  await expect(page.getByText("Alex Kim released E2E Renewal Brief Generator")).toBeVisible();
  await expect(page.getByText("corr-e2e-golden-005")).toBeVisible();
});

test("unauthorized approval is rejected with a sanitized error", async ({ request }) => {
  const rejected = await callTool(request, "approve_capability", "actor-priya", {
    ...scope,
    correlationId: "corr-e2e-unauth-001",
    idempotencyKey: "idem-e2e-unauth-approve",
    confirmed: true,
    proposalId: "prop-e2e-unauthorized",
    reviewer: "Priya Shah",
    approvalNotes: "Attempting self-approval."
  });
  expect(rejected.status()).toBe(403);
  const body = await rejected.json();
  expect(body.ok).toBe(false);
  expect(typeof body.error.message).toBe("string");
  const serialized = JSON.stringify(body);
  expect(serialized).not.toMatch(/stack|token|secret|bearer/i);
});
