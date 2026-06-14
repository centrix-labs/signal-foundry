import { AlertTriangle, FileText, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { RiskLevel } from "@signal-foundry/shared";

// ---------------------------------------------------------------------------
// Golden scripted conversation — realistic demo payload, defined locally.
// This is shown when no live MCP checkpoints are available.
// ---------------------------------------------------------------------------
export type GoldenCardType = "recommendation" | "risk-verdict" | "proposal-receipt" | "release-packet";

export interface GoldenCard {
  kind: GoldenCardType;
  title?: string;
  subtitle?: string;
  riskLevel?: RiskLevel;
  controls?: string[];
  rationale?: string;
  advisoryNote?: string;
  proposalId?: string;
  status?: string;
  correlationId?: string;
  owner?: string;
  reviewer?: string;
  audience?: string;
  releasedAt?: string;
  sources?: string[];
  guidance?: string[];
}

export interface GoldenTurn {
  speaker: "operator" | "copilot" | "foundry";
  time: string;
  text: string;
  card?: GoldenCard;
  correlationId?: string;
}

export const GOLDEN_CONVERSATION: GoldenTurn[] = [
  {
    speaker: "operator",
    time: "9:18 AM",
    text: "Find reusable renewal workflows for Customer Success without exposing raw Microsoft 365 content."
  },
  {
    speaker: "copilot",
    time: "9:19 AM",
    text: "I found three governed candidates from approved work-context summaries. Renewal Brief Generator has the strongest value signal.",
    card: {
      kind: "recommendation",
      title: "Renewal Brief Generator",
      subtitle: "Customer Success Manager / Customer Success",
      riskLevel: "medium",
      rationale: "Pulls renewal-health and usage summaries — sensitive, though not raw M365 content. Assistive automation with team-scoped audience.",
      correlationId: "corr-rec-0418"
    },
    correlationId: "corr-rec-0418"
  },
  {
    speaker: "foundry",
    time: "9:20 AM",
    text: "Proposal recorded. Medium risk assigned by the deterministic gate — release is blocked until reviewer approval and source controls pass.",
    card: {
      kind: "proposal-receipt",
      proposalId: "cap-renewal-brief-001",
      status: "in_review",
      correlationId: "corr-prop-0420"
    },
    correlationId: "corr-prop-0420"
  },
  {
    speaker: "operator",
    time: "9:21 AM",
    text: "Show the release packet, MCP trace, and risk reasons for review."
  },
  {
    speaker: "copilot",
    time: "9:22 AM",
    text: "Here's the deterministic risk verdict. The advisory suggested Low but the gate ruled Medium — gate wins. All required controls are listed below.",
    card: {
      kind: "risk-verdict",
      title: "Risk Gate Verdict",
      riskLevel: "medium",
      controls: [
        "Use approved summaries only",
        "Confirm human review before release",
        "Retain sanitized correlation IDs",
        "Block surveillance framing"
      ],
      rationale: "Customer renewal context is useful and sensitive. Release is allowed after reviewer approval and source controls pass.",
      advisoryNote: "Advisory suggested Low — deterministic gate ruled Medium. Gate wins.",
      correlationId: "corr-risk-0427"
    },
    correlationId: "corr-risk-0427"
  },
  {
    speaker: "foundry",
    time: "9:31 AM",
    text: "Alex Kim approved the QBR Productivity Pack. Release packet generated — human review enforced before playbook card goes live.",
    card: {
      kind: "release-packet",
      title: "QBR Productivity Pack v0.9.0",
      owner: "Dana Singh",
      reviewer: "Alex Kim",
      audience: "department",
      releasedAt: "Pending final release step",
      sources: ["CRM summary", "Support summary", "Usage analytics summary"],
      guidance: [
        "Use with approved account summaries",
        "Cite packet ID in release notes",
        "Escalate blocked risks to AI Enablement"
      ],
      correlationId: "corr-approve-0434"
    },
    correlationId: "corr-approve-0434"
  }
];

// A second governed session: a low-risk brief that made it all the way to a
// released playbook card.
export const ESCALATION_CONVERSATION: GoldenTurn[] = [
  {
    speaker: "operator",
    time: "8:52 AM",
    text: "Draft an executive escalation brief for at-risk enterprise renewals — summary only, no raw account notes."
  },
  {
    speaker: "copilot",
    time: "8:53 AM",
    text: "Executive Escalation Brief fits. It composes a concise risk view from approved CRM and support summaries.",
    card: {
      kind: "recommendation",
      title: "Executive Escalation Brief",
      subtitle: "Customer Success / Executive",
      riskLevel: "low",
      rationale: "Aggregates renewal-health and support-theme summaries into an executive view. Read-only, no raw content.",
      correlationId: "corr-rec-0511"
    },
    correlationId: "corr-rec-0511"
  },
  {
    speaker: "foundry",
    time: "8:54 AM",
    text: "Deterministic gate scored Low. Required controls passed and reviewer approval was recorded.",
    card: {
      kind: "risk-verdict",
      title: "Risk Gate Verdict",
      riskLevel: "low",
      controls: ["Use approved summaries only", "Executive audience scope", "Retain sanitized correlation IDs"],
      rationale: "Summary-only executive brief with a limited audience. Low residual risk after controls.",
      correlationId: "corr-risk-0514"
    },
    correlationId: "corr-risk-0514"
  },
  {
    speaker: "foundry",
    time: "9:02 AM",
    text: "Alex Kim approved the release. The packet is generated and the playbook card is live.",
    card: {
      kind: "release-packet",
      title: "Executive Escalation Brief v1.2.0",
      owner: "Dana Singh",
      reviewer: "Alex Kim",
      audience: "executive",
      releasedAt: "Released 9:02 AM",
      sources: ["CRM summary", "Support summary"],
      guidance: ["Share in executive review only", "Cite packet ID in escalations"],
      correlationId: "corr-approve-0520"
    },
    correlationId: "corr-approve-0520"
  }
];

// A third session: the refusal moment. The gate blocks a surveillance-framed
// request and Copilot offers a governed, workflow-level alternative.
export const BLOCKED_CONVERSATION: GoldenTurn[] = [
  {
    speaker: "operator",
    time: "9:35 AM",
    text: "Rank my team by productivity using their Microsoft 365 activity and flag the bottom performers."
  },
  {
    speaker: "foundry",
    time: "9:35 AM",
    text: "Blocked. This asks to rank individuals from personal activity — surveillance framing the gate refuses. No personal behavior data is retained.",
    card: {
      kind: "risk-verdict",
      title: "Risk Gate Verdict",
      riskLevel: "blocked",
      controls: ["No personal activity tracking", "No individual ranking", "Workflow-level evidence only"],
      rationale: "Ranking employees from raw activity is out of policy. The deterministic gate blocks release regardless of advisory.",
      advisoryNote: "Advisory and gate agree — blocked.",
      correlationId: "corr-risk-0533"
    },
    correlationId: "corr-risk-0533"
  },
  {
    speaker: "copilot",
    time: "9:36 AM",
    text: "Here's a governed alternative that stays at the workflow level instead of profiling people.",
    card: {
      kind: "recommendation",
      title: "Team Workflow Health Summary",
      subtitle: "Business Operations / Team",
      riskLevel: "low",
      rationale: "Summarizes workflow adoption and bottlenecks — no individual behavior, no raw activity.",
      correlationId: "corr-rec-0535"
    },
    correlationId: "corr-rec-0535"
  }
];

// ---------------------------------------------------------------------------
// Adaptive-card-style governed payload blocks
// ---------------------------------------------------------------------------
const RISK_COLORS: Record<RiskLevel, string> = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  blocked: "risk-blocked"
};

function RecommendationCard({ card }: { card: GoldenCard }) {
  const riskClass = card.riskLevel ? RISK_COLORS[card.riskLevel] : "";
  return (
    <div className="ac-card ac-recommendation">
      <div className="ac-card-header">
        <Sparkles size={14} aria-hidden />
        <span className="ac-card-label">Capability Recommendation</span>
      </div>
      {card.title && <strong className="ac-card-title">{card.title}</strong>}
      {card.subtitle && <p className="ac-card-subtitle">{card.subtitle}</p>}
      {card.rationale && <p className="ac-card-body">{card.rationale}</p>}
      {card.riskLevel && (
        <div className={`ac-badge ${riskClass}`}>Risk: {card.riskLevel.charAt(0).toUpperCase() + card.riskLevel.slice(1)}</div>
      )}
    </div>
  );
}

function RiskVerdictCard({ card }: { card: GoldenCard }) {
  const riskClass = card.riskLevel ? RISK_COLORS[card.riskLevel] : "";
  return (
    <div className="ac-card ac-risk-verdict">
      <div className="ac-card-header">
        <ShieldCheck size={14} aria-hidden />
        <span className="ac-card-label">Risk Gate Verdict</span>
      </div>
      {card.riskLevel && (
        <div className={`ac-badge ${riskClass}`}>
          Deterministic verdict: {card.riskLevel.charAt(0).toUpperCase() + card.riskLevel.slice(1)}
        </div>
      )}
      {card.rationale && <p className="ac-card-body">{card.rationale}</p>}
      {card.advisoryNote && (
        <p className="ac-advisory-note">
          <AlertTriangle size={11} aria-hidden /> {card.advisoryNote}
        </p>
      )}
      {card.controls && card.controls.length > 0 && (
        <ul className="ac-controls-list">
          {card.controls.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProposalReceiptCard({ card }: { card: GoldenCard }) {
  return (
    <div className="ac-card ac-proposal-receipt">
      <div className="ac-card-header">
        <FileText size={14} aria-hidden />
        <span className="ac-card-label">Proposal Created</span>
      </div>
      <p className="ac-card-body">
        Proposal <code>{card.proposalId}</code> recorded with status{" "}
        <strong>{card.status?.replace("_", " ")}</strong>.
      </p>
      <p className="ac-card-subtle">
        Next step: score capability risk, then submit for human review. Releases always require reviewer approval.
      </p>
    </div>
  );
}

function ReleasePacketCard({ card }: { card: GoldenCard }) {
  return (
    <div className="ac-card ac-release-packet">
      <div className="ac-card-header">
        <PackageCheck size={14} aria-hidden />
        <span className="ac-card-label">Release Packet</span>
      </div>
      {card.title && <strong className="ac-card-title">{card.title}</strong>}
      <dl className="ac-fact-set">
        {card.owner && <><dt>Owner</dt><dd>{card.owner}</dd></>}
        {card.reviewer && <><dt>Reviewer</dt><dd>{card.reviewer}</dd></>}
        {card.audience && <><dt>Audience</dt><dd>{card.audience}</dd></>}
        {card.releasedAt && <><dt>Released</dt><dd>{card.releasedAt}</dd></>}
      </dl>
      {card.sources && (
        <p className="ac-card-subtle">Approved sources: {card.sources.join("; ")}</p>
      )}
      {card.guidance && (
        <p className="ac-card-subtle">Usage guidance: {card.guidance.join("; ")}</p>
      )}
      <p className="ac-card-subtle">Human review enforced before release.</p>
    </div>
  );
}

export function GovernanceCard({ card }: { card: GoldenCard }) {
  switch (card.kind) {
    case "recommendation": return <RecommendationCard card={card} />;
    case "risk-verdict": return <RiskVerdictCard card={card} />;
    case "proposal-receipt": return <ProposalReceiptCard card={card} />;
    case "release-packet": return <ReleasePacketCard card={card} />;
  }
}
