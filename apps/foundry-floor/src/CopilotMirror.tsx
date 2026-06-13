import { Send, AlertTriangle, ShieldCheck, PackageCheck, Sparkles, X, FileText } from "lucide-react";
import type { Capability, CopilotCheckpoint, RiskLevel } from "@signal-foundry/shared";
import { capabilities, type CopilotTurn } from "./data";
import { McpActivityRail, ReleasePacketDrawer, RiskGate } from "./panels";
import { SignalAtlas } from "./visuals";

// ---------------------------------------------------------------------------
// Golden scripted conversation — realistic demo payload, defined locally.
// This is shown when no live MCP checkpoints are available.
// ---------------------------------------------------------------------------
type GoldenCardType = "recommendation" | "risk-verdict" | "proposal-receipt" | "release-packet";

interface GoldenCard {
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

interface GoldenTurn {
  speaker: "operator" | "copilot" | "foundry";
  time: string;
  text: string;
  card?: GoldenCard;
  correlationId?: string;
}

const GOLDEN_CONVERSATION: GoldenTurn[] = [
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

function GovernanceCard({ card }: { card: GoldenCard }) {
  switch (card.kind) {
    case "recommendation": return <RecommendationCard card={card} />;
    case "risk-verdict": return <RiskVerdictCard card={card} />;
    case "proposal-receipt": return <ProposalReceiptCard card={card} />;
    case "release-packet": return <ReleasePacketCard card={card} />;
  }
}

// ---------------------------------------------------------------------------
// Bubble components
// ---------------------------------------------------------------------------
function OperatorBubble({ turn }: { turn: GoldenTurn }) {
  return (
    <div className="chat-row chat-row--operator">
      <div className="chat-bubble-wrap chat-bubble-wrap--operator">
        <div className="chat-bubble chat-bubble--operator">
          <p>{turn.text}</p>
        </div>
        <time className="chat-meta chat-meta--operator">{turn.time}</time>
      </div>
      <div className="chat-avatar chat-avatar--operator" aria-label="Operator">
        OP
      </div>
    </div>
  );
}

function AssistantBubble({
  turn,
  avatarLabel,
  avatarClass
}: {
  turn: GoldenTurn;
  avatarLabel: string;
  avatarClass: string;
}) {
  return (
    <div className="chat-row chat-row--assistant">
      <div className={`chat-avatar ${avatarClass}`} aria-label={avatarLabel}>
        {avatarLabel === "Copilot" ? (
          <Sparkles size={13} aria-hidden />
        ) : (
          <ShieldCheck size={13} aria-hidden />
        )}
      </div>
      <div className="chat-bubble-wrap chat-bubble-wrap--assistant">
        <div className={`chat-bubble chat-bubble--assistant ${avatarClass}`}>
          <p>{turn.text}</p>
          {turn.card && <GovernanceCard card={turn.card} />}
        </div>
        <div className="chat-meta">
          <time>{turn.time}</time>
          {turn.correlationId && (
            <span className="chat-corr-id" title="Audit correlation ID">
              {turn.correlationId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveCheckpointBubble({ checkpoint }: { checkpoint: CopilotCheckpoint }) {
  const isOperator = checkpoint.speaker === "operator";
  const time = formatTime(checkpoint.createdAt);

  if (isOperator) {
    return (
      <div className="chat-row chat-row--operator">
        <div className="chat-bubble-wrap chat-bubble-wrap--operator">
          <div className="chat-bubble chat-bubble--operator">
            <p>{checkpoint.displayText}</p>
          </div>
          <time className="chat-meta chat-meta--operator">{time}</time>
        </div>
        <div className="chat-avatar chat-avatar--operator" aria-label="Operator">OP</div>
      </div>
    );
  }

  const avatarClass = checkpoint.speaker === "copilot" ? "chat-avatar--copilot" : "chat-avatar--foundry";
  const avatarLabel = checkpoint.speaker === "copilot" ? "Copilot" : "Foundry";
  const evidence = [checkpoint.stage, checkpoint.sourceTool].filter(Boolean).join(" / ");

  return (
    <div className="chat-row chat-row--assistant">
      <div className={`chat-avatar ${avatarClass}`} aria-label={avatarLabel}>
        {checkpoint.speaker === "copilot" ? (
          <Sparkles size={13} aria-hidden />
        ) : (
          <ShieldCheck size={13} aria-hidden />
        )}
      </div>
      <div className="chat-bubble-wrap chat-bubble-wrap--assistant">
        <div className={`chat-bubble chat-bubble--assistant ${avatarClass}`}>
          <p>{checkpoint.displayText}</p>
          {evidence && <p className="chat-evidence-inline" style={{ overflowWrap: "anywhere" }}>{evidence}</p>}
        </div>
        <div className="chat-meta">
          <time>{time}</time>
          <span className="chat-corr-id" title="Audit correlation ID">
            {checkpoint.correlationId}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composer — inert demo input
// ---------------------------------------------------------------------------
const SUGGESTION_CHIPS = [
  "Show release packet",
  "Explain risk controls",
  "List approved sources"
];

function ChatComposer() {
  return (
    <div className="chat-composer" role="group" aria-label="Message Copilot (demo — input disabled)">
      <div className="chat-composer-chips">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chat-chip"
            disabled
            aria-disabled="true"
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="chat-composer-row">
        <input
          className="chat-composer-input"
          type="text"
          placeholder="Message Copilot…"
          disabled
          aria-disabled="true"
          aria-label="Message input (disabled in demo)"
        />
        <span
          style={{
            alignSelf: "center",
            color: "var(--steel)",
            fontSize: "0.7rem",
            fontStyle: "italic",
            opacity: 0.72,
            paddingInlineEnd: "6px",
            whiteSpace: "nowrap"
          }}
          aria-hidden
        >
          Demo · read-only
        </span>
        <button
          type="button"
          className="chat-send-btn"
          disabled
          aria-disabled="true"
          aria-label="Send message (disabled in demo)"
        >
          <Send size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function CopilotMirror({
  turns,
  checkpoints = [],
  isLiveCheckpointSource = false,
  selected,
  records = capabilities,
  selectedId,
  onSelect,
  onHide
}: {
  turns: CopilotTurn[];
  checkpoints?: readonly CopilotCheckpoint[];
  isLiveCheckpointSource?: boolean;
  selected: Capability;
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  onHide: () => void;
}) {
  const hasLiveCheckpoints = isLiveCheckpointSource && checkpoints.length > 0;

  // Derive golden turns from the `turns` prop when present; otherwise use the
  // built-in scripted conversation. We cast CopilotTurn[] to GoldenTurn[] since
  // the shapes are compatible for the text-only bubbles (no card).
  const goldenTurns: GoldenTurn[] = turns.length > 0
    ? turns.map((t) => ({ speaker: t.speaker, time: t.time, text: t.text }))
    : GOLDEN_CONVERSATION;

  return (
    <section className="mirror-layout">
      <div className="copilot-chat panel">
        {/* Header */}
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Copilot Mirror</p>
            <h2>Microsoft 365 Copilot proof</h2>
          </div>
          <div className="mirror-actions">
            <span className={`status-pill ${hasLiveCheckpoints ? "approved" : "pending"}`}>
              {hasLiveCheckpoints ? "Live from approved MCP checkpoints" : "Demo transcript fallback"}
            </span>
            <button type="button" className="text-link" onClick={onHide}>
              <X size={15} />
              Hide mirror
            </button>
          </div>
        </div>

        {/* Honesty label */}
        <div className="chat-honesty-label" role="note">
          <AlertTriangle size={12} aria-hidden />
          Governed mirror of approved MCP checkpoints — summary-only, no raw M365 content.
          This surface represents Signal Foundry's audit output, not a live Copilot session.
        </div>

        {/* Thread */}
        <div className="chat-thread" aria-label="Conversation thread">
          {hasLiveCheckpoints
            ? checkpoints.map((cp) => (
                <LiveCheckpointBubble key={cp.id} checkpoint={cp} />
              ))
            : goldenTurns.map((turn, idx) => {
                if (turn.speaker === "operator") {
                  return <OperatorBubble key={idx} turn={turn} />;
                }
                const isFoundry = turn.speaker === "foundry";
                return (
                  <AssistantBubble
                    key={idx}
                    turn={turn}
                    avatarLabel={isFoundry ? "Foundry" : "Copilot"}
                    avatarClass={isFoundry ? "chat-avatar--foundry" : "chat-avatar--copilot"}
                  />
                );
              })}
        </div>

        {/* Composer */}
        <ChatComposer />
      </div>

      {/* Right pane: Foundry context panels */}
      <div className="foundry-mirror">
        <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} compact />
        <RiskGate selected={selected} />
        <McpActivityRail compact />
        <ReleasePacketDrawer selected={selected} />
      </div>
    </section>
  );
}
