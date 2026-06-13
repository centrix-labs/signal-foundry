import { useMemo, useState } from "react";

type ServiceNode = {
  id: string;
  tier: number;
  label: string;
  tech: string;
  x: number;
  y: number;
};

type TierHeader = {
  label: string;
  x: number;
};

// Five layered tiers, left to right along the request path. x is the column
// centre, y the row centre, in the SVG's 104 x 58 user-unit space.
const TIERS: TierHeader[] = [
  { label: "Microsoft 365", x: 10 },
  { label: "Governed Edge", x: 31 },
  { label: "Reasoning & Gate", x: 52 },
  { label: "Data & Audit", x: 73 },
  { label: "Experience & Ops", x: 94 }
];

const SERVICES: ServiceNode[] = [
  { id: "copilot-chat", tier: 0, label: "Copilot Chat", tech: "Microsoft 365", x: 10, y: 13 },
  { id: "declarative-agent", tier: 0, label: "Declarative Agent", tech: "manifest v1.6", x: 10, y: 25 },
  { id: "work-iq", tier: 0, label: "Work IQ", tech: "People + Meetings", x: 10, y: 37 },
  { id: "adaptive-cards", tier: 0, label: "Adaptive Cards", tech: "response UI", x: 10, y: 49 },

  { id: "mcp-server", tier: 1, label: "MCP Server", tech: "13 tools · Zod", x: 31, y: 25 },
  { id: "oauth-guard", tier: 1, label: "Entra ID", tech: "OAuth guard", x: 31, y: 37 },

  { id: "confirm-gate", tier: 2, label: "Confirmation Gate", tech: "schema-enforced", x: 52, y: 19 },
  { id: "risk-gate", tier: 2, label: "Risk Gate", tech: "deterministic", x: 52, y: 31 },
  { id: "advisory", tier: 2, label: "Foundry Advisory", tech: "multi-step reasoning", x: 52, y: 43 },

  { id: "registry", tier: 3, label: "Capability Registry", tech: "Table Storage", x: 73, y: 19 },
  { id: "audit", tier: 3, label: "Audit Ledger", tech: "correlation IDs", x: 73, y: 31 },
  { id: "key-vault", tier: 3, label: "Key Vault", tech: "secrets", x: 73, y: 43 },

  { id: "foundry-floor", tier: 4, label: "Foundry Floor", tech: "Static Web Apps", x: 94, y: 25 },
  { id: "app-insights", tier: 4, label: "App Insights", tech: "telemetry", x: 94, y: 37 }
];

const CONNECTIONS: ReadonlyArray<readonly [string, string]> = [
  ["copilot-chat", "declarative-agent"],
  ["declarative-agent", "work-iq"],
  ["declarative-agent", "adaptive-cards"],
  ["declarative-agent", "mcp-server"],
  ["mcp-server", "oauth-guard"],
  ["mcp-server", "confirm-gate"],
  ["mcp-server", "risk-gate"],
  ["risk-gate", "advisory"],
  ["mcp-server", "registry"],
  ["mcp-server", "audit"],
  ["oauth-guard", "key-vault"],
  ["advisory", "key-vault"],
  ["registry", "foundry-floor"],
  ["audit", "foundry-floor"],
  ["mcp-server", "app-insights"],
  ["foundry-floor", "app-insights"]
];

const BOX_W = 17;
const BOX_H = 9;
const HALF_W = BOX_W / 2;
const HALF_H = BOX_H / 2;

function serviceById(id: string): ServiceNode {
  const node = SERVICES.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Unknown architecture service ${id}`);
  }
  return node;
}

// Right-angle (orthogonal) connector: every segment is horizontal or vertical,
// so the routing reads as 90-degree elbows like a board schematic.
function connectorPath(a: ServiceNode, b: ServiceNode): string {
  if (a.x === b.x) {
    const top = Math.min(a.y, b.y) + HALF_H;
    const bottom = Math.max(a.y, b.y) - HALF_H;
    return `M ${a.x} ${top} V ${bottom}`;
  }
  const [left, right] = a.x < b.x ? [a, b] : [b, a];
  const startX = left.x + HALF_W;
  const endX = right.x - HALF_W;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${left.y} H ${midX} V ${right.y} H ${endX}`;
}

function neighborsOf(id: string): Set<string> {
  const set = new Set<string>();
  for (const [a, b] of CONNECTIONS) {
    if (a === id) {
      set.add(b);
    }
    if (b === id) {
      set.add(a);
    }
  }
  return set;
}

// Wrap a short label into at most two lines so titles fit the service box.
function wrapTwo(text: string, maxChars = 15): string[] {
  if (text.length <= maxChars) {
    return [text];
  }
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 2);
}

export function ArchitectureView() {
  const [focused, setFocused] = useState<string | null>(null);
  const linked = useMemo(() => (focused ? neighborsOf(focused) : null), [focused]);

  function nodeState(id: string): "hovered" | "linked" | "dim" | "" {
    if (!focused) {
      return "";
    }
    if (id === focused) {
      return "hovered";
    }
    return linked?.has(id) ? "linked" : "dim";
  }

  function edgeState(a: string, b: string): "active" | "dim" | "" {
    if (!focused) {
      return "";
    }
    return a === focused || b === focused ? "active" : "dim";
  }

  return (
    <section className="architecture-view" aria-label="Architecture">
      <div className="architecture-head">
        <div>
          <p className="eyebrow">System architecture</p>
          <h1>Signal Foundry, tier by tier</h1>
          <p className="architecture-sub">
            Hover any service to trace what it connects to — linked services and their right-angle paths light up, the rest fade back.
          </p>
        </div>
        <div className="architecture-legend">
          <span><i className="arch-legend-flow" /> Request &amp; data path</span>
          <span><i className="arch-legend-node" /> Service</span>
        </div>
      </div>

      <div className="architecture-canvas">
        <svg viewBox="0 0 104 58" role="img" aria-label="Tiered architecture diagram of Signal Foundry services and their connections">
          <defs>
            <marker id="archArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>

          {TIERS.map((tier) => (
            <g key={tier.label} className="arch-tier">
              <rect className="arch-tier-band" x={tier.x - HALF_W - 1.2} y={8} width={BOX_W + 2.4} height={47} rx={2} />
              <text className="arch-tier-label" x={tier.x} y={5.4} textAnchor="middle">{tier.label}</text>
            </g>
          ))}

          {CONNECTIONS.map(([a, b]) => {
            const state = edgeState(a, b);
            return (
              <path
                key={`${a}-${b}`}
                className={`arch-edge ${state}`}
                d={connectorPath(serviceById(a), serviceById(b))}
                markerEnd="url(#archArrow)"
                pathLength={1}
              />
            );
          })}

          {SERVICES.map((node) => {
            const state = nodeState(node.id);
            const titleLines = wrapTwo(node.label);
            const titleTop = node.y - (titleLines.length > 1 ? 1.5 : 0.6);
            return (
              <g
                key={node.id}
                className={`arch-node ${state}`}
                tabIndex={0}
                role="button"
                aria-label={`${node.label}, ${node.tech}`}
                onMouseEnter={() => setFocused(node.id)}
                onMouseLeave={() => setFocused((current) => (current === node.id ? null : current))}
                onFocus={() => setFocused(node.id)}
                onBlur={() => setFocused((current) => (current === node.id ? null : current))}
              >
                <rect className="arch-node-box" x={node.x - HALF_W} y={node.y - HALF_H} width={BOX_W} height={BOX_H} rx={1.4} />
                <text className="arch-node-title" x={node.x} y={titleTop} textAnchor="middle">
                  {titleLines.map((line, index) => (
                    <tspan key={index} x={node.x} dy={index === 0 ? 1.6 : 2.0}>{line}</tspan>
                  ))}
                </text>
                <text className="arch-node-tech" x={node.x} y={node.y + HALF_H - 1.4} textAnchor="middle">{node.tech}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
