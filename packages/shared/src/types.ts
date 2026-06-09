export type Role = "employee" | "reviewer" | "admin";
export type CapabilityStatus =
  | "approved"
  | "candidate"
  | "proposed"
  | "risk_scored"
  | "in_review"
  | "approved_for_release"
  | "released"
  | "rejected"
  | "blocked";
export type RiskLevel = "low" | "medium" | "high" | "blocked";
export type AutomationLevel = "assistive" | "semi_automated" | "autonomous";
export type AudienceScope = "individual" | "team" | "department" | "enterprise" | "external";
export type McpAction =
  | "search_capabilities"
  | "recommend_capabilities_for_role"
  | "get_user_work_context"
  | "create_capability_proposal"
  | "score_capability_risk"
  | "submit_capability_review"
  | "approve_capability"
  | "reject_capability"
  | "release_capability"
  | "generate_release_packet"
  | "generate_capability_map"
  | "list_mcp_activity";

export interface ScopedRequest {
  tenantId: string;
  projectId: string;
  correlationId?: string;
}

export interface Actor {
  id: string;
  name: string;
  role: Role;
  department: string;
}

export interface Capability {
  id: string;
  title: string;
  description: string;
  role: string;
  department: string;
  owner: string;
  intendedAudience: AudienceScope;
  inputsRequired: string[];
  proposedOutputs: string[];
  sourceSummary: string;
  approvedSourceTypes: string[];
  status: CapabilityStatus;
  riskLevel: RiskLevel;
  version: string;
  updatedAt: string;
}

export interface CapabilityProposal extends Omit<Capability, "id" | "status" | "riskLevel" | "version" | "approvedSourceTypes" | "updatedAt"> {
  id: string;
  status: CapabilityStatus;
  createdBy: string;
  createdAt: string;
  correlationId: string;
}

export interface RiskReview {
  id: string;
  proposalId: string;
  riskLevel: RiskLevel;
  dataSensitivity: RiskLevel;
  externalSharing: RiskLevel;
  automationLevel: AutomationLevel;
  audienceScope: AudienceScope;
  usesCustomerData: boolean;
  requiresHumanReview: boolean;
  requiredControls: string[];
  rationale: string;
  createdAt: string;
  correlationId: string;
}

export interface ReviewItem {
  id: string;
  proposalId: string;
  reviewer: string;
  dueDate: string;
  status: "pending" | "approved" | "changes_requested" | "rejected";
  recommendedDecision: RiskLevel;
  createdAt: string;
  correlationId: string;
}

export interface ReleasePacket {
  id: string;
  capabilityId: string;
  version: string;
  owner: string;
  approvedAudience: AudienceScope;
  approvedSourceTypes: string[];
  requiredHumanReview: boolean;
  usageGuidance: string[];
  reviewer: string;
  releasedAt: string;
  correlationId: string;
}

export interface McpActivity {
  id: string;
  action: McpAction;
  actor: string;
  recordId: string;
  status: "success" | "rejected" | "warning";
  timestamp: string;
  correlationId: string;
  summary: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  targetRecord: string;
  timestamp: string;
  correlationId: string;
}

export interface DemoScope {
  companyName: string;
  tenantId: string;
  projectId: string;
  businessDomain: string;
}

export interface AtlasNode {
  id: string;
  label: string;
  kind: "signal" | "role" | "risk_gate" | "workflow" | "department";
  riskLevel?: RiskLevel;
  status?: CapabilityStatus;
}

export interface AtlasEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  kind: "signal_flow" | "approval_path" | "risk_gate" | "ownership";
}

export interface SignalFoundryRegistry {
  demoScope: DemoScope;
  actors: Actor[];
  capabilities: Capability[];
  proposals: CapabilityProposal[];
  riskReviews: RiskReview[];
  reviewItems: ReviewItem[];
  releasePackets: ReleasePacket[];
  mcpActivity: McpActivity[];
  auditEvents: AuditEvent[];
}
