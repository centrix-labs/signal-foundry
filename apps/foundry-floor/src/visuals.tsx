import type { Capability } from "@signal-foundry/shared";
import { factoryStages, releaseStages, riskLabels, type Stage } from "./data";

// SignalAtlas lives in its own module (size budget); re-export it so existing
// `./visuals` imports keep working.
export { SignalAtlas } from "./atlas";

type PipelineProps = {
  selected: Capability;
  detailed?: boolean;
};

// Map a selected workflow's lifecycle status onto the mini pipeline's stages so
// choosing a node lights up where that workflow currently sits.
const STATUS_TO_STAGE: Record<string, string> = {
  candidate: "discovered",
  proposed: "proposed",
  risk_scored: "risk",
  in_review: "review",
  approved_for_release: "approved",
  approved: "approved",
  released: "released",
  blocked: "risk",
  rejected: "review"
};

function StageCard({ stage, index, isLast, isActive, isHere }: { stage: Stage; index: number; isLast: boolean; isActive: boolean; isHere: boolean }) {
  const isGate = stage.key === "gate" || stage.key === "risk";
  // Non-final cards carry a chevron in the seam to their right (see .stage-card.flows::after)
  // so the left-to-right flow direction reads off the cards themselves, not a separate row.
  const flowClass = isLast ? "" : "flows";
  return (
    <div className={`stage-card ${stage.tone} ${isActive ? "active" : ""} ${isHere ? "is-here" : ""} ${flowClass}`} style={{ animationDelay: `${index * 80}ms` }}>
      {isGate ? <span className="stage-gate-label">{stage.label}</span> : <span>{stage.label}</span>}
      <strong>{stage.count}</strong>
      <small>{stage.sublabel}</small>
      {isHere ? <span className="stage-here-badge">This workflow</span> : isGate ? <span className="stage-gate-badge">Risk Gate</span> : null}
    </div>
  );
}

export function ReleasePipeline({ selected, detailed = false }: PipelineProps) {
  const stages = detailed ? factoryStages : releaseStages;
  // Full factory view highlights the gate (the system control point); the mini
  // view highlights the stage where the selected workflow currently is.
  const hereKey = detailed ? null : STATUS_TO_STAGE[selected.status] ?? "discovered";
  const activeIndex = detailed
    ? stages.findIndex((item) => item.key === "gate" || item.key === "risk")
    : stages.findIndex((item) => item.key === hereKey);
  const currentLabel = stages[activeIndex]?.label ?? "Discover";
  const tagline = detailed
    ? "Every work signal passes a deterministic Risk Gate before a human reviewer can release it."
    : selected.status === "blocked"
      ? "Blocked at the Risk Gate — release refused. Bars show tenant-wide throughput."
      : selected.status === "rejected"
        ? "Rejected in review. Bars show tenant-wide throughput."
        : `Currently at the ${currentLabel} stage. Bars show tenant-wide throughput.`;
  // Drive the card track and the trace line from the same column template so the
  // trace segments always sit directly under their stage cards.
  const gridColumns = `repeat(${stages.length}, minmax(0, 1fr))`;
  return (
    <section className={`panel release-pipeline ${detailed ? "factory" : ""}`} aria-label="Release Pipeline">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Release Pipeline</p>
          <h2>{detailed ? "End-to-end factory lanes" : selected.title}</h2>
          <p className="pipeline-tagline">{tagline}</p>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]} Risk</span>
      </div>
      <div className="pipeline-track" style={{ gridTemplateColumns: gridColumns }}>
        {stages.map((stage, index) => (
          <StageCard
            key={stage.key}
            stage={stage}
            index={index}
            isLast={index === stages.length - 1}
            isActive={index === activeIndex}
            isHere={!detailed && index === activeIndex}
          />
        ))}
      </div>
      <div className="signal-trace" aria-hidden="true" style={{ gridTemplateColumns: gridColumns }}>
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const isComplete = activeIndex > -1 && index < activeIndex;
          return <span key={stage.key} className={`${stage.tone} ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`} />;
        })}
      </div>
    </section>
  );
}
