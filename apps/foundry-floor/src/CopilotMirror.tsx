import { useMemo, useRef, useState } from "react";
import { Lock, AlertTriangle, ShieldCheck, PackageCheck, Sparkles, X, FileText } from "lucide-react";
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
    <div className="chat-row chat-row--assistant" data-jump={turn.card?.kind}>
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
    <div className="chat-row chat-row--assistant" data-jump={checkpoint.stage}>
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
// Read-only footer — replaces the (misleading) inert chat composer. States the
// surface is a read-only audit replay and offers jump chips to the governed
// outputs already in the thread.
// ---------------------------------------------------------------------------
type JumpChip = { label: string; target: string };

function ReadOnlyBar({ chips, onJump }: { chips: JumpChip[]; onJump: (target: string) => void }) {
  return (
    <div className="chat-readonly" role="group" aria-label="Read-only audit view">
      <p className="chat-readonly-note">
        <Lock size={13} aria-hidden />
        Read-only audit view — this mirrors what Copilot did. It doesn't run Copilot.
      </p>
      {chips.length > 0 && (
        <div className="chat-readonly-chips">
          <span className="chat-readonly-chips-label">Jump to</span>
          {chips.map((chip) => (
            <button key={chip.target} type="button" className="chat-jump-chip" onClick={() => onJump(chip.target)}>
              {chip.label}
            </button>
          ))}
        </div>
      )}
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

// ---------------------------------------------------------------------------
// Conversation model — every governed Copilot session the operator can review.
// Live checkpoints are grouped by sessionId; the demo path is one rich session.
// ---------------------------------------------------------------------------
type MirrorSession = {
  id: string;
  title: string;
  subtitle: string;
  recordId?: string;
  kind: "live" | "demo";
  checkpoints: CopilotCheckpoint[];
  turns: GoldenTurn[];
};

const CARD_KIND_LABELS: Record<GoldenCardType, string> = {
  recommendation: "Recommendation",
  "risk-verdict": "Risk verdict",
  "proposal-receipt": "Proposal receipt",
  "release-packet": "Release packet"
};

function humanizeStage(stage: string): string {
  const spaced = stage.replace(/[_.]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function buildSessions(
  hasLiveCheckpoints: boolean,
  checkpoints: readonly CopilotCheckpoint[],
  records: readonly Capability[]
): MirrorSession[] {
  if (hasLiveCheckpoints) {
    const groups = new Map<string, CopilotCheckpoint[]>();
    for (const cp of checkpoints) {
      const arr = groups.get(cp.sessionId) ?? [];
      arr.push(cp);
      groups.set(cp.sessionId, arr);
    }
    const sessions = [...groups.entries()].map(([sessionId, cps]) => {
      const sorted = [...cps].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const first = sorted[0]!;
      const recordId = sorted.find((c) => c.relatedRecordId)?.relatedRecordId;
      const record = recordId ? records.find((r) => r.id === recordId) : undefined;
      const steps = sorted.length;
      return {
        id: sessionId,
        title: record?.title ?? "Governed Copilot session",
        subtitle: `${formatTime(first.createdAt)} · ${steps} step${steps > 1 ? "s" : ""}`,
        recordId,
        kind: "live" as const,
        checkpoints: sorted,
        turns: []
      };
    });
    // Most recently active session first.
    return sessions.sort((a, b) => {
      const aLast = a.checkpoints[a.checkpoints.length - 1]?.createdAt ?? "";
      const bLast = b.checkpoints[b.checkpoints.length - 1]?.createdAt ?? "";
      return bLast.localeCompare(aLast);
    });
  }
  // Demo path: one rich scripted session carrying the governance cards.
  const demoRecord = records.find((r) => /renewal brief/i.test(r.title)) ?? records[0];
  return [
    {
      id: "demo-session",
      title: demoRecord?.title ?? "Renewal Brief Generator",
      subtitle: "Demo session · 9:18 AM",
      recordId: demoRecord?.id,
      kind: "demo",
      checkpoints: [],
      turns: GOLDEN_CONVERSATION
    }
  ];
}

function chipsForSession(session: MirrorSession): JumpChip[] {
  if (session.kind === "demo") {
    const seen = new Set<GoldenCardType>();
    const chips: JumpChip[] = [];
    for (const turn of session.turns) {
      if (turn.card && !seen.has(turn.card.kind)) {
        seen.add(turn.card.kind);
        chips.push({ label: CARD_KIND_LABELS[turn.card.kind], target: turn.card.kind });
      }
    }
    return chips;
  }
  const seen = new Set<string>();
  const chips: JumpChip[] = [];
  for (const cp of session.checkpoints) {
    if (cp.speaker !== "operator" && !seen.has(cp.stage)) {
      seen.add(cp.stage);
      chips.push({ label: humanizeStage(cp.stage), target: cp.stage });
    }
  }
  return chips;
}

export function CopilotMirror({
  checkpoints = [],
  isLiveCheckpointSource = false,
  isLive = false,
  selected,
  records = capabilities,
  selectedId,
  onSelect,
  onHide
}: {
  turns?: CopilotTurn[];
  checkpoints?: readonly CopilotCheckpoint[];
  isLiveCheckpointSource?: boolean;
  isLive?: boolean;
  selected: Capability;
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  onHide: () => void;
}) {
  const hasLiveCheckpoints = isLiveCheckpointSource && checkpoints.length > 0;
  const threadRef = useRef<HTMLDivElement | null>(null);

  const sessions = useMemo(
    () => buildSessions(hasLiveCheckpoints, checkpoints, records),
    [hasLiveCheckpoints, checkpoints, records]
  );

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id ?? "");
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  function selectSession(session: MirrorSession) {
    setActiveSessionId(session.id);
    if (session.recordId && records.some((r) => r.id === session.recordId)) {
      onSelect(session.recordId);
    }
  }

  // Jump chips scroll the matching governed output into view and flash it.
  function jumpTo(target: string) {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }
    const el = thread.querySelector<HTMLElement>(`[data-jump="${CSS.escape(target)}"]`);
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("is-jump-flash");
    // reflow so the animation can replay on repeat clicks
    void el.offsetWidth;
    el.classList.add("is-jump-flash");
  }

  const chips = activeSession ? chipsForSession(activeSession) : [];

  return (
    <section className="mirror-layout">
      <div className="copilot-chat panel">
        {/* Header */}
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Copilot Mirror</p>
            <h2>Governed record of a Copilot session</h2>
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

        {/* Conversation switcher */}
        <div className="mirror-sessions" role="tablist" aria-label="Governed conversations">
          <span className="mirror-sessions-label">Conversation{sessions.length > 1 ? `s · ${sessions.length}` : ""}</span>
          <div className="mirror-sessions-list">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                role="tab"
                aria-selected={session.id === activeSession?.id}
                className={`mirror-session ${session.id === activeSession?.id ? "is-active" : ""}`}
                onClick={() => selectSession(session)}
              >
                <span className="mirror-session-title">{session.title}</span>
                <span className="mirror-session-sub">{session.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="chat-thread" aria-label="Conversation thread" ref={threadRef}>
          {activeSession?.kind === "live"
            ? activeSession.checkpoints.map((cp) => (
                <LiveCheckpointBubble key={cp.id} checkpoint={cp} />
              ))
            : (activeSession?.turns ?? []).map((turn, idx) => {
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

        {/* Read-only footer */}
        <ReadOnlyBar chips={chips} onJump={jumpTo} />
      </div>

      {/* Right pane: Foundry context panels */}
      <div className="foundry-mirror">
        <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} isLive={isLive} compact />
        <RiskGate selected={selected} />
        <McpActivityRail compact />
        <ReleasePacketDrawer selected={selected} />
      </div>
    </section>
  );
}
