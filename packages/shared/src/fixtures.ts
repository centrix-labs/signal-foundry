import type { DemoScope, SignalFoundryRegistry } from "./types";

const now = "2026-06-07T09:00:00.000Z";

export const demoScope: DemoScope = {
  companyName: "Asteria Dynamics",
  tenantId: "tenant-asteria-dynamics",
  projectId: "revenue-ops-launchpad",
  businessDomain: "Customer Success / Revenue Operations"
};

export const demoOperatingContract = [
  "Anchor the experience in Asteria Dynamics and the scoped demo defaults before using tools.",
  "Use Work IQ only as permission-aware job context or synthetic Work IQ-style summaries.",
  "Keep discovery, proposal, risk scoring, review, approval, and release as separate state transitions.",
  "Treat deterministic tool results as the source of truth and verify mutations with list_mcp_activity.",
  "Refuse surveillance or productivity-ranking requests and redirect to workflow-level improvement."
] as const;

export const demoRegistry: SignalFoundryRegistry = {
  demoScope,
  actors: [
    { id: "actor-priya", name: "Priya Shah", role: "employee", department: "Customer Success" },
    { id: "actor-alex", name: "Alex Kim", role: "reviewer", department: "AI Enablement" },
    { id: "actor-dana", name: "Dana Singh", role: "admin", department: "Office of the CIO" }
  ],
  capabilities: [
    {
      id: "cap-renewal-brief",
      title: "Renewal Brief Generator",
      description: "Creates an audit-safe renewal prep brief for Asteria Dynamics from approved account, meeting, and opportunity summaries.",
      role: "Enterprise Account Manager",
      department: "Customer Success",
      owner: "Priya Shah",
      intendedAudience: "team",
      inputsRequired: ["Account summary", "Renewal timeline", "Open support themes"],
      proposedOutputs: ["Renewal brief", "Risk summary", "Next-best actions"],
      sourceSummary: "Uses approved Asteria Dynamics summaries from CRM, meetings, and support systems. No raw message bodies.",
      approvedSourceTypes: ["CRM summary", "Meeting summary", "Support ticket summary"],
      status: "approved",
      riskLevel: "medium",
      version: "v1.0.0",
      updatedAt: now
    },
    {
      id: "cap-escalation-brief",
      title: "Executive Escalation Brief",
      description: "Assembles concise executive context for high-risk Asteria Dynamics customer renewals.",
      role: "Enterprise Account Manager",
      department: "Customer Success",
      owner: "Alex Kim",
      intendedAudience: "department",
      inputsRequired: ["Account health summary", "Approved risk notes"],
      proposedOutputs: ["Escalation brief", "Decision asks"],
      sourceSummary: "Uses summarized Asteria Dynamics account and risk signals only.",
      approvedSourceTypes: ["CRM summary", "Risk review summary"],
      status: "released",
      riskLevel: "medium",
      version: "v1.2.0",
      updatedAt: now
    }
  ],
  proposals: [],
  riskReviews: [],
  reviewItems: [],
  releasePackets: [],
  mcpActivity: [
    {
      id: "act-seed-001",
      action: "search_capabilities",
      actor: "Priya Shah",
      recordId: "cap-renewal-brief",
      status: "success",
      timestamp: now,
      correlationId: "corr-seed-001",
      summary: "Asteria Dynamics capability registry searched for Customer Success renewal workflows."
    }
  ],
  auditEvents: []
};

export const validProposalFixture = {
  tenantId: demoScope.tenantId,
  projectId: demoScope.projectId,
  idempotencyKey: "idem-renewal-brief-001",
  title: "Renewal Brief Generator",
  description: "Create a governed renewal brief from approved account and workflow summaries.",
  role: "Enterprise Account Manager",
  department: "Customer Success",
  owner: "Priya Shah",
  intendedAudience: "team",
  inputsRequired: ["Account summary", "Renewal timeline", "Risk themes"],
  proposedOutputs: ["Renewal brief", "Action plan"],
  sourceSummary: "Synthetic Asteria Dynamics Work IQ-style summaries from CRM, meetings, and support sources."
} as const;
