import { useRef, useState } from "react";
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
import type { StoryState } from "./story";

type AtlasProps = {
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  judgeMode?: boolean;
  stageKey?: string;
  isLive?: boolean;
  /** Guided-Story choreography. Judge Mode only; ignored in free-explore. */
  story?: StoryState;
  /** Title for the travelling hero proposal node (focal record). */
  heroLabel?: string;
};

// Structural lanes (signals, roles, the forge, the gate) are fixed; the approved-
// workflow lane on the right is where live, Copilot-created proposals land.
const STRUCTURAL_NODES = atlasNodes.filter((node) => node.kind !== "workflow");
const SEEDED_WORKFLOW_NODES = atlasNodes.filter((node) => node.kind === "workflow");
const STRUCTURAL_EDGES = atlasEdges.filter((edge) => edge.kind !== "approval_path");
const SEEDED_WORKFLOW_EDGES = atlasEdges.filter((edge) => edge.kind === "approval_path");
const WORKFLOW_X = 82;
const WORKFLOW_CENTER = 49;
const WORKFLOW_SPACING = 14;
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
  // Centre the stack on the gate and use a fixed, generous gap so labels in a
  // busy column never collide. Overflow below the viewBox is reachable by panning.
  return shown.map((record, index) => ({
    id: record.id,
    label: record.title,
    kind: "workflow",
    x: WORKFLOW_X,
    y: WORKFLOW_CENTER + (index - (count - 1) / 2) * WORKFLOW_SPACING,
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

// Lane anchors for the Guided Story hero node. These mirror the x-positions of
// the fixed backdrop nodes in data.ts (forge 52, gate 67, workflow 82) so the
// hero lines up with the structural graph as it travels.
const STORY_FORGE = { x: 52, y: 49 };
const STORY_GATE = { x: 67, y: 49 };
const STORY_WORKFLOW = { x: 82, y: 49 };
const STORY_ROLE = { x: 32, y: 34 };

function storyEdgePath(key: StoryState["activeEdges"][number]): string {
  switch (key) {
    case "role-forge":
      return pathFor({ ...STORY_ROLE, id: "s", label: "", kind: "role" }, { ...STORY_FORGE, id: "f", label: "", kind: "department" });
    case "forge-gate":
      return pathFor({ ...STORY_FORGE, id: "f", label: "", kind: "department" }, { ...STORY_GATE, id: "g", label: "", kind: "risk_gate" });
    case "gate-workflow":
      return pathFor({ ...STORY_GATE, id: "g", label: "", kind: "risk_gate" }, { ...STORY_WORKFLOW, id: "w", label: "", kind: "workflow" });
    default:
      return "";
  }
}

// The Guided Story renders in two layers so the connector never sits on top of
// a node: StoryEdges draws with the other edges (behind nodes), StoryHero draws
// after the nodes (on top). Both are keyed on the stage so one-shot animations
// replay on each advance; the hero group is NOT keyed so it travels smoothly.
function StoryEdges({ story, stageKey }: { story: StoryState; stageKey?: string }) {
  return (
    <g className="story-edges" aria-hidden="true">
      {story.activeEdges.map((edge) => (
        <path
          key={`${edge}-${stageKey}`}
          className={`story-edge ${edge} ${story.gateFiring && edge === "forge-gate" ? "firing" : ""}`}
          d={storyEdgePath(edge)}
          pathLength={1}
        />
      ))}
    </g>
  );
}

function StoryHero({ story, stageKey, heroLabel }: { story: StoryState; stageKey?: string; heroLabel?: string }) {
  const { heroPos, variant, heroVisible } = story;
  if (!heroVisible) {
    return null;
  }
  return (
    <g
      className={`story-hero story-hero-${variant}`}
      style={{ transform: `translate(${heroPos.x}px, ${heroPos.y}px)` }}
      aria-hidden="true"
    >
      {/* arrive / seal one-shots replay via the stage key */}
      <g key={`hero-fx-${stageKey}`} className="story-hero-fx" pointerEvents="none">
        <circle className="story-hero-burst" r={3.4} />
      </g>
      {variant === "sealed" ? (
        <g key={`seal-${stageKey}`} className="story-seal-pop" pointerEvents="none">
          <rect className="story-packet" x={-1.2} y={-1.2} width={2.4} height={2.4} rx={0.5} />
        </g>
      ) : null}
      {variant === "hold" ? (
        <g className="story-hold-marker" pointerEvents="none">
          {/* shield outline — human hold */}
          <path className="story-shield" d="M0 -3.1 L2.4 -2 L2.4 0.4 Q2.4 2.4 0 3.4 Q-2.4 2.4 -2.4 0.4 L-2.4 -2 Z" />
        </g>
      ) : null}
      <circle className="story-hero-ring" r={2.7} />
      <circle className="story-hero-core" r={1.15} />
      {heroLabel ? (
        <g className="story-hero-label" pointerEvents="none">
          <rect className="story-hero-label-bg" x={-9} y={3.4} width={18} height={3.4} rx={0.8} />
          <text className="story-hero-label-text" x={0} y={5.7} textAnchor="middle">
            {heroLabel.length > 22 ? `${heroLabel.slice(0, 21)}…` : heroLabel}
          </text>
        </g>
      ) : null}
    </g>
  );
}

// Auto-fit the viewBox to the rendered nodes (plus their label extents) so the
// whole graph is always in view — adding workflow nodes zooms the camera out
// instead of overlapping. A node label box reaches ~±11 wide, ~3.5 above the
// node centre and ~10.5 below it.
function computeViewBox(
  nodes: readonly PositionedNode[],
  judgeMode: boolean,
  extra: ReadonlyArray<{ x: number; y: number }> = []
): string {
  const points = [...nodes, ...extra];
  if (points.length === 0) {
    return judgeMode ? "0 16 100 74" : "0 0 100 112";
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x - 11);
    maxX = Math.max(maxX, point.x + 11);
    minY = Math.min(minY, point.y - 3.5);
    maxY = Math.max(maxY, point.y + 10.5);
  }
  const pad = 4;
  return `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`;
}

export function SignalAtlas({ records = [], selectedId, onSelect, compact = false, judgeMode = false, stageKey, isLive = false, story, heroLabel }: AtlasProps) {
  // The Guided Story choreography only ever runs inside Judge Mode. In every
  // other surface (free-explore "atlas", workbench) `storyState` is undefined so
  // the live workflow lane and drag-to-pan stay exactly as before.
  const storyState = judgeMode ? story : undefined;
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

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; sx: number; sy: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Drag the background to pan the graph; node clicks still pass through.
  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if ((event.target as Element).closest(".node-hit")) {
      return;
    }
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) {
      return;
    }
    dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y, sx: ctm.a || 1, sy: ctm.d || 1 };
    try {
      svgRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // pointer capture is best-effort; panning still works while over the canvas
    }
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    const clamp = (value: number) => Math.max(-55, Math.min(55, value));
    setPan({
      x: clamp(drag.panX + (event.clientX - drag.startX) / drag.sx),
      y: clamp(drag.panY + (event.clientY - drag.startY) / drag.sy)
    });
  }

  function endPan(event: React.PointerEvent<SVGSVGElement>) {
    if (dragRef.current) {
      svgRef.current?.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  return (
    <section
      className={`panel atlas-panel ${compact ? "compact-atlas" : ""} ${judgeMode ? "judge-atlas-panel" : ""} ${storyState ? `story-mode story-${storyState.variant}` : ""}`}
      data-stage={storyState ? stageKey : undefined}
      aria-label="Signal Atlas"
    >
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
        <svg
          ref={svgRef}
          className="atlas-svg"
          viewBox={computeViewBox(displayNodes, judgeMode, storyState?.heroVisible ? [storyState.heroPos] : [])}
          role="img"
          aria-label="Animated graph of signals, roles, risk gates, and workflows. Drag to pan; double-click to reset."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onDoubleClick={(event) => {
            if (!(event.target as Element).closest(".node-hit")) {
              setPan({ x: 0, y: 0 });
            }
          }}
        >
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
          <g className="atlas-pan" transform={`translate(${pan.x} ${pan.y})`}>
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
          {storyState ? <StoryEdges story={storyState} stageKey={stageKey} /> : null}
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
          {storyState ? (
            <StoryHero story={storyState} stageKey={stageKey} heroLabel={heroLabel} />
          ) : null}
          </g>
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
  const isGate = stage.key === "gate" || stage.key === "risk";
  const activeClass = isGate ? "active" : "";
  return (
    <div className={`stage-card ${stage.tone} ${activeClass}`} style={{ animationDelay: `${index * 80}ms` }}>
      {isGate ? <span className="stage-gate-label">{stage.label}</span> : <span>{stage.label}</span>}
      <strong>{stage.count}</strong>
      <small>{stage.sublabel}</small>
      {isGate ? <span className="stage-gate-badge">Risk Gate</span> : null}
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
          <p className="pipeline-tagline">Every work signal passes a deterministic Risk Gate before a human reviewer can release it.</p>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]} Risk</span>
      </div>
      <div className="pipeline-track">
        {stages.map((stage, index) => (
          <StageCard key={stage.key} stage={stage} index={index} />
        ))}
      </div>
      <div className="pipeline-flow-arrows" aria-hidden="true">
        {stages.map((_, index) =>
          index < stages.length - 1 ? (
            <span key={index} className="pipeline-arrow">›</span>
          ) : (
            <span key={index} />
          )
        )}
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
