import type { Capability } from "@signal-foundry/shared";
import {
  atlasEdges,
  atlasNodes,
  factoryStages,
  releaseStages,
  riskLabels,
  statusLabels,
  type PositionedNode,
  type Stage
} from "./data";

type AtlasProps = {
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  judgeMode?: boolean;
  stageKey?: string;
  isLive?: boolean;
};

// Structural lanes (signals, roles, the forge, the gate) are fixed; the approved-
// workflow lane on the right is where live, Copilot-created proposals land.
const STRUCTURAL_NODES = atlasNodes.filter((node) => node.kind !== "workflow");
const SEEDED_WORKFLOW_NODES = atlasNodes.filter((node) => node.kind === "workflow");
const STRUCTURAL_EDGES = atlasEdges.filter((edge) => edge.kind !== "approval_path");
const SEEDED_WORKFLOW_EDGES = atlasEdges.filter((edge) => edge.kind === "approval_path");
const WORKFLOW_X = 82;
const WORKFLOW_TOP = 26;
const WORKFLOW_BOTTOM = 72;
const MAX_LIVE_WORKFLOWS = 6;

const SEEDED_WORKFLOW_IDS = SEEDED_WORKFLOW_NODES.map((node) => node.id);

// When the registry is live, render the workflow lane straight from records so
// that proposals created in different Copilot chats appear and the graph grows.
// The seeded golden workflows are kept first so the judge scenario always shows,
// then new live proposals fill the remaining slots.
function liveWorkflowNodes(records: readonly Capability[]): PositionedNode[] {
  const ordered: Capability[] = [
    ...SEEDED_WORKFLOW_IDS.map((id) => records.find((record) => record.id === id)).filter(
      (record): record is Capability => Boolean(record)
    ),
    ...records.filter((record) => !SEEDED_WORKFLOW_IDS.includes(record.id))
  ];
  const shown = ordered.slice(0, MAX_LIVE_WORKFLOWS);
  const count = shown.length;
  return shown.map((record, index) => ({
    id: record.id,
    label: record.title,
    kind: "workflow",
    x: WORKFLOW_X,
    y: count <= 1 ? 49 : WORKFLOW_TOP + ((WORKFLOW_BOTTOM - WORKFLOW_TOP) * index) / (count - 1),
    riskLevel: record.riskLevel,
    status: record.status
  }));
}

function pathFor(source: PositionedNode, target: PositionedNode): string {
  const mid = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x} ${target.y}`;
}

// Wrap a label into at most `maxLines` lines of ~`maxChars`, so SVG <text> can
// render multi-line titles (SVG text has no auto-wrap). Trailing overflow is
// truncated with an ellipsis so a long title never blows past the node box.
function wrapLabel(text: string, maxChars = 15, maxLines = 2): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
  }
  return lines;
}

function renderNodeLabel(node: PositionedNode) {
  const titleLines = wrapLabel(node.label);
  const sub = node.volume ?? (node.status ? statusLabels[node.status] : undefined);
  const titleSize = 1.55;
  const subSize = 1.3;
  const lineHeight = 1.7;
  const padY = 0.95;
  const padX = 1.1;
  // Size the box to its own text so adjacent labels (e.g. Signal Foundry next to
  // Risk Gate) don't overlap. Char-width factors approximate the Aptos metrics.
  const longestTitleChars = Math.max(...titleLines.map((line) => line.length));
  const subChars = sub ? sub.length : 0;
  const contentW = Math.max(longestTitleChars * titleSize * 0.6, subChars * subSize * 0.6);
  const boxW = Math.min(24, Math.max(9, contentW + padX * 2));
  const titleBlock = titleLines.length * lineHeight;
  const subBlock = sub ? 1.65 : 0;
  const boxH = padY * 2 + titleBlock + subBlock;
  const boxX = node.x - boxW / 2;
  const boxY = node.y + 2.9;
  const titleBaseline = boxY + padY + titleSize * 0.82;
  const subBaseline = boxY + padY + titleBlock + subSize * 0.86;
  return (
    <g className="node-label" pointerEvents="none">
      <rect className="node-label-bg" x={boxX} y={boxY} width={boxW} height={boxH} rx={1} ry={1} />
      <text className="node-label-title" x={node.x} y={titleBaseline} textAnchor="middle">
        {titleLines.map((line, index) => (
          <tspan key={index} x={node.x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>
        ))}
      </text>
      {sub ? (
        <text className="node-label-sub" x={node.x} y={subBaseline} textAnchor="middle">{sub}</text>
      ) : null}
    </g>
  );
}

export function SignalAtlas({ records = [], selectedId, onSelect, compact = false, judgeMode = false, stageKey, isLive = false }: AtlasProps) {
  const useLiveWorkflows = isLive && records.length > 0;
  const workflowNodes = useLiveWorkflows ? liveWorkflowNodes(records) : SEEDED_WORKFLOW_NODES;
  const displayNodes: PositionedNode[] = [...STRUCTURAL_NODES, ...workflowNodes];
  const displayEdges = [
    ...STRUCTURAL_EDGES,
    ...(useLiveWorkflows
      ? workflowNodes.map((node) => ({
          id: `gate-${node.id}`,
          source: "gate-risk",
          target: node.id,
          label: "governed",
          kind: "approval_path" as const
        }))
      : SEEDED_WORKFLOW_EDGES)
  ];
  const nodeLookup = new Map(displayNodes.map((node) => [node.id, node] as const));

  return (
    <section className={`panel atlas-panel ${compact ? "compact-atlas" : ""} ${judgeMode ? "judge-atlas-panel" : ""}`} aria-label="Signal Atlas">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Signal Atlas</p>
          <h2>Summary work signals forged into approved workflows</h2>
        </div>
        <div className="segmented">
          <span>Live</span>
          <span>All domains</span>
          <span>All risk levels</span>
        </div>
      </div>
      <div className="atlas-canvas">
        {judgeMode ? (
          <div className="atlas-field-labels" aria-hidden="true">
            <span className="inbound">Summary work signals</span>
            <span className="forge">Signal Foundry</span>
            <span className={stageKey === "score" ? "gate active" : "gate"}>Risk gate</span>
            <span className="outbound">Approved workflows</span>
          </div>
        ) : null}
        <svg viewBox={judgeMode ? "0 16 100 74" : "0 0 100 112"} role="img" aria-label="Animated graph of signals, roles, risk gates, and workflows">
          <defs>
            <filter id="tealGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="tealArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="amberArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <g className="constellation">
            {Array.from({ length: 44 }, (_, index) => {
              const x = 14 + ((index * 17) % 62);
              const y = 12 + ((index * 29) % 76);
              return <circle key={index} cx={x} cy={y} r={index % 5 === 0 ? 0.45 : 0.28} />;
            })}
          </g>
          {displayEdges.map((edge, index) => {
            const source = nodeLookup.get(edge.source);
            const target = nodeLookup.get(edge.target);
            if (!source || !target) {
              return null;
            }
            const path = pathFor(source, target);
            const isRisk = edge.kind === "risk_gate" || edge.kind === "approval_path";
            const isStageRisk = stageKey === "score" && (edge.kind === "risk_gate" || edge.source === "gate-risk");
            return (
              <g key={edge.id} className={`atlas-edge ${edge.kind} ${isStageRisk ? "stage-active" : ""}`} style={{ animationDelay: `${index * 120}ms` }}>
                {isRisk ? <path className={`atlas-link-backdrop ${edge.kind}`} d={path} pathLength={1} /> : null}
                <path
                  className={`atlas-link ${edge.kind}`}
                  d={path}
                  markerEnd={isRisk ? "url(#amberArrow)" : "url(#tealArrow)"}
                  pathLength={1}
                />
                <circle className={`atlas-flow-particle ${edge.kind}`} r={isRisk ? 0.58 : 0.52}>
                  <animateMotion dur={isRisk ? "3.4s" : "2.8s"} begin={`${index * 0.18}s`} repeatCount="indefinite" path={path} />
                </circle>
              </g>
            );
          })}
          {[...displayNodes]
            .sort((a, b) => {
              const paintRank = (item: PositionedNode) =>
                item.id === selectedId ? 2 : stageKey === "score" && item.id === "gate-risk" ? 1 : 0;
              return paintRank(a) - paintRank(b);
            })
            .map((node) => {
            const record = records.find((item) => item.id === node.id);
            const currentNode = record ? { ...node, label: record.title, riskLevel: record.riskLevel, status: record.status } : node;
            const isStageRiskNode = stageKey === "score" && currentNode.id === "gate-risk";
            return (
            <g key={currentNode.id} className={`atlas-node ${currentNode.kind} ${selectedId === currentNode.id ? "selected" : ""} ${currentNode.status ?? ""} ${isStageRiskNode ? "stage-active" : ""}`}>
              {selectedId === currentNode.id ? (
                <g key={`pulse-${selectedId}`} className="atlas-node-pulse" pointerEvents="none" aria-hidden="true">
                  <circle cx={currentNode.x} cy={currentNode.y} r={2.55} />
                  <circle cx={currentNode.x} cy={currentNode.y} r={2.55} />
                  <circle cx={currentNode.x} cy={currentNode.y} r={2.55} />
                </g>
              ) : null}
              <circle className="node-ring" cx={currentNode.x} cy={currentNode.y} r={2.55} />
              <circle className="node-core" cx={currentNode.x} cy={currentNode.y} r={1.05} />
              <foreignObject x={currentNode.x - 2.8} y={currentNode.y - 2.8} width="5.6" height="5.6">
                <button type="button" className="node-hit" onClick={() => onSelect(currentNode.id)} aria-label={`Select ${currentNode.label}`} />
              </foreignObject>
              {renderNodeLabel(currentNode)}
            </g>
            );
          })}
        </svg>
        {judgeMode ? (
          <div className="atlas-badges" aria-label="Atlas proof badges">
            <span>No raw content</span>
            <span>Summary-only</span>
            <span>Approved packet</span>
          </div>
        ) : null}
        <div className="atlas-legend">
          <span><i className="legend-teal" /> Signal flow</span>
          <span><i className="legend-amber" /> Risk gate</span>
          <span><i className="legend-muted" /> External context</span>
        </div>
      </div>
    </section>
  );
}

type PipelineProps = {
  selected: Capability;
  detailed?: boolean;
};

function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const activeClass = stage.key === "gate" || stage.key === "risk" ? "active" : "";
  return (
    <div className={`stage-card ${stage.tone} ${activeClass}`} style={{ animationDelay: `${index * 80}ms` }}>
      <span>{stage.label}</span>
      <strong>{stage.count}</strong>
      <small>{stage.sublabel}</small>
    </div>
  );
}

export function ReleasePipeline({ selected, detailed = false }: PipelineProps) {
  const stages = detailed ? factoryStages : releaseStages;
  const activeIndex = stages.findIndex((item) => item.key === "gate" || item.key === "risk");
  return (
    <section className={`panel release-pipeline ${detailed ? "factory" : ""}`} aria-label="Release Pipeline">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Release Pipeline</p>
          <h2>{detailed ? "End-to-end factory lanes" : selected.title}</h2>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]} Risk</span>
      </div>
      <div className="pipeline-track">
        {stages.map((stage, index) => <StageCard key={stage.key} stage={stage} index={index} />)}
      </div>
      <div className="signal-trace" aria-hidden="true">
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const isComplete = activeIndex > -1 && index < activeIndex;
          return <span key={stage.key} className={`${stage.tone} ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`} />;
        })}
      </div>
    </section>
  );
}
