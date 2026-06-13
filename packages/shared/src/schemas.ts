import { z } from "zod";

// LLM clients (Copilot's model) sometimes serialize booleans as "True"/"false",
// arrays as JSON strings, and numbers as strings. Coerce the representation at
// the contract boundary without weakening the semantics: only exact true
// equivalents satisfy the confirmation gate.
const llmBoolean = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return value;
}, z.boolean());

const llmConfirmed = z.preprocess(
  (value) => (typeof value === "string" && value.trim().toLowerCase() === "true" ? true : value),
  z.literal(true)
);

const llmStringArray = (min: number) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value;
      }
    }
    return value;
  }, z.array(z.string().min(2)).min(min));

export const roleSchema = z.enum(["employee", "reviewer", "admin"]);
export const riskLevelSchema = z.enum(["low", "medium", "high", "blocked"]);
export const capabilityStatusSchema = z.enum([
  "approved",
  "candidate",
  "proposed",
  "risk_scored",
  "in_review",
  "approved_for_release",
  "released",
  "rejected",
  "blocked"
]);
export const automationLevelSchema = z.enum(["assistive", "semi_automated", "autonomous"]);
export const audienceScopeSchema = z.enum(["individual", "team", "department", "enterprise", "external"]);
export const copilotCheckpointSpeakerSchema = z.enum(["operator", "copilot", "foundry", "reviewer"]);
export const copilotCheckpointStageSchema = z.enum(["discovery", "proposal", "risk", "review", "approval", "release", "refusal"]);
export const copilotCheckpointSourceSchema = z.enum([
  "user_intent_summary",
  "tool_result_summary",
  "approval_result",
  "release_result",
  "refusal_summary"
]);
export const copilotCheckpointApprovalStateSchema = z.enum(["system_approved", "human_approved", "rejected_by_policy"]);

export const scopedRequestSchema = z.object({
  tenantId: z.string().min(3),
  projectId: z.string().min(3),
  correlationId: z.string().min(8).optional()
});

export const idempotentRequestSchema = scopedRequestSchema.extend({
  idempotencyKey: z.string().min(8),
  confirmed: llmConfirmed
});

export const searchCapabilitiesInputSchema = scopedRequestSchema.extend({
  query: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  status: capabilityStatusSchema.optional(),
  riskLevel: riskLevelSchema.optional()
});

export const recommendCapabilitiesForRoleInputSchema = scopedRequestSchema.extend({
  role: z.string().min(2),
  department: z.string().min(2),
  workSignalSummary: z.string().min(10),
  maxResults: z.coerce.number().int().min(1).max(8).default(5)
});

export const getUserWorkContextInputSchema = scopedRequestSchema.extend({
  requestedRole: z.string().min(2).optional(),
  requestedDepartment: z.string().min(2).optional(),
  sourceHint: z.enum(["graph_profile", "work_iq", "synthetic_demo"]).optional(),
  // Agent-supplied permission-aware summary fields only; raw Microsoft 365
  // content is rejected by length caps and never accepted by contract.
  workSummary: z.string().min(10).max(600).optional(),
  activeProjects: z.array(z.string().min(2).max(80)).max(5).optional(),
  recurringWorkflows: z.array(z.string().min(2).max(80)).max(5).optional()
});

export const createCapabilityProposalInputSchema = idempotentRequestSchema.extend({
  title: z.string().min(5),
  description: z.string().min(20),
  role: z.string().min(2),
  department: z.string().min(2),
  owner: z.string().min(2),
  intendedAudience: audienceScopeSchema,
  inputsRequired: llmStringArray(1),
  proposedOutputs: llmStringArray(1),
  sourceSummary: z.string().min(10)
});

export const scoreCapabilityRiskInputSchema = idempotentRequestSchema.extend({
  proposalId: z.string().min(6),
  dataSensitivity: riskLevelSchema,
  externalSharing: riskLevelSchema,
  automationLevel: automationLevelSchema,
  audienceScope: audienceScopeSchema,
  usesCustomerData: llmBoolean,
  requiresHumanReview: llmBoolean
});

export const submitCapabilityReviewInputSchema = idempotentRequestSchema.extend({
  proposalId: z.string().min(6),
  reviewer: z.string().min(2),
  dueDate: z.string().min(10)
});

export const approveCapabilityInputSchema = idempotentRequestSchema.extend({
  proposalId: z.string().min(6),
  reviewer: z.string().min(2),
  approvalNotes: z.string().min(5)
});

export const rejectCapabilityInputSchema = idempotentRequestSchema.extend({
  proposalId: z.string().min(6),
  reviewer: z.string().min(2),
  reason: z.string().min(5),
  nextAction: z.string().min(5)
});

export const releaseCapabilityInputSchema = idempotentRequestSchema.extend({
  capabilityId: z.string().min(6),
  releasedBy: z.string().min(2),
  audience: audienceScopeSchema,
  // LLM clients omit the v-prefix or the field entirely; coerce shape,
  // default the demo release version, keep the format contract.
  version: z.preprocess(
    (value) => {
      if (value == null || value === "") return "v1.0.0";
      if (typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value.trim())) return `v${value.trim()}`;
      return value;
    },
    z.string().regex(/^v\d+\.\d+\.\d+$/)
  )
});

export const recordCopilotCheckpointInputSchema = idempotentRequestSchema.extend({
  sessionId: z.string().min(8).max(120),
  speaker: copilotCheckpointSpeakerSchema,
  stage: copilotCheckpointStageSchema,
  source: copilotCheckpointSourceSchema,
  sourceTool: z.string().min(3).max(80).optional(),
  relatedRecordId: z.string().min(3).max(120).optional(),
  approvalState: copilotCheckpointApprovalStateSchema,
  actor: z.string().min(2).max(80),
  displayText: z.string().min(8).max(420)
});

export const generateReleasePacketInputSchema = scopedRequestSchema.extend({
  capabilityId: z.string().min(6)
});

export const generateCapabilityMapInputSchema = scopedRequestSchema.extend({
  filters: z
    .object({
      department: z.string().optional(),
      riskLevel: riskLevelSchema.optional(),
      status: capabilityStatusSchema.optional()
    })
    .default({})
});

export const listMcpActivityInputSchema = scopedRequestSchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

export const toolSchemas = {
  search_capabilities: searchCapabilitiesInputSchema,
  recommend_capabilities_for_role: recommendCapabilitiesForRoleInputSchema,
  get_user_work_context: getUserWorkContextInputSchema,
  create_capability_proposal: createCapabilityProposalInputSchema,
  score_capability_risk: scoreCapabilityRiskInputSchema,
  submit_capability_review: submitCapabilityReviewInputSchema,
  approve_capability: approveCapabilityInputSchema,
  reject_capability: rejectCapabilityInputSchema,
  release_capability: releaseCapabilityInputSchema,
  record_copilot_checkpoint: recordCopilotCheckpointInputSchema,
  generate_release_packet: generateReleasePacketInputSchema,
  generate_capability_map: generateCapabilityMapInputSchema,
  list_mcp_activity: listMcpActivityInputSchema
} as const;

export type ToolName = keyof typeof toolSchemas;
