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
};

function nodeById(id: string): PositionedNode {
  const node = atlasNodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Unknown atlas node ${id}`);
  }
  return node;
}

function pathFor(source: PositionedNode, target: PositionedNode): string {
  const mid = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x} ${target.y}`;
}

export function SignalAtlas({ records = [], selectedId, onSelect, compact = false }: AtlasProps) {
  return (
    <section className={`panel atlas-panel ${compact ? "compact-atlas" : ""}`} aria-label="Signal Atlas">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Signal Atlas</p>
          <h2>Raw signals forged into approved workflows</h2>
        </div>
        <div className="segmented">
          <span>Live</span>
          <span>All domains</span>
          <span>All risk levels</span>
        </div>
      </div>
      <div className="atlas-canvas">
        <svg viewBox="0 0 100 112" role="img" aria-label="Animated graph of signals, roles, risk gates, and workflows">
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
          {atlasEdges.map((edge, index) => {
            const source = nodeById(edge.source);
            const target = nodeById(edge.target);
            const path = pathFor(source, target);
            const isRisk = edge.kind === "risk_gate" || edge.kind === "approval_path";
            return (
              <g key={edge.id} className={`atlas-edge ${edge.kind}`} style={{ animationDelay: `${index * 120}ms` }}>
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
          {atlasNodes.map((node) => {
            const record = records.find((item) => item.id === node.id);
            const currentNode = record ? { ...node, label: record.title, riskLevel: record.riskLevel, status: record.status } : node;
            return (
            <g key={currentNode.id} className={`atlas-node ${currentNode.kind} ${selectedId === currentNode.id ? "selected" : ""} ${currentNode.status ?? ""}`}>
              <foreignObject x={currentNode.x - 2.8} y={currentNode.y - 2.8} width="5.6" height="5.6">
                <button type="button" className="node-hit" onClick={() => onSelect(currentNode.id)} aria-label={`Select ${currentNode.label}`}>
                  <span className="node-dot" />
                </button>
              </foreignObject>
              <foreignObject x={currentNode.x - 9} y={currentNode.y + 3} width="18" height="13">
                <div className="node-label">
                  <strong>{currentNode.label}</strong>
                  {currentNode.volume ? <span>{currentNode.volume}</span> : null}
                  {currentNode.status ? <span>{statusLabels[currentNode.status]}</span> : null}
                </div>
              </foreignObject>
            </g>
            );
          })}
        </svg>
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
