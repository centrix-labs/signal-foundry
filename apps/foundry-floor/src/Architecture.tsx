import { useCallback, useLayoutEffect, useRef, useState } from "react";

type ServiceNode = {
  id: string;
  tier: number;
  row: number;
  label: string;
  tech: string;
};

const TIERS = ["Microsoft 365", "Governed Edge", "Reasoning & Gate", "Data & Audit", "Experience & Ops"];

// tier = column (0-4), row = matrix row (1-7); the stagger keeps the request
// path readable across lanes.
const SERVICES: ServiceNode[] = [
  { id: "copilot-chat", tier: 0, row: 1, label: "Copilot Chat", tech: "Microsoft 365" },
  { id: "declarative-agent", tier: 0, row: 3, label: "Declarative Agent", tech: "manifest v1.6" },
  { id: "work-iq", tier: 0, row: 5, label: "Work IQ", tech: "People + Meetings" },
  { id: "adaptive-cards", tier: 0, row: 7, label: "Adaptive Cards", tech: "response UI" },

  { id: "mcp-server", tier: 1, row: 3, label: "MCP Server", tech: "13 tools · Zod" },
  { id: "oauth-guard", tier: 1, row: 5, label: "Entra ID", tech: "OAuth guard" },

  { id: "confirm-gate", tier: 2, row: 2, label: "Confirmation Gate", tech: "schema-enforced" },
  { id: "risk-gate", tier: 2, row: 4, label: "Risk Gate", tech: "deterministic" },
  { id: "advisory", tier: 2, row: 6, label: "Foundry Advisory", tech: "multi-step reasoning" },

  { id: "registry", tier: 3, row: 2, label: "Capability Registry", tech: "Table Storage" },
  { id: "audit", tier: 3, row: 4, label: "Audit Ledger", tech: "correlation IDs" },
  { id: "key-vault", tier: 3, row: 6, label: "Key Vault", tech: "secrets" },

  { id: "foundry-floor", tier: 4, row: 3, label: "Foundry Floor", tech: "Static Web Apps" },
  { id: "app-insights", tier: 4, row: 5, label: "App Insights", tech: "telemetry" }
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

type Box = { left: number; right: number; top: number; bottom: number; cx: number; cy: number };

function boxOf(el: Element, origin: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - origin.left,
    right: r.right - origin.left,
    top: r.top - origin.top,
    bottom: r.bottom - origin.top,
    cx: (r.left + r.right) / 2 - origin.left,
    cy: (r.top + r.bottom) / 2 - origin.top
  };
}

// Pure right-angle routing in pixel space: horizontal then vertical then
// horizontal (or a straight vertical for same-column links).
function orthogonalPath(a: Box, b: Box): string {
  if (Math.abs(a.cx - b.cx) < 2) {
    const [upper, lower] = a.cy <= b.cy ? [a, b] : [b, a];
    return `M ${a.cx} ${upper.bottom} V ${lower.top}`;
  }
  const [left, right] = a.cx < b.cx ? [a, b] : [b, a];
  const midX = (left.right + right.left) / 2;
  return `M ${left.right} ${left.cy} H ${midX} V ${right.cy} H ${right.left}`;
}

export function ArchitectureView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [edges, setEdges] = useState<Array<{ id: string; d: string }>>([]);
  const linked = hovered ? neighborsOf(hovered) : null;
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const recompute = useCallback((id: string | null) => {
    const body = bodyRef.current;
    if (!body || !id) {
      setEdges([]);
      return;
    }
    const origin = body.getBoundingClientRect();
    const next: Array<{ id: string; d: string }> = [];
    for (const [a, b] of CONNECTIONS) {
      if (a !== id && b !== id) {
        continue;
      }
      const aEl = body.querySelector(`[data-arch-id="${a}"]`);
      const bEl = body.querySelector(`[data-arch-id="${b}"]`);
      if (!aEl || !bEl) {
        continue;
      }
      next.push({ id: `${a}-${b}`, d: orthogonalPath(boxOf(aEl, origin), boxOf(bEl, origin)) });
    }
    setEdges(next);
  }, []);

  useLayoutEffect(() => {
    recompute(hovered);
    if (!hovered) {
      return;
    }
    const onResize = () => recompute(hovered);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hovered, recompute]);

  function cardState(id: string): string {
    if (!hovered) {
      return "";
    }
    if (id === hovered) {
      return "is-hovered";
    }
    return linked?.has(id) ? "is-linked" : "is-dim";
  }

  return (
    <section className="arch2" aria-label="Architecture">
      <div className="arch2-head">
        <div>
          <p className="eyebrow">System architecture</p>
          <h1>Signal Foundry, tier by tier</h1>
          <p className="arch2-sub">Hover any service to trace its connections — only then do the linked services and their right-angle paths light up.</p>
        </div>
        <div className="arch2-legend">
          <span><i className="arch2-legend-flow" /> Connection (on hover)</span>
          <span><i className="arch2-legend-node" /> Service</span>
        </div>
      </div>

      <div className="arch2-canvas">
        <div className="arch2-headers">
          {TIERS.map((tier) => <div key={tier} className="arch2-header">{tier}</div>)}
        </div>

        <div className="arch2-body" ref={bodyRef}>
          <div className="arch2-grid">
            {TIERS.map((_, tier) => (
              <div key={tier} className="arch2-band" style={{ gridColumn: tier + 1, gridRow: "1 / -1" }} aria-hidden="true" />
            ))}
            {SERVICES.map((node) => (
              <div
                key={node.id}
                data-arch-id={node.id}
                className={`arch2-card ${cardState(node.id)}`}
                style={{ gridColumn: node.tier + 1, gridRow: node.row }}
                tabIndex={0}
                role="button"
                aria-label={`${node.label}, ${node.tech}`}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered((current) => (current === node.id ? null : current))}
                onFocus={() => setHovered(node.id)}
                onBlur={() => setHovered((current) => (current === node.id ? null : current))}
              >
                <strong>{node.label}</strong>
                <span>{node.tech}</span>
              </div>
            ))}
          </div>

          <svg className="arch2-overlay" aria-hidden="true">
            {edges.map((edge) => (
              <path key={edge.id} className="arch2-edge" d={edge.d} />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
