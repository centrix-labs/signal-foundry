import { X } from "lucide-react";
import type { Capability, CopilotCheckpoint } from "@signal-foundry/shared";
import { capabilities, type CopilotTurn } from "./data";
import { McpActivityRail, ReleasePacketDrawer, RiskGate } from "./panels";
import { SignalAtlas } from "./visuals";

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

  return (
    <section className="mirror-layout">
      <div className="copilot-chat panel">
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
        {hasLiveCheckpoints ? (
          checkpoints.map((checkpoint) => <CheckpointBubble key={checkpoint.id} checkpoint={checkpoint} />)
        ) : (
          turns.map((turn) => (
            <article key={`${turn.speaker}-${turn.time}`} className={turn.speaker}>
              <small>{turn.speaker} / {turn.time}</small>
              <p>{turn.text}</p>
            </article>
          ))
        )}
        <div className="chat-input">Message Copilot</div>
      </div>
      <div className="foundry-mirror">
        <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} compact />
        <RiskGate selected={selected} />
        <McpActivityRail compact />
        <ReleasePacketDrawer selected={selected} />
      </div>
    </section>
  );
}

function CheckpointBubble({ checkpoint }: { checkpoint: CopilotCheckpoint }) {
  const evidence = [
    checkpoint.stage,
    checkpoint.sourceTool,
    checkpoint.correlationId
  ].filter(Boolean).join(" / ");
  return (
    <article className={`${checkpoint.speaker} checkpoint`}>
      <small>{checkpoint.speaker} / {formatTime(checkpoint.createdAt)}</small>
      <p>{checkpoint.displayText}</p>
      <em>{evidence}</em>
    </article>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
