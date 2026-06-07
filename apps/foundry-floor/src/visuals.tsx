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

export function SignalAtlas({ selectedId, onSelect, compact = false }: AtlasProps) {
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
            return (
              <path
                key={edge.id}
                className={`atlas-link ${edge.kind}`}
                d={pathFor(source, target)}
                pathLength={1}
                style={{ animationDelay: `${index * 120}ms` }}
              />
            );
          })}
          {atlasNodes.map((node) => (
            <g key={node.id} className={`atlas-node ${node.kind} ${selectedId === node.id ? "selected" : ""}`}>
              <foreignObject x={node.x - 2.8} y={node.y - 2.8} width="5.6" height="5.6">
                <button type="button" className="node-hit" onClick={() => onSelect(node.id)} aria-label={`Select ${node.label}`}>
                  <span className="node-dot" />
                </button>
              </foreignObject>
              <foreignObject x={node.x - 9} y={node.y + 3} width="18" height="13">
                <div className="node-label">
                  <strong>{node.label}</strong>
                  {node.volume ? <span>{node.volume}</span> : null}
                  {node.status ? <span>{statusLabels[node.status]}</span> : null}
                </div>
              </foreignObject>
            </g>
          ))}
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
  return (
    <div className={`stage-card ${stage.tone}`} style={{ animationDelay: `${index * 80}ms` }}>
      <span>{stage.label}</span>
      <strong>{stage.count}</strong>
      <small>{stage.sublabel}</small>
    </div>
  );
}

export function ReleasePipeline({ selected, detailed = false }: PipelineProps) {
  const stages = detailed ? factoryStages : releaseStages;
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
        {stages.map((stage) => <span key={stage.key} className={stage.tone} />)}
      </div>
    </section>
  );
}
