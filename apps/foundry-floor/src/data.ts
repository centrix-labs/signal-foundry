import { demoRegistry } from "@signal-foundry/shared";
import type {
  AtlasEdge,
  AtlasNode,
  AuditEvent,
  Capability,
  CapabilityStatus,
  McpActivity,
  ReleasePacket,
  ReviewItem,
  RiskLevel,
  RiskReview
} from "@signal-foundry/shared";

export type ViewKey = "floor" | "atlas" | "pipeline" | "review" | "mirror" | "executive";

export type PositionedNode = AtlasNode & {
  x: number;
  y: number;
  volume?: string;
};

export type Stage = {
  key: string;
  label: string;
  count: number;
  sublabel: string;
  tone: "live" | "pending" | "approved" | "blocked" | "quiet";
};

export type ControlCheck = {
  label: string;
  status: "passed" | "review" | "failed";
  evidence: string;
};

export type CopilotTurn = {
  speaker: "operator" | "copilot" | "foundry";
  time: string;
  text: string;
};

const now = "2026-06-07T09:41:00.000Z";
const [renewalBase, escalationBase] = demoRegistry.capabilities;

if (!renewalBase || !escalationBase) {
  throw new Error("Foundry Floor requires seeded shared capability fixtures.");
}

const renewal: Capability = {
  ...renewalBase,
  status: "in_review",
  riskLevel: "medium",
  updatedAt: now
};

const escalation: Capability = {
  ...escalationBase,
  status: "released",
  updatedAt: "2026-06-07T09:16:00.000Z"
};

const qbr: Capability = {
  id: "cap-qbr-pack",
  title: "QBR Productivity Pack",
  description: "Prepares approved QBR sections from summarized renewal, support, and usage context.",
  role: "Customer Success Manager",
  department: "Customer Success",
  owner: "Dana Singh",
  intendedAudience: "department",
  inputsRequired: ["Renewal health summary", "Usage trend summary", "Support theme summary"],
  proposedOutputs: ["QBR outline", "Risk appendix", "Executive talking points"],
  sourceSummary: "Synthetic Work IQ-style summaries only; no raw emails, chats, files, or notes.",
  approvedSourceTypes: ["CRM summary", "Support summary", "Usage analytics summary"],
  status: "approved_for_release",
  riskLevel: "low",
  version: "v0.9.0",
  updatedAt: "2026-06-07T09:28:00.000Z"
};

const blocked: Capability = {
  id: "cap-monitoring-refusal",
  title: "Employee Monitoring Request",
  description: "Rejected framing attempted to rank employee activity. Foundry preserves only workflow-level capability evidence.",
  role: "Operations Lead",
  department: "Business Operations",
  owner: "Signal Foundry",
  intendedAudience: "team",
  inputsRequired: ["Workflow summary"],
  proposedOutputs: ["Governed capability alternative"],
  sourceSummary: "No personal behavior tracking or raw activity is retained.",
  approvedSourceTypes: ["Policy summary"],
  status: "blocked",
  riskLevel: "blocked",
  version: "v0.0.0",
  updatedAt: "2026-06-07T09:35:00.000Z"
};

export const capabilities = [renewal, escalation, qbr, blocked] as const;

export const releaseStages: Stage[] = [
  { key: "discovered", label: "Discovered", count: 138, sublabel: "work signals", tone: "live" },
  { key: "proposed", label: "Proposed", count: 42, sublabel: "candidate workflows", tone: "live" },
  { key: "risk", label: "Risk Scored", count: 17, sublabel: "control checks", tone: "pending" },
  { key: "review", label: "In Review", count: 3, sublabel: "human decisions", tone: "pending" },
  { key: "approved", label: "Approved", count: 6, sublabel: "release packets", tone: "approved" },
  { key: "released", label: "Released", count: 3, sublabel: "playbook cards", tone: "approved" }
];

export const factoryStages: Stage[] = [
  { key: "ingest", label: "01 Ingest", count: 12, sublabel: "queued", tone: "live" },
  { key: "process", label: "02 Process", count: 8, sublabel: "running", tone: "live" },
  { key: "enrich", label: "03 Enrich", count: 5, sublabel: "context ready", tone: "live" },
  { key: "gate", label: "04 Risk Gate", count: 3, sublabel: "pending", tone: "pending" },
  { key: "approve", label: "05 Approve", count: 2, sublabel: "in review", tone: "pending" },
  { key: "release", label: "06 Release", count: 1, sublabel: "deploying", tone: "approved" },
  { key: "monitor", label: "07 Monitor", count: 3, sublabel: "live", tone: "approved" }
];

export const riskReview: RiskReview = {
  id: "risk-renewal-001",
  proposalId: renewal.id,
  riskLevel: "medium",
  dataSensitivity: "medium",
  externalSharing: "low",
  automationLevel: "assistive",
  audienceScope: "team",
  usesCustomerData: true,
  requiresHumanReview: true,
  requiredControls: [
    "Use approved summaries only",
    "Confirm human review before release",
    "Retain sanitized correlation IDs",
    "Block surveillance framing"
  ],
  rationale: "Customer renewal context is useful and sensitive. The workflow can release after reviewer approval and source controls pass.",
  createdAt: "2026-06-07T09:22:00.000Z",
  correlationId: "corr-risk-0427"
};

export const reviewItems: ReviewItem[] = [
  {
    id: "rev-renewal-001",
    proposalId: renewal.id,
    reviewer: "Alex Kim",
    dueDate: "2026-06-07",
    status: "pending",
    recommendedDecision: "medium",
    createdAt: "2026-06-07T09:24:00.000Z",
    correlationId: "corr-review-0428"
  },
  {
    id: "rev-qbr-001",
    proposalId: qbr.id,
    reviewer: "Alex Kim",
    dueDate: "2026-06-08",
    status: "approved",
    recommendedDecision: "low",
    createdAt: "2026-06-07T09:29:00.000Z",
    correlationId: "corr-review-0432"
  },
  {
    id: "rev-blocked-001",
    proposalId: blocked.id,
    reviewer: "Alex Kim",
    dueDate: "2026-06-07",
    status: "rejected",
    recommendedDecision: "blocked",
    createdAt: "2026-06-07T09:36:00.000Z",
    correlationId: "corr-review-0440"
  }
];

export const releasePackets: ReleasePacket[] = [
  {
    id: "packet-renewal-001",
    capabilityId: renewal.id,
    version: "v1.0.0",
    owner: renewal.owner,
    approvedAudience: "team",
    approvedSourceTypes: renewal.approvedSourceTypes,
    requiredHumanReview: true,
    usageGuidance: ["Use with approved account summaries", "Cite packet ID in release notes", "Escalate blocked risks to AI Enablement"],
    reviewer: "Alex Kim",
    releasedAt: "Pending reviewer approval",
    correlationId: "corr-packet-0429"
  },
  {
    id: "packet-escalation-001",
    capabilityId: escalation.id,
    version: escalation.version,
    owner: escalation.owner,
    approvedAudience: "department",
    approvedSourceTypes: escalation.approvedSourceTypes,
    requiredHumanReview: true,
    usageGuidance: ["Use for high-risk renewals", "Keep customer context summarized", "Route release changes through review queue"],
    reviewer: "Maya R.",
    releasedAt: "2026-06-07T09:16:00.000Z",
    correlationId: "corr-release-0419"
  }
];

export const controlChecks: ControlCheck[] = [
  { label: "Data classification verified", status: "passed", evidence: "12 required checks passed" },
  { label: "PII handling constrained", status: "review", evidence: "Summary-only policy warning" },
  { label: "Access controls validated", status: "passed", evidence: "Tenant boundary confirmed" },
  { label: "Prompt injection tested", status: "passed", evidence: "24 synthetic probes passed" },
  { label: "Human-in-the-loop confirmed", status: "passed", evidence: "Release disabled until approval" },
  { label: "Anti-surveillance refusal", status: "passed", evidence: "Blocked employee-monitoring framing" }
];

export const mcpActivity: McpActivity[] = [
  ...demoRegistry.mcpActivity,
  {
    id: "act-002",
    action: "recommend_capabilities_for_role",
    actor: "Copilot runtime",
    recordId: renewal.id,
    status: "success",
    timestamp: "2026-06-07T09:18:00.000Z",
    correlationId: "corr-rec-0418",
    summary: "Read approved role summaries for Customer Success renewal workflow discovery."
  },
  {
    id: "act-003",
    action: "create_capability_proposal",
    actor: "Priya Shah",
    recordId: renewal.id,
    status: "success",
    timestamp: "2026-06-07T09:20:00.000Z",
    correlationId: "corr-prop-0420",
    summary: "Wrote proposal record with idempotency key idem-renewal-brief-001."
  },
  {
    id: "act-004",
    action: "score_capability_risk",
    actor: "Policy Engine",
    recordId: renewal.id,
    status: "warning",
    timestamp: "2026-06-07T09:22:00.000Z",
    correlationId: riskReview.correlationId,
    summary: "Risk scored medium; human review and summary-only source controls required."
  },
  {
    id: "act-005",
    action: "approve_capability",
    actor: "Alex Kim",
    recordId: qbr.id,
    status: "success",
    timestamp: "2026-06-07T09:31:00.000Z",
    correlationId: "corr-approve-0434",
    summary: "Reviewer approved QBR Productivity Pack for release preparation."
  },
  {
    id: "act-006",
    action: "release_capability",
    actor: "Release Pipeline",
    recordId: escalation.id,
    status: "success",
    timestamp: "2026-06-07T09:36:00.000Z",
    correlationId: "corr-release-0419",
    summary: "Released Executive Escalation Brief as an approved playbook card."
  },
  {
    id: "act-007",
    action: "list_mcp_activity",
    actor: "External requester",
    recordId: "auth-boundary",
    status: "rejected",
    timestamp: "2026-06-07T09:39:00.000Z",
    correlationId: "corr-auth-0442",
    summary: "Unauthorized MCP access rejected. Sanitized error: access boundary not satisfied."
  }
];

export const auditEvents: AuditEvent[] = [
  { id: "aud-001", actor: "Priya Shah", action: "proposal.created", targetRecord: renewal.id, timestamp: "2026-06-07T09:20:00.000Z", correlationId: "corr-prop-0420" },
  { id: "aud-002", actor: "Policy Engine", action: "risk.scored", targetRecord: renewal.id, timestamp: riskReview.createdAt, correlationId: riskReview.correlationId },
  { id: "aud-003", actor: "Alex Kim", action: "review.approved", targetRecord: qbr.id, timestamp: "2026-06-07T09:31:00.000Z", correlationId: "corr-approve-0434" },
  { id: "aud-004", actor: "OAuth boundary", action: "mcp.rejected", targetRecord: "auth-boundary", timestamp: "2026-06-07T09:39:00.000Z", correlationId: "corr-auth-0442" }
];

export const atlasNodes: PositionedNode[] = [
  { id: "sig-crm", label: "CRM summary", kind: "signal", x: 12, y: 30, volume: "410K/day" },
  { id: "sig-meetings", label: "Meeting summary", kind: "signal", x: 12, y: 49, volume: "1.2M/day" },
  { id: "sig-support", label: "Support themes", kind: "signal", x: 12, y: 68, volume: "982K/day" },
  { id: "role-ae", label: "Account Manager", kind: "role", x: 32, y: 34, volume: "4,921 signals" },
  { id: "role-csm", label: "CS Manager", kind: "role", x: 32, y: 64, volume: "3,106 signals" },
  { id: "forge", label: "Signal Foundry", kind: "department", x: 52, y: 49, volume: "Forge. Verify. Release." },
  { id: "gate-risk", label: "Risk Gate", kind: "risk_gate", x: 67, y: 49, riskLevel: "medium" },
  { id: renewal.id, label: renewal.title, kind: "workflow", x: 82, y: 30, riskLevel: renewal.riskLevel, status: renewal.status },
  { id: escalation.id, label: escalation.title, kind: "workflow", x: 82, y: 49, riskLevel: escalation.riskLevel, status: escalation.status },
  { id: qbr.id, label: qbr.title, kind: "workflow", x: 82, y: 68, riskLevel: qbr.riskLevel, status: qbr.status }
];

export const atlasEdges: AtlasEdge[] = [
  { id: "edge-1", source: "sig-crm", target: "role-ae", label: "grounding", kind: "signal_flow" },
  { id: "edge-2", source: "sig-meetings", target: "role-ae", label: "context", kind: "signal_flow" },
  { id: "edge-3", source: "sig-support", target: "role-csm", label: "themes", kind: "signal_flow" },
  { id: "edge-4", source: "role-ae", target: "forge", label: "proposal", kind: "signal_flow" },
  { id: "edge-5", source: "role-csm", target: "forge", label: "proposal", kind: "signal_flow" },
  { id: "edge-6", source: "forge", target: "gate-risk", label: "controls", kind: "risk_gate" },
  { id: "edge-7", source: "gate-risk", target: renewal.id, label: "review", kind: "approval_path" },
  { id: "edge-8", source: "gate-risk", target: escalation.id, label: "release", kind: "approval_path" },
  { id: "edge-9", source: "gate-risk", target: qbr.id, label: "packet", kind: "approval_path" }
];

export const copilotTurns: CopilotTurn[] = [
  { speaker: "operator", time: "9:18", text: "Find reusable renewal workflows for Customer Success without exposing raw Microsoft 365 content." },
  { speaker: "copilot", time: "9:19", text: "I found three governed candidates from approved work-context summaries. Renewal Brief Generator has the strongest value signal." },
  { speaker: "foundry", time: "9:20", text: "Proposal created, medium risk assigned, release is blocked until reviewer approval and controls pass." },
  { speaker: "operator", time: "9:21", text: "Show the release packet, MCP trace, and risk reasons for review." }
];

export const statusLabels: Record<CapabilityStatus, string> = {
  approved: "Approved",
  candidate: "Discovered",
  proposed: "Proposed",
  risk_scored: "Risk Scored",
  in_review: "In Review",
  approved_for_release: "Approved",
  released: "Released",
  rejected: "Rejected",
  blocked: "Blocked"
};

export const riskLabels: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  blocked: "Blocked"
};
