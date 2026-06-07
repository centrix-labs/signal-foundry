import { z } from "zod";

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

export const scopedRequestSchema = z.object({
  tenantId: z.string().min(3),
  projectId: z.string().min(3),
  correlationId: z.string().min(8).optional()
});

export const idempotentRequestSchema = scopedRequestSchema.extend({
  idempotencyKey: z.string().min(8)
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
  maxResults: z.number().int().min(1).max(8).default(5)
});

export const createCapabilityProposalInputSchema = idempotentRequestSchema.extend({
  title: z.string().min(5),
  description: z.string().min(20),
  role: z.string().min(2),
  department: z.string().min(2),
  owner: z.string().min(2),
  intendedAudience: audienceScopeSchema,
  inputsRequired: z.array(z.string().min(2)).min(1),
  proposedOutputs: z.array(z.string().min(2)).min(1),
  sourceSummary: z.string().min(10)
});

export const scoreCapabilityRiskInputSchema = idempotentRequestSchema.extend({
  proposalId: z.string().min(6),
  dataSensitivity: riskLevelSchema,
  externalSharing: riskLevelSchema,
  automationLevel: automationLevelSchema,
  audienceScope: audienceScopeSchema,
  usesCustomerData: z.boolean(),
  requiresHumanReview: z.boolean()
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
  version: z.string().regex(/^v\d+\.\d+\.\d+$/)
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
  limit: z.number().int().min(1).max(100).default(25)
});

export const toolSchemas = {
  search_capabilities: searchCapabilitiesInputSchema,
  recommend_capabilities_for_role: recommendCapabilitiesForRoleInputSchema,
  create_capability_proposal: createCapabilityProposalInputSchema,
  score_capability_risk: scoreCapabilityRiskInputSchema,
  submit_capability_review: submitCapabilityReviewInputSchema,
  approve_capability: approveCapabilityInputSchema,
  reject_capability: rejectCapabilityInputSchema,
  release_capability: releaseCapabilityInputSchema,
  generate_release_packet: generateReleasePacketInputSchema,
  generate_capability_map: generateCapabilityMapInputSchema,
  list_mcp_activity: listMcpActivityInputSchema
} as const;

export type ToolName = keyof typeof toolSchemas;
