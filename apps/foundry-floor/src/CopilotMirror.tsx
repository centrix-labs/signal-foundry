import { useMemo, useRef, useState } from "react";
import { Lock, AlertTriangle, ShieldCheck, Sparkles, X } from "lucide-react";
import type { Capability, CopilotCheckpoint } from "@signal-foundry/shared";
import { capabilities, type CopilotTurn } from "./data";
import { McpActivityRail, ReleasePacketDrawer, RiskGate } from "./panels";
import { SignalAtlas } from "./visuals";
import {
  BLOCKED_CONVERSATION,
  ESCALATION_CONVERSATION,
  GOLDEN_CONVERSATION,
  GovernanceCard,
  type GoldenCardType,
  type GoldenTurn
} from "./copilotConversations";

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
  // Demo path: a few rich scripted sessions so the switcher has real choices —
  // the happy path, a released brief, and the refusal moment.
  const demoSpecs: { id: string; title: string; time: string; match: RegExp; turns: GoldenTurn[] }[] = [
    { id: "demo-renewal", title: "Renewal Brief Generator", time: "9:18 AM", match: /renewal brief/i, turns: GOLDEN_CONVERSATION },
    { id: "demo-escalation", title: "Executive Escalation Brief", time: "8:52 AM", match: /escalation/i, turns: ESCALATION_CONVERSATION },
    { id: "demo-blocked", title: "Employee Monitoring Request", time: "9:35 AM", match: /monitoring|employee/i, turns: BLOCKED_CONVERSATION }
  ];
  return demoSpecs.map((spec) => {
    const record = records.find((r) => spec.match.test(r.title));
    return {
      id: spec.id,
      title: record?.title ?? spec.title,
      subtitle: `Demo session · ${spec.time}`,
      recordId: record?.id,
      kind: "demo" as const,
      checkpoints: [],
      turns: spec.turns
    };
  });
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

  // Right column shows one context panel at a time (tabbed) so a presenter can
  // jump to a panel without scrolling a tall stack.
  const [rightTab, setRightTab] = useState<"atlas" | "risk" | "mcp" | "packet">("atlas");
  const RIGHT_TABS = [
    ["atlas", "Signal Atlas"],
    ["risk", "Risk Gate"],
    ["mcp", "MCP Activity"],
    ["packet", "Release Packet"]
  ] as const;

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

      {/* Right pane: one Foundry context panel at a time */}
      <div className="foundry-mirror">
        <div className="mirror-tabs" role="tablist" aria-label="Context panel">
          {RIGHT_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={rightTab === key}
              className={rightTab === key ? "is-active" : ""}
              onClick={() => setRightTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mirror-panel">
          {rightTab === "atlas" ? (
            <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} isLive={isLive} compact />
          ) : null}
          {rightTab === "risk" ? <RiskGate selected={selected} /> : null}
          {rightTab === "mcp" ? <McpActivityRail compact /> : null}
          {rightTab === "packet" ? <ReleasePacketDrawer selected={selected} /> : null}
        </div>
      </div>
    </section>
  );
}
