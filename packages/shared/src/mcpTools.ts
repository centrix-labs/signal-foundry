import type { ToolName } from "./schemas";

type JsonSchema = Record<string, unknown>;

const scopedProperties: Record<string, JsonSchema> = {
  tenantId: { type: "string", description: "Tenant scope for this Signal Foundry registry request." },
  projectId: { type: "string", description: "Project scope for this Signal Foundry registry request." },
  correlationId: {
    type: "string",
    minLength: 8,
    description: "Caller-generated audit correlation ID. Reuse the returned value when continuing a scenario."
  }
};

const mutationProperties: Record<string, JsonSchema> = {
  idempotencyKey: {
    type: "string",
    minLength: 8,
    description: "Stable key for this intended write so repeated Copilot calls do not create duplicate records."
  },
  confirmed: {
    type: "boolean",
    description: "Must be true only after the user explicitly confirms the named write, target record, tenant/project scope, and audit event."
  }
};

const scopedRequired = ["tenantId", "projectId", "correlationId"];

function schema(properties: Record<string, JsonSchema>, required: string[]): JsonSchema {
  return {
    type: "object",
    properties: { ...scopedProperties, ...properties },
    required: [...scopedRequired, ...required]
  };
}

function mutationSchema(properties: Record<string, JsonSchema>, required: string[]): JsonSchema {
  return schema({ ...mutationProperties, ...properties }, ["idempotencyKey", "confirmed", ...required]);
}

export const mcpToolMetadata: Array<{
  name: ToolName;
  description: string;
  inputSchema: JsonSchema;
  annotations?: Record<string, unknown>;
}> = [
  {
    name: "search_capabilities",
    description: "Read approved or proposed capabilities by role, department, stage, risk, or keyword. Returns sanitized capability summaries and a correlationId. Do not use this for employee monitoring.",
    inputSchema: schema({
      query: { type: "string" },
      role: { type: "string" },
      department: { type: "string" },
      status: { type: "string" },
      riskLevel: { type: "string" }
    }, []),
    annotations: { readOnlyHint: true }
  },
  {
    name: "recommend_capabilities_for_role",
    description: "Read role-relevant approved and candidate capabilities from permission-aware Work IQ summaries or synthetic Work IQ-style summaries. Summaries must be brief, non-PII, and never quote raw Microsoft 365 content.",
    inputSchema: schema({
      role: { type: "string" },
      department: { type: "string" },
      workSignalSummary: {
        type: "string",
        minLength: 10,
        description: "Permission-aware Work IQ summary or synthetic equivalent. Use aggregated job context, tasks, source types, and workflow friction only; never include raw emails, chats, transcripts, documents, customer records, secrets, or personal data."
      },
      maxResults: { type: "integer", minimum: 1, maximum: 8 }
    }, ["role", "department", "workSignalSummary"]),
    annotations: { readOnlyHint: true }
  },
  {
    name: "create_capability_proposal",
    description: "Write a governed capability proposal from a selected use case. Only report success after the tool returns ok:true with proposalId and correlationId.",
    inputSchema: mutationSchema({
      title: { type: "string" },
      description: { type: "string" },
      role: { type: "string" },
      department: { type: "string" },
      owner: { type: "string" },
      intendedAudience: { type: "string", enum: ["individual", "team", "department", "enterprise", "external"] },
      inputsRequired: { type: "array", items: { type: "string" } },
      proposedOutputs: { type: "array", items: { type: "string" } },
      sourceSummary: {
        type: "string",
        description: "Sanitized Work IQ-style source summary. Include source categories and business friction only; never include raw Microsoft 365 content or PII."
      }
    }, ["title", "description", "role", "department", "owner", "intendedAudience", "inputsRequired", "proposedOutputs", "sourceSummary"])
  },
  {
    name: "score_capability_risk",
    description: "Write a deterministic risk review for a proposal. Only report success after the tool returns ok:true with riskReviewId and correlationId.",
    inputSchema: mutationSchema({
      proposalId: { type: "string" },
      dataSensitivity: { type: "string", enum: ["low", "medium", "high", "blocked"] },
      externalSharing: { type: "string", enum: ["low", "medium", "high", "blocked"] },
      automationLevel: { type: "string", enum: ["assistive", "semi_automated", "autonomous"] },
      audienceScope: { type: "string", enum: ["individual", "team", "department", "enterprise", "external"] },
      usesCustomerData: { type: "boolean" },
      requiresHumanReview: { type: "boolean" }
    }, ["proposalId", "dataSensitivity", "externalSharing", "automationLevel", "audienceScope", "usesCustomerData", "requiresHumanReview"])
  },
  {
    name: "submit_capability_review",
    description: "Write a review queue item for a scored proposal. Only report success after the tool returns ok:true with reviewItemId, status, and correlationId.",
    inputSchema: mutationSchema({
      proposalId: { type: "string" },
      reviewer: { type: "string" },
      dueDate: { type: "string" }
    }, ["proposalId", "reviewer", "dueDate"])
  },
  {
    name: "approve_capability",
    description: "Write reviewer approval for a proposal. Only report success after the tool returns ok:true with capabilityId, status, and correlationId.",
    inputSchema: mutationSchema({
      proposalId: { type: "string" },
      reviewer: { type: "string" },
      approvalNotes: { type: "string" }
    }, ["proposalId", "reviewer", "approvalNotes"])
  },
  {
    name: "reject_capability",
    description: "Write reviewer rejection for a proposal. Only report success after the tool returns ok:true with proposalId, status, and correlationId.",
    inputSchema: mutationSchema({
      proposalId: { type: "string" },
      reviewer: { type: "string" },
      reason: { type: "string" },
      nextAction: { type: "string" }
    }, ["proposalId", "reviewer", "reason", "nextAction"])
  },
  {
    name: "release_capability",
    description: "Write release state for an approved capability and create a release packet. Only report success after the tool returns ok:true with releasePacketId, status, and correlationId.",
    inputSchema: mutationSchema({
      capabilityId: { type: "string" },
      releasedBy: { type: "string" },
      audience: { type: "string", enum: ["individual", "team", "department", "enterprise", "external"] },
      version: { type: "string" }
    }, ["capabilityId", "releasedBy", "audience", "version"])
  },
  {
    name: "generate_release_packet",
    description: "Read an audit-safe release packet for a capability. Returns summaries and metadata only.",
    inputSchema: schema({
      capabilityId: { type: "string" }
    }, ["capabilityId"]),
    annotations: { readOnlyHint: true }
  },
  {
    name: "generate_capability_map",
    description: "Read Signal Atlas graph data for roles, work signals, capabilities, risk gates, reviews, and released workflows.",
    inputSchema: schema({
      filters: { type: "object", additionalProperties: true }
    }, []),
    annotations: { readOnlyHint: true }
  },
  {
    name: "list_mcp_activity",
    description: "Read sanitized MCP activity for the Foundry Floor rail. Use this to verify writes before claiming registry state changed.",
    inputSchema: schema({
      limit: { type: "integer", minimum: 1, maximum: 100 }
    }, []),
    annotations: { readOnlyHint: true }
  }
];
