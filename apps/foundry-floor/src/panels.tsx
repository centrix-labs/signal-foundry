import { Fragment, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HelpCircle,
  Lock,
  PackageCheck,
  Search,
  ShieldCheck,
  ShieldX,
  Sparkles,
  X
} from "lucide-react";
import type { AuditEvent, Capability, McpActivity, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import {
  auditEvents,
  capabilities,
  controlChecks,
  mcpActivity,
  releasePackets,
  reviewItems,
  riskLabels,
  riskReview,
  statusLabels,
  synthesizeRiskReview
} from "./data";
import { signOutUrl, type StaticWebAppUser } from "./auth";
import { decisionCopy } from "./decisionText";
import { proofSentence } from "./proofText";

// Friendly labels for review-item statuses; humanizes any unmapped enum value
// so a raw "changes_requested" never reaches the UI.
const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  in_review: "In review",
  changes_requested: "Changes requested"
};

function reviewStatusLabel(status: string): string {
  return REVIEW_STATUS_LABELS[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function LeftRail({
  activeView,
  onView
}: {
  activeView: string;
  onView: (view: string) => void;
}) {
  const groups = [
    ["Overview", [
      ["judge", "Guided Story"],
      ["deck", "Highlights"]
    ]],
    ["Workspace", [
      ["floor", "Foundry Floor"],
      ["review", "Review Queue"],
      ["mirror", "Copilot Mirror"]
    ]],
    ["Insight", [
      ["atlas", "Signal Atlas"],
      ["architecture", "Architecture"],
      ["pipeline", "Release Pipeline"],
      ["executive", "Light Executive"]
    ]]
  ] as const;

  return (
    <aside className="left-rail" aria-label="Foundry navigation">
      <div className="brand-lockup">
        <span className="forge-mark">SF</span>
        <div>
          <strong>Signal Foundry</strong>
          <small>Summarized | Forged | Approved</small>
        </div>
      </div>
      <nav>
        {groups.map(([section, items]) => (
          <Fragment key={section}>
            <p className="nav-section">{section}</p>
            {items.map(([key, label]) => (
              <button key={key} type="button" data-tour={`nav-${key}`} className={activeView === key ? "active" : ""} onClick={() => onView(key)}>
                <Activity size={16} />
                {label}
              </button>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="context-card">
        <span>Active context</span>
        <strong>Customer Success Renewals</strong>
        <small>Production synthetic tenant</small>
        <small>SOC 2 + ISO 27001 controls</small>
      </div>
    </aside>
  );
}

export function TopBar({
  user,
  searchQuery = "",
  onSearchChange,
  onStartTour,
  records = [],
  onJumpToRecord
}: {
  user?: StaticWebAppUser;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onStartTour?: () => void;
  records?: readonly Capability[];
  onJumpToRecord?: (id: string) => void;
}) {
  const displayName = user?.userDetails || "Avery M.";
  const initials = displayName
    .split(/[.@\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AM";

  // Global search: from any screen, find a workflow and jump to it. Matching is
  // over title / role / department / status so a judge can land on a record fast.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const trimmed = searchQuery.trim().toLowerCase();
  const matches = trimmed
    ? records.filter((record) =>
        record.title.toLowerCase().includes(trimmed) ||
        record.role.toLowerCase().includes(trimmed) ||
        record.department.toLowerCase().includes(trimmed) ||
        statusLabels[record.status].toLowerCase().includes(trimmed)
      ).slice(0, 7)
    : [];
  const showResults = searchOpen && trimmed.length > 0 && Boolean(onJumpToRecord);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    function onDocClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  function jumpTo(id: string) {
    onJumpToRecord?.(id);
    setSearchOpen(false);
  }

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">Operations Command Center</p>
        <h1>Foundry Floor</h1>
      </div>
      <div className="search-box-wrap" ref={searchRef}>
        <label className="search-box">
          <Search size={15} aria-hidden />
          <input
            value={searchQuery}
            onChange={(event) => {
              onSearchChange?.(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="renewals, risk gates, releases"
            aria-label="Search workflows"
            role="combobox"
            aria-expanded={showResults}
            aria-controls="search-results"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                onSearchChange?.("");
                setSearchOpen(false);
              }}
            >
              <X size={14} />
            </button>
          ) : null}
        </label>
        {showResults ? (
          <ul className="search-results" id="search-results" role="listbox" aria-label="Search results">
            {matches.length === 0 ? (
              <li className="search-empty">No workflows match “{searchQuery}”.</li>
            ) : (
              matches.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => jumpTo(record.id)}
                  >
                    <span className={`dot ${record.riskLevel}`} />
                    <span className="search-result-text">
                      <strong>{record.title}</strong>
                      <small>{statusLabels[record.status]} · {record.department} · {record.owner}</small>
                    </span>
                    <ChevronRight size={14} aria-hidden />
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <div className="top-bar-right">
        {onStartTour ? (
          <button type="button" className="tour-help-btn" onClick={onStartTour} aria-label="Open the walkthrough">
            <HelpCircle size={15} /> How to use
          </button>
        ) : null}
        <div className="operator-badge">
          <span>{initials}</span>
          <div>
            <strong>{displayName}</strong>
            <small>{user ? "Microsoft authenticated" : "Release Manager"}</small>
          </div>
        </div>
        <a className="sign-out-link" href={signOutUrl()}>Sign out</a>
      </div>
    </header>
  );
}

export function CapabilityList({
  records = capabilities,
  selectedId,
  onSelect
}: {
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel capability-list" aria-label="Capability records">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registry</p>
          <h2>Capability records</h2>
        </div>
      </div>
      {records.length === 0 && (
        <p className="empty-state">No records match the current search and filters.</p>
      )}
      {records.map((item) => (
        <button key={item.id} type="button" className={selectedId === item.id ? "selected" : ""} aria-pressed={selectedId === item.id} onClick={() => onSelect(item.id)}>
          <span className={`dot ${item.riskLevel}`} />
          <strong>{item.title}</strong>
          <small>{statusLabels[item.status]} / {riskLabels[item.riskLevel]} risk · {item.owner}</small>
        </button>
      ))}
    </section>
  );
}

export function RiskGate({ selected, riskReviews = [riskReview], compact = false }: { selected: Capability; riskReviews?: readonly RiskReview[]; compact?: boolean }) {
  const isBlocked = selected.status === "blocked";
  const selectedRisk = riskReviews.find((item) => item.proposalId === selected.id) ?? synthesizeRiskReview(selected);
  const reviewDecision = selectedRisk.requiresHumanReview ? "Human review required" : "Assistive release path";
  return (
    <section className={`panel risk-gate ${compact ? "compact-risk" : ""}`} aria-label="Risk Gate">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Risk Gate</p>
          <h2>{isBlocked ? "Release blocked" : "Controls before release"}</h2>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]}</span>
      </div>
      {isBlocked ? (
        <div className="refusal-banner" role="alert">
          <div className="refusal-head">
            <span className="refusal-mark" aria-hidden="true"><ShieldX size={20} /></span>
            <div>
              <strong>Refused — anti-surveillance boundary</strong>
              <small>Enforced by design. No reviewer can override it.</small>
            </div>
          </div>
          <p className="refusal-request"><span>Attempted ask</span>“Rank my team by productivity and flag the bottom performers.”</p>
          <p className="refusal-reason">Signal Foundry refuses monitoring or ranking of people — blocked at the agent instructions and again at the deterministic gate, before a human ever sees it.</p>
          <p className="refusal-protected"><Check size={14} /> Protected: employee activity was never scored, stored, or released.</p>
        </div>
      ) : (
        <>
          <div className="risk-score">
            <strong>{selectedRisk.requiredControls.length}</strong>
            <span>required controls</span>
          </div>
          <p>{selectedRisk.rationale}</p>
          <AdvisoryAnalysis review={selectedRisk} decision={reviewDecision} />
        </>
      )}
      <div className="checklist">
        {controlChecks.map((check) => (
          <details key={check.label} open={check.status !== "passed"}>
            <summary>
              {check.status === "passed" ? <Check size={15} /> : check.status === "failed" ? <X size={15} /> : <AlertTriangle size={15} />}
              <span>{check.label}</span>
              <em>{check.status}</em>
            </summary>
            <p>{check.evidence}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function AdvisoryAnalysis({ review, decision }: { review: RiskReview; decision: string }) {
  const advisory = review.advisory;
  const suggested = advisory?.suggestedRiskLevel ? riskLabels[advisory.suggestedRiskLevel] : advisory?.status === "available" ? "Not provided" : "Unavailable";
  const reason = advisory?.summary ?? advisory?.steps?.[0]?.concern ?? (advisory?.status === "available" ? "Not provided" : "Deterministic verdict stands.");
  if (!advisory || advisory.status !== "available") {
    return (
      <div className="advisory-analysis comparison muted" aria-label="Advisory analysis">
        <article>
          <strong>AI advisory</strong>
          <p>Unavailable. Deterministic verdict stands.</p>
        </article>
        <article>
          <strong>Deterministic gate</strong>
          <p>{decision}. Source of truth for release.</p>
        </article>
        <p className="advisory-note">Controls remain based on the deterministic risk review.</p>
      </div>
    );
  }
  const disagrees = advisory.agreesWithGate === false;
  const hasSteps = Boolean(advisory.steps && advisory.steps.length > 0);
  return (
    <div className="advisory-analysis comparison" aria-label="Advisory analysis">
      <div className="advisory-heading">
        <Sparkles size={14} />
        <strong>Multi-step reasoning</strong>
        {advisory.model && <small>{advisory.model}</small>}
      </div>

      {hasSteps && (
        <ol className="advisory-steps reasoning-star" aria-label="The model's step-by-step risk deliberation">
          {advisory.steps!.map((step, index) => (
            <li key={`${step.signal}-${step.concern}`} style={{ animationDelay: `${index * 220}ms` }}>
              <span className="step-num" aria-hidden="true">{index + 1}</span>
              <div className="step-body">
                <strong>{step.signal}</strong>
                <span>{step.concern}</span>
                <em>→ {step.suggestedControl}</em>
              </div>
            </li>
          ))}
        </ol>
      )}

      {advisory.selfCritique && (
        <p className="advisory-selfcritique"><strong>Self-critique:</strong> {advisory.selfCritique}</p>
      )}

      <div className="risk-comparison-grid">
        <article className={disagrees ? "advisory-warn" : "advisory-ok"}>
          <strong>AI advisory</strong>
          <p>Suggested: {suggested}. {reason}</p>
        </article>
        <article className="deterministic-wins">
          <strong>Deterministic gate</strong>
          <p>{decision}. Source of truth for release.</p>
        </article>
      </div>
      {disagrees ? <p className="advisory-arbitration" role="note">Advisory differs from the deterministic gate. The model reasons; the gate guarantees.</p> : <p className="advisory-agreement">Advisory agrees with the deterministic gate ({riskLabels[review.riskLevel]}).</p>}
      <p className="advisory-note advisory-quote">Unplug the model — the verdict is byte-identical. Proven by test, not promised.</p>
    </div>
  );
}

export function ReleasePacketDrawer({
  selected,
  packets = releasePackets,
  reviews = reviewItems
}: {
  selected: Capability;
  packets?: readonly ReleasePacket[];
  reviews?: readonly ReviewItem[];
}) {
  const packet = packets.find((item) => item.capabilityId === selected.id) ?? makePendingPacket(selected, reviews);
  return (
    <section className="panel release-packet" aria-label="Release Packet">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Release Packet</p>
          <h2>{selected.title}</h2>
        </div>
        <span className="status-pill approved">{packet.version}</span>
      </div>
      <dl className="packet-grid">
        <div><dt>Owner</dt><dd>{packet.owner}</dd></div>
        <div><dt>Reviewer</dt><dd>{packet.reviewer}</dd></div>
        <div><dt>Audience</dt><dd>{packet.approvedAudience}</dd></div>
        <div><dt>Correlation ID</dt><dd>{packet.correlationId}</dd></div>
      </dl>
      <div className="artifact-list">
        {["Workflow spec", "Risk assessment", "Data-flow diagram", "Runbook"].map((artifact, index) => (
          <div key={artifact}>
            <FileText size={16} />
            <span>{artifact}</span>
            <small>v1.{index} / synthetic</small>
          </div>
        ))}
      </div>
      <ul>
        {packet.usageGuidance.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function relativeTime(timestamp: string): string {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

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

export function ReviewQueue({
  records = capabilities,
  reviews = reviewItems,
  packets = releasePackets,
  riskReviews = [riskReview],
  activity = mcpActivity,
  selectedId,
  decisionState,
  onSelect,
  onRequestChanges,
  onSaveForLater,
  onApproveRelease
}: {
  records?: readonly Capability[];
  reviews?: readonly ReviewItem[];
  packets?: readonly ReleasePacket[];
  riskReviews?: readonly RiskReview[];
  activity?: readonly McpActivity[];
  selectedId: string;
  decisionState: "pending" | "saved" | "changes_requested" | "released";
  onSelect: (id: string) => void;
  onRequestChanges: () => void;
  onSaveForLater: () => void;
  onApproveRelease: () => void;
}) {
  // Pair each review with its proposal record. Reviews whose proposal is missing
  // (e.g. its record was filtered as demo noise) are orphans — skip them rather
  // than collapsing to a shared fallback, which used to render several identical
  // rows that all highlighted together.
  const renderableReviews = reviews
    .map((item) => ({ item, capability: records.find((record) => record.id === item.proposalId) }))
    .filter((entry): entry is { item: ReviewItem; capability: Capability } => Boolean(entry.capability));

  // Highlight by the review row's own identity, not the capability id, so two
  // reviews of the same proposal never light up together. Falls back to the
  // row matching the incoming selection, then the first row.
  const [activeReviewId, setActiveReviewId] = useState<string>("");
  const activeReview =
    renderableReviews.find((entry) => entry.item.id === activeReviewId) ??
    renderableReviews.find((entry) => entry.capability.id === selectedId) ??
    renderableReviews[0];
  const selected = activeReview?.capability ?? records.find((item) => item.id === selectedId) ?? records[0] ?? capabilities[0];
  const pendingCount = records.filter((item) => ["proposed", "risk_scored", "in_review"].includes(item.status)).length;

  function selectReview(reviewId: string, capabilityId: string) {
    setActiveReviewId(reviewId);
    onSelect(capabilityId);
  }

  return (
    <section className="review-queue-layout">
      <div className="review-list panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Review Queue</p>
            <h2>Human approval required</h2>
          </div>
          <span className="status-pill pending">{pendingCount} pending</span>
        </div>
        {renderableReviews.length === 0 ? (
          <p className="review-empty">No reviews in the queue — every proposal is approved or released.</p>
        ) : null}
        {renderableReviews.map(({ item, capability }) => (
          <button
            key={item.id}
            type="button"
            className={activeReview?.item.id === item.id ? "selected" : ""}
            aria-pressed={activeReview?.item.id === item.id}
            onClick={() => selectReview(item.id, capability.id)}
          >
            <PackageCheck size={22} />
            <span>
              <strong>{capability.title}</strong>
              <small>{capability.version} · {capability.owner}</small>
              <small>{capability.department}</small>
            </span>
            <em className={`review-status ${item.status}`}>{reviewStatusLabel(item.status)}</em>
          </button>
        ))}
      </div>
      <div className="decision-pane">
        <div className={`decision-banner ${decisionState}`}>
          <strong>{decisionCopy[decisionState].title}</strong>
          <span>{decisionCopy[decisionState].body}</span>
        </div>
        <div className="approval-bar">
          <button type="button" className={decisionState === "changes_requested" ? "chosen" : ""} aria-pressed={decisionState === "changes_requested"} onClick={onRequestChanges}><AlertTriangle size={17} /> Request Changes</button>
          <button type="button" className={decisionState === "saved" ? "chosen" : ""} aria-pressed={decisionState === "saved"} onClick={onSaveForLater}><ClipboardCheck size={17} /> Save for Later</button>
          <button type="button" className={`primary ${decisionState === "released" ? "chosen" : ""}`} aria-pressed={decisionState === "released"} onClick={onApproveRelease}><Check size={18} /> {decisionState === "released" ? "Released" : "Approve & Release"}</button>
        </div>
        <RiskGate selected={selected} riskReviews={riskReviews} />
      </div>
      <ReleasePacketDrawer selected={selected} packets={packets} reviews={reviews} />
      <McpActivityRail compact items={activity} />
    </section>
  );
}

// Mirrors READ_ACTIONS in JudgeDeck.tsx so the executive strip classifies
// governed writes with the exact same rule the Judge Deck uses. Keep in sync.
const EXECUTIVE_READ_ACTIONS = new Set([
  "search_capabilities",
  "recommend_capabilities_for_role",
  "get_user_work_context",
  "generate_release_packet",
  "generate_capability_map",
  "list_mcp_activity"
]);

// Raw MCP tool / event names are precise but read as machine identifiers on an
// executive surface. Translate the known ones to plain language and humanise the
// rest; the canonical name stays available in a tooltip for auditors.
const AUDIT_ACTION_LABELS: Record<string, string> = {
  create_capability_proposal: "Created proposal",
  "proposal.created": "Created proposal",
  submit_capability_review: "Submitted for review",
  score_capability_risk: "Scored risk",
  "risk.scored": "Scored risk",
  approve_capability: "Approved capability",
  "review.approved": "Approved review",
  "review.changes_requested": "Requested changes",
  generate_release_packet: "Generated release packet",
  "mcp.rejected": "Blocked at boundary"
};

function auditActionLabel(action: string): string {
  const known = AUDIT_ACTION_LABELS[action];
  if (known) {
    return known;
  }
  const spaced = action.replace(/[_.]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function ExecutiveView({
  selected,
  reviews = reviewItems,
  events = auditEvents,
  activity = mcpActivity,
  packets = releasePackets,
  riskReviews = [riskReview],
  onOpenReview
}: {
  selected: Capability;
  reviews?: readonly ReviewItem[];
  events?: readonly AuditEvent[];
  activity?: readonly McpActivity[];
  packets?: readonly ReleasePacket[];
  riskReviews?: readonly RiskReview[];
  onOpenReview?: () => void;
}) {
  const governedWrites = activity.filter((item) => !EXECUTIVE_READ_ACTIONS.has(item.action) && item.status === "success").length;
  const pendingReviews = reviews.filter((item) => item.status === "pending").length;
  const latestRisk = riskReviews[0];
  const advisory = latestRisk?.advisory;
  const advisoryTone = advisory?.status === "available"
    ? advisory.agreesWithGate === false ? "disagrees" : "agrees"
    : "unavailable";
  const advisoryNote = advisoryTone === "disagrees"
    ? "Advisory disagrees — gate wins"
    : advisoryTone === "agrees"
      ? "Advisory agrees"
      : "Advisory unavailable";
  return (
    <section className="executive-view">
      <div className="executive-glance" role="group" aria-label="Governance at a glance">
        <span className="executive-glance-title">Governance at a glance</span>
        <div className="executive-glance-metric">
          <strong>{governedWrites}</strong>
          <span>Governed writes</span>
        </div>
        <div className="executive-glance-metric">
          <strong>{pendingReviews}</strong>
          <span>Pending human reviews</span>
        </div>
        <div className="executive-glance-metric">
          <strong>{packets.length}</strong>
          <span>Released packets</span>
        </div>
        <div className="executive-glance-metric">
          <strong>{latestRisk ? riskLabels[latestRisk.riskLevel] : "Pending"}</strong>
          <span>Deterministic verdict</span>
          <em className={`executive-glance-advisory ${advisoryTone}`}>{advisoryNote}</em>
        </div>
      </div>
      <div className="executive-hero">
        <p className="eyebrow">Signal Foundry</p>
        <h2>Approved workflow launchpad</h2>
        <p>An at-a-glance summary of how work signals become reviewed, approved Copilot capabilities across your tenant.</p>
        <p className="executive-determinism-proof">
          <Lock size={13} />
          Byte-identical verdict — model on or off. The deterministic gate runs before and independently of AI advisory; unplugging the model produces the same release decision.
        </p>
      </div>
      <div className="executive-grid">
        <div className="panel">
          <ShieldCheck size={24} />
          <strong>Human review blocks release</strong>
          <span>{pendingReviews} pending decisions</span>
        </div>
        <div className="panel">
          <Sparkles size={24} />
          <strong>Signal Atlas maps value</strong>
          <span>Signals, roles, risk gates, workflows</span>
        </div>
        <div className="panel">
          <PackageCheck size={24} />
          <strong>Packet ready</strong>
          <span>{selected.title} / {statusLabels[selected.status]}</span>
        </div>
      </div>
      <div className="panel audit-table">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Audit View</p>
            <h2>Sanitized evidence</h2>
          </div>
          <span className="executive-audit-note"><ShieldCheck size={13} /> No raw content</span>
        </div>
        <table className="audit-grid" role="table" aria-label="Sanitized audit events">
          <thead>
            <tr>
              <th scope="col">Actor</th>
              <th scope="col">Action</th>
              <th scope="col">Record</th>
              <th scope="col">Correlation ID</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={event.id} className={index % 2 === 0 ? "audit-row-even" : "audit-row-odd"}>
                <td>{event.actor}</td>
                <td><strong title={event.action}>{auditActionLabel(event.action)}</strong></td>
                <td><code className="audit-record-id">{event.targetRecord}</code></td>
                <td><code className="audit-corr-id">{event.correlationId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="primary action-button" onClick={onOpenReview}>Open release packet <ChevronRight size={16} /></button>
    </section>
  );
}

function makePendingPacket(selected: Capability, reviews: readonly ReviewItem[]): ReleasePacket {
  const review = reviews.find((item) => item.proposalId === selected.id);
  return {
    id: `packet-${selected.id}`,
    capabilityId: selected.id,
    version: selected.version,
    owner: selected.owner,
    approvedAudience: selected.intendedAudience,
    approvedSourceTypes: selected.approvedSourceTypes,
    requiredHumanReview: true,
    usageGuidance: ["Hold release until reviewer approval", "Use approved summaries only", "Keep correlation IDs sanitized"],
    reviewer: review?.reviewer ?? "Pending reviewer assignment",
    releasedAt: "Pending reviewer approval",
    correlationId: review?.correlationId ?? `corr-${selected.id}`
  };
}
