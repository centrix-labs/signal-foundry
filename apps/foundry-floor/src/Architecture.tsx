import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { ViewKey } from "./data";

type ServiceNode = {
  id: string;
  tier: number;
  label: string;
  tech: string;
};

const TIERS = ["Microsoft 365", "Governed Edge", "Reasoning & Gate", "Data & Audit", "Experience & Ops"];

// Each column simply stacks its services from the top — no placeholder cells.
const SERVICES: ServiceNode[] = [
  { id: "copilot-chat", tier: 0, label: "Copilot Chat", tech: "Microsoft 365" },
  { id: "declarative-agent", tier: 0, label: "Declarative Agent", tech: "manifest v1.6" },
  { id: "work-iq", tier: 0, label: "Work IQ", tech: "People + Meetings" },
  { id: "adaptive-cards", tier: 0, label: "Adaptive Cards", tech: "response UI" },

  { id: "mcp-server", tier: 1, label: "MCP Server", tech: "13 tools · Zod" },
  { id: "oauth-guard", tier: 1, label: "Entra ID", tech: "OAuth guard" },

  { id: "confirm-gate", tier: 2, label: "Confirmation Gate", tech: "schema-enforced" },
  { id: "risk-gate", tier: 2, label: "Risk Gate", tech: "deterministic" },
  { id: "advisory", tier: 2, label: "Foundry Advisory", tech: "multi-step reasoning" },

  { id: "registry", tier: 3, label: "Capability Registry", tech: "Table Storage" },
  { id: "audit", tier: 3, label: "Audit Ledger", tech: "correlation IDs" },
  { id: "key-vault", tier: 3, label: "Key Vault", tech: "secrets" },

  { id: "foundry-floor", tier: 4, label: "Foundry Floor", tech: "Static Web Apps" },
  { id: "app-insights", tier: 4, label: "App Insights", tech: "telemetry" }
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

// Services that map to a place in the app you can jump to.
const DEEP_LINKS: Partial<Record<string, ViewKey>> = {
  "copilot-chat": "mirror",
  "declarative-agent": "mirror",
  "risk-gate": "review",
  advisory: "review",
  audit: "review",
  "foundry-floor": "floor"
};

// The data-trust boundary spans the governed tiers where raw M365 content never lands.
const BOUNDARY_TIERS = [1, 2, 3];

const SERVICES_BY_TIER = TIERS.map((_, tier) => SERVICES.filter((node) => node.tier === tier));
const SERVICE_LABEL = new Map(SERVICES.map((node) => [node.id, node.label] as const));

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

// Pure right-angle routing in pixel space.
function orthogonalPath(a: Box, b: Box): string {
  if (Math.abs(a.cx - b.cx) < 2) {
    const [upper, lower] = a.cy <= b.cy ? [a, b] : [b, a];
    return `M ${a.cx} ${upper.bottom} V ${lower.top}`;
  }
  const [left, right] = a.cx < b.cx ? [a, b] : [b, a];
  const midX = (left.right + right.left) / 2;
  return `M ${left.right} ${left.cy} H ${midX} V ${right.cy} H ${right.left}`;
}

type ArchitectureViewProps = {
  onOpenView?: (view: ViewKey) => void;
};

export function ArchitectureView({ onOpenView }: ArchitectureViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string>(SERVICES[0]!.id);
  const [edges, setEdges] = useState<Array<{ id: string; d: string }>>([]);
  const [boundary, setBoundary] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const active = pinned ?? hovered;
  const linked = active ? neighborsOf(active) : null;

  const recomputeEdges = useCallback((id: string | null) => {
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
      // route from the active node outward so the arrowhead points at the neighbour
      const [from, to] = a === id ? [a, b] : [b, a];
      const fromEl = body.querySelector(`[data-arch-id="${from}"]`);
      const toEl = body.querySelector(`[data-arch-id="${to}"]`);
      if (!fromEl || !toEl) {
        continue;
      }
      next.push({ id: `${from}-${to}`, d: orthogonalPath(boxOf(fromEl, origin), boxOf(toEl, origin)) });
    }
    setEdges(next);
  }, []);

  const recomputeBoundary = useCallback(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }
    const origin = body.getBoundingClientRect();
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const tier of BOUNDARY_TIERS) {
      const col = body.querySelector(`[data-arch-tier="${tier}"]`);
      if (!col) {
        continue;
      }
      const box = boxOf(col, origin);
      left = Math.min(left, box.left);
      right = Math.max(right, box.right);
      top = Math.min(top, box.top);
      bottom = Math.max(bottom, box.bottom);
    }
    if (left === Infinity) {
      setBoundary(null);
      return;
    }
    const pad = 7;
    setBoundary({ x: left - pad, y: top - pad, w: right - left + pad * 2, h: bottom - top + pad * 2 });
  }, []);

  useLayoutEffect(() => {
    recomputeEdges(active);
    recomputeBoundary();
    const onResize = () => {
      recomputeEdges(active);
      recomputeBoundary();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, recomputeEdges, recomputeBoundary]);

  function cardState(id: string): string {
    if (!active) {
      return "";
    }
    if (id === pinned) {
      return "is-pinned";
    }
    if (id === active) {
      return "is-hovered";
    }
    return linked?.has(id) ? "is-linked" : "is-dim";
  }

  function togglePin(id: string) {
    setPinned((current) => (current === id ? null : id));
  }

  function onCanvasClick(event: React.MouseEvent) {
    if (!(event.target as Element).closest("[data-arch-id]")) {
      setPinned(null);
    }
  }

  // Roving keyboard navigation between cards.
  function moveFocus(node: ServiceNode, key: string) {
    const column = SERVICES_BY_TIER[node.tier]!;
    const indexInColumn = column.indexOf(node);
    let target: ServiceNode | undefined;
    if (key === "ArrowDown") {
      target = column[Math.min(indexInColumn + 1, column.length - 1)];
    } else if (key === "ArrowUp") {
      target = column[Math.max(indexInColumn - 1, 0)];
    } else if (key === "ArrowRight" || key === "ArrowLeft") {
      const nextTier = key === "ArrowRight" ? node.tier + 1 : node.tier - 1;
      const neighbourColumn = SERVICES_BY_TIER[nextTier];
      if (neighbourColumn && neighbourColumn.length > 0) {
        const ratio = column.length > 1 ? indexInColumn / (column.length - 1) : 0.5;
        const targetIndex = Math.round(ratio * (neighbourColumn.length - 1));
        target = neighbourColumn[targetIndex];
      }
    }
    if (target && target.id !== node.id) {
      setFocusId(target.id);
      bodyRef.current?.querySelector<HTMLElement>(`[data-arch-id="${target.id}"]`)?.focus();
    }
  }

  function onCardKeyDown(event: React.KeyboardEvent, node: ServiceNode) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePin(node.id);
    } else if (event.key === "Escape") {
      setPinned(null);
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      moveFocus(node, event.key);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPinned(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const announce = active
    ? `${SERVICE_LABEL.get(active)} connects to: ${[...neighborsOf(active)].map((id) => SERVICE_LABEL.get(id)).join(", ")}`
    : "";

  return (
    <section className="arch2" aria-label="Architecture">
      <div className="arch2-head">
        <div>
          <p className="eyebrow">System architecture</p>
          <h1>Signal Foundry, tier by tier</h1>
          <p className="arch2-sub">Hover a service to trace its connections, or click to pin it. The dashed boundary marks where summary-only data is enforced — no raw M365 content passes it.</p>
        </div>
        <div className="arch2-legend">
          <span><i className="arch2-legend-flow" /> Connection (hover / pin)</span>
          <span><i className="arch2-legend-boundary" /> Summary-only boundary</span>
        </div>
      </div>

      <div className="arch2-canvas">
        <div className="arch2-body" ref={bodyRef} onClick={onCanvasClick}>
          <div className="arch2-cols">
            {TIERS.map((tier, tierIndex) => (
              <div key={tier} className="arch2-col" data-arch-tier={tierIndex}>
                <div className="arch2-header">{tier}</div>
                <div className="arch2-col-cards">
                  {SERVICES_BY_TIER[tierIndex]!.map((node) => {
                    const deepLink = DEEP_LINKS[node.id];
                    return (
                      <div
                        key={node.id}
                        data-arch-id={node.id}
                        className={`arch2-card ${cardState(node.id)}`}
                        role="button"
                        tabIndex={focusId === node.id ? 0 : -1}
                        aria-pressed={pinned === node.id}
                        aria-label={`${node.label}, ${node.tech}`}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered((current) => (current === node.id ? null : current))}
                        onFocus={() => {
                          setFocusId(node.id);
                          setHovered(node.id);
                        }}
                        onBlur={() => setHovered((current) => (current === node.id ? null : current))}
                        onClick={() => togglePin(node.id)}
                        onKeyDown={(event) => onCardKeyDown(event, node)}
                      >
                        <div className="arch2-card-text">
                          <strong>{node.label}</strong>
                          <span>{node.tech}</span>
                        </div>
                        {deepLink && onOpenView ? (
                          <button
                            type="button"
                            className="arch2-card-link"
                            aria-label={`Open ${node.label} in the app`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenView(deepLink);
                            }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <svg className="arch2-overlay" aria-hidden="true">
            <defs>
              <marker id="arch2Arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9" />
              </marker>
            </defs>
            {boundary ? (
              <g className="arch2-boundary">
                <rect x={boundary.x} y={boundary.y} width={boundary.w} height={boundary.h} rx={12} />
                <text x={boundary.x + boundary.w / 2} y={Math.max(11, boundary.y - 6)} textAnchor="middle">summary-only — no raw M365 content past here</text>
              </g>
            ) : null}
            {edges.map((edge) => (
              <g key={edge.id} className="arch2-edge-group">
                <path className="arch2-edge" d={edge.d} markerEnd="url(#arch2Arrow)" />
                <path className="arch2-edge-pulse" d={edge.d} pathLength={1} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">{announce}</p>
    </section>
  );
}
