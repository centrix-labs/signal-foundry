import { useEffect, useRef, useState } from "react";
import type { Capability } from "@signal-foundry/shared";
import { McpActivityRail } from "./panels";
import { ReleasePipeline, SignalAtlas } from "./visuals";
import { statusLabels } from "./data";
import { findCapability, PIPELINE_STAGES, stageKeyForStatus } from "./demoModel";
import type { useDashboardData } from "./liveData";

export function AtlasView({
  records,
  selectedId,
  onSelect,
  activity,
  isLive = false
}: {
  records: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  activity: ReturnType<typeof useDashboardData>["mcpActivity"];
  isLive?: boolean;
}) {
  // Cap the MCP rail to the live Atlas height so a long audit trace scrolls
  // inside the column instead of pushing the Release Pipeline far down.
  const viewRef = useRef<HTMLDivElement | null>(null);
  const [atlasHeight, setAtlasHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const panel = viewRef.current?.querySelector<HTMLElement>(".atlas-panel");
    if (!panel) {
      return;
    }
    const observer = new ResizeObserver(() => setAtlasHeight(panel.offsetHeight));
    observer.observe(panel);
    setAtlasHeight(panel.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // Selecting a node scopes the audit trace to that workflow; clicking the same
  // node again (or "Show all") clears the scope and shows every line.
  const norm = (id: string) => id.replace(/^cap-/, "");
  const selectedRecord = records.find((record) => record.id === selectedId);
  const scopedActivity = selectedRecord
    ? activity.filter((item) => norm(item.recordId) === norm(selectedRecord.id))
    : activity;
  const toggleSelect = (id: string) => onSelect(id === selectedId ? "" : id);

  return (
    <div className="atlas-view" ref={viewRef}>
      <SignalAtlas records={records} selectedId={selectedId} onSelect={toggleSelect} isLive={isLive} />
      <McpActivityRail
        compact
        items={scopedActivity}
        paginate
        maxHeight={atlasHeight}
        filterLabel={selectedRecord?.title}
        onClearFilter={() => onSelect("")}
        onSelectRecord={(recordId) => {
          // An activity's recordId may be the proposal id while the node is the
          // released capability (cap-<id>); match on the normalized id.
          const match = records.find((record) => norm(record.id) === norm(recordId));
          if (match) {
            onSelect(match.id);
          }
        }}
      />
      {/* The pipeline is a horizontal stage flow, so it spans the full width
          below the two column panels rather than cramping into the right rail. */}
      <ReleasePipeline selected={findCapability(selectedId, records)} />
    </div>
  );
}

export function PipelineView({ records }: { records: readonly Capability[] }) {
  const [stageFilter, setStageFilter] = useState<string>("all");
  const counts = Object.fromEntries(
    PIPELINE_STAGES.map((stage) => [stage.key, records.filter((r) => (stage.statuses as readonly string[]).includes(r.status)).length])
  );
  const filtered = stageFilter === "all" ? records : records.filter((r) => stageKeyForStatus(r.status) === stageFilter);
  // Only show stages that actually have records, plus an "All" chip.
  const liveStages = PIPELINE_STAGES.filter((stage) => counts[stage.key]! > 0);

  return (
    <div className="pipeline-view">
      <section className="panel pipeline-funnel" aria-label="Release pipeline funnel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Release Pipeline</p>
            <h2>Live funnel — {records.length} workflows in the registry</h2>
            <p className="pipeline-tagline">Counts are live from the registry. Pick a stage to filter the cards below.</p>
          </div>
        </div>
        <div className="pipeline-funnel-track" role="group" aria-label="Filter by stage">
          <button type="button" className={`funnel-stage all ${stageFilter === "all" ? "is-active" : ""}`} aria-pressed={stageFilter === "all"} onClick={() => setStageFilter("all")}>
            <span>All stages</span>
            <strong>{records.length}</strong>
            <small>workflows</small>
          </button>
          {liveStages.map((stage) => (
            <button
              key={stage.key}
              type="button"
              className={`funnel-stage ${stage.tone} ${stageFilter === stage.key ? "is-active" : ""}`}
              aria-pressed={stageFilter === stage.key}
              onClick={() => setStageFilter(stageFilter === stage.key ? "all" : stage.key)}
            >
              <span>{stage.label}</span>
              <strong>{counts[stage.key]}</strong>
              <small>{counts[stage.key] === 1 ? "workflow" : "workflows"}</small>
            </button>
          ))}
        </div>
      </section>
      <div className="pipeline-columns">
        {filtered.length === 0 ? (
          <p className="empty-state">No workflows in this stage.</p>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className={`panel release-card ${item.riskLevel}`}>
              <p className="eyebrow">{statusLabels[item.status]}</p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span>{item.version} / {item.owner}</span>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
