import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AlertTriangle, Check, Lock } from "lucide-react";
import type { McpActivity } from "@signal-foundry/shared";
import { mcpActivity } from "./data";
import { proofSentence } from "./proofText";
import { relativeTime } from "./format";

const MCP_PAGE_SIZES = [5, 10, 20] as const;

export function McpActivityRail({
  compact = false,
  proofMode = false,
  items = mcpActivity,
  limit,
  paginate = false,
  maxHeight,
  onSelectRecord,
  filterLabel,
  onClearFilter
}: {
  compact?: boolean;
  proofMode?: boolean;
  items?: readonly McpActivity[];
  /** Max rows to show (defaults to 4 when compact, else all). Ignored when paginate. */
  limit?: number;
  /** Show a 5/10/20 page-size pager and step through pages. */
  paginate?: boolean;
  /** Cap the rail height (e.g. to match the Atlas) — the list scrolls within. */
  maxHeight?: number;
  /** When set, a row click selects the workflow that produced the call. */
  onSelectRecord?: (recordId: string) => void;
  /** When the list is scoped to one workflow, its title (drives the filter bar). */
  filterLabel?: string;
  /** Clear the workflow scope and show every audit line again. */
  onClearFilter?: () => void;
}) {
  // Newest governed calls first so the rail reads as a live trace.
  const sorted = [...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(0);
  // Snap back to the first page whenever the scope (filter) changes.
  useEffect(() => {
    setPage(0);
  }, [filterLabel]);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  const visibleItems = paginate
    ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)
    : sorted.slice(0, limit ?? (compact ? 4 : sorted.length));

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(0);
  }

  const firstShown = total === 0 ? 0 : safePage * pageSize + 1;
  const lastShown = Math.min(total, safePage * pageSize + pageSize);

  return (
    <aside
      className={`panel mcp-rail ${compact ? "compact" : ""} ${proofMode ? "proof-timeline" : ""} ${maxHeight ? "is-capped" : ""}`}
      style={maxHeight ? { height: maxHeight } : undefined}
      aria-label={proofMode ? "MCP Evidence Timeline" : "MCP Activity"}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MCP Activity</p>
          <h2>Audit-safe trace</h2>
        </div>
        {proofMode ? <span className="live-dot">Live</span> : <span className="atlas-live is-live">Live</span>}
      </div>
      {filterLabel ? (
        <div className="mcp-filter">
          <span>Scoped to <strong>{filterLabel}</strong></span>
          <button type="button" onClick={onClearFilter}>Show all</button>
        </div>
      ) : null}
      <div className="mcp-rail-list">
        {visibleItems.length === 0 ? (
          <p className="mcp-empty">No MCP calls recorded for this workflow yet.</p>
        ) : (
          visibleItems.map((item) => {
            const clickable = Boolean(onSelectRecord);
            return (
              <article
                key={item.id}
                className={`${item.status} ${clickable ? "is-clickable" : ""}`}
                {...(clickable
                  ? {
                      role: "button",
                      tabIndex: 0,
                      "aria-label": `${item.action} — show its workflow on the Atlas`,
                      onClick: () => onSelectRecord?.(item.recordId),
                      onKeyDown: (event: ReactKeyboardEvent) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectRecord?.(item.recordId);
                        }
                      }
                    }
                  : {})}
              >
                <span className="activity-icon">{item.status === "success" ? <Check size={15} /> : item.status === "warning" ? <AlertTriangle size={15} /> : <Lock size={15} />}</span>
                <div>
                  <strong>{item.action}</strong>
                  <p>{proofMode ? proofSentence(item) : item.summary}</p>
                  <small>{item.actor} / {item.correlationId}</small>
                </div>
                {!proofMode && relativeTime(item.timestamp) ? (
                  <time className="activity-time" dateTime={item.timestamp}>{relativeTime(item.timestamp)}</time>
                ) : null}
              </article>
            );
          })
        )}
      </div>
      {paginate && total > 0 ? (
        <div className="mcp-pager">
          <div className="mcp-pager-sizes" role="group" aria-label="Rows per page">
            <span>Show</span>
            {MCP_PAGE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={pageSize === size ? "is-active" : ""}
                aria-pressed={pageSize === size}
                onClick={() => changePageSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="mcp-pager-nav">
            <span className="mcp-pager-range">{firstShown}–{lastShown} of {total}</span>
            <button type="button" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>‹</button>
            <button type="button" aria-label="Next page" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>›</button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
