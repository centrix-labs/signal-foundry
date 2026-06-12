import { Fragment } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Lock,
  PackageCheck,
  ShieldCheck,
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
  statusLabels
} from "./data";
import { signOutUrl, type StaticWebAppUser } from "./auth";
import { decisionCopy } from "./decisionText";
import { proofSentence } from "./proofText";

export interface RecordFilters {
  role?: string;
  department?: string;
  pendingOnly?: boolean;
}

export function LeftRail({
  activeView,
  onView,
  records = capabilities,
  filters = {},
  onFiltersChange
}: {
  activeView: string;
  onView: (view: string) => void;
  records?: readonly Capability[];
  filters?: RecordFilters;
  onFiltersChange?: (filters: RecordFilters) => void;
}) {
  const groups = [
    ["For judges", [
      ["judge", "Judge Mode"],
      ["deck", "Judge Deck"]
    ]],
    ["Workspace", [
      ["floor", "Foundry Floor"],
      ["review", "Review Queue"],
      ["mirror", "Copilot Mirror"]
    ]],
    ["Insight", [
      ["atlas", "Signal Atlas"],
      ["pipeline", "Release Pipeline"],
      ["executive", "Light Executive"]
    ]]
  ] as const;
  const roles = [...new Set(records.map((item) => item.role))];
  const departments = [...new Set(records.map((item) => item.department))];

  function toggle(change: RecordFilters) {
    onFiltersChange?.({ ...filters, ...change });
  }

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
              <button key={key} type="button" className={activeView === key ? "active" : ""} onClick={() => onView(key)}>
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
      {["floor", "atlas", "pipeline", "review"].includes(activeView) ? (
      <div className="filter-stack">
        <span>Filters</span>
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            className={filters.role === role ? "active" : ""}
            aria-pressed={filters.role === role}
            onClick={() => toggle({ role: filters.role === role ? undefined : role })}
          >
            Role: {role}
          </button>
        ))}
        {departments.map((department) => (
          <button
            key={department}
            type="button"
            className={filters.department === department ? "active" : ""}
            aria-pressed={filters.department === department}
            onClick={() => toggle({ department: filters.department === department ? undefined : department })}
          >
            Department: {department}
          </button>
        ))}
        <button
          type="button"
          className={filters.pendingOnly ? "active" : ""}
          aria-pressed={Boolean(filters.pendingOnly)}
          onClick={() => toggle({ pendingOnly: filters.pendingOnly ? undefined : true })}
        >
          Stage: Pending Review
        </button>
      </div>
      ) : null}
    </aside>
  );
}

export function TopBar({
  theme,
  onThemeChange,
  user,
  searchQuery = "",
  onSearchChange
}: {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
  user?: StaticWebAppUser;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}) {
  const displayName = user?.userDetails || "Avery M.";
  const initials = displayName
    .split(/[.@\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AM";

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">Operations Command Center</p>
        <h1>Foundry Floor</h1>
      </div>
      <label className="search-box">
        <span>Search</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="renewals, risk gates, releases"
          aria-label="Search synthetic records"
        />
      </label>
      <div className="operator-badge">
        <span>{initials}</span>
        <div>
          <strong>{displayName}</strong>
          <small>{user ? "Microsoft authenticated" : "Release Manager"}</small>
        </div>
      </div>
      <a className="sign-out-link" href={signOutUrl()}>Sign out</a>
      <div className="theme-switch" aria-label="Theme">
        <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => onThemeChange("dark")}>Dark</button>
        <button type="button" className={theme === "light" ? "active" : ""} onClick={() => onThemeChange("light")}>Light</button>
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
        <button key={item.id} type="button" className={selectedId === item.id ? "selected" : ""} onClick={() => onSelect(item.id)}>
          <span className={`dot ${item.riskLevel}`} />
          <strong>{item.title}</strong>
          <small>{statusLabels[item.status]} / {riskLabels[item.riskLevel]} risk</small>
        </button>
      ))}
    </section>
  );
}

export function RiskGate({ selected, riskReviews = [riskReview], compact = false }: { selected: Capability; riskReviews?: readonly RiskReview[]; compact?: boolean }) {
  const isBlocked = selected.status === "blocked";
  const selectedRisk = riskReviews.find((item) => item.proposalId === selected.id) ?? riskReview;
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
      <div className="risk-score">
        <strong>{isBlocked ? "0" : selectedRisk.requiredControls.length}</strong>
        <span>{isBlocked ? "blocked controls" : "required controls"}</span>
      </div>
      <p>{isBlocked ? "Monitoring-style requests are refused. Convert the ask into a workflow-level capability before review." : selectedRisk.rationale}</p>
      {!isBlocked && <AdvisoryAnalysis review={selectedRisk} decision={reviewDecision} />}
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
  return (
    <div className="advisory-analysis comparison" aria-label="Advisory analysis">
      <div className="advisory-heading">
        <Sparkles size={14} />
        <strong>Advisory Analysis</strong>
        {advisory.model && <small>{advisory.model}</small>}
      </div>
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
      {disagrees ? <p className="advisory-arbitration" role="note">Advisory differs from the deterministic gate. Gate wins.</p> : <p className="advisory-agreement">Advisory agrees with the deterministic gate ({riskLabels[review.riskLevel]}).</p>}
      {advisory.steps && advisory.steps.length > 0 && (
        <ul className="advisory-steps">
          {advisory.steps.map((step) => (
            <li key={`${step.signal}-${step.concern}`}>
              <strong>{step.signal}</strong>
              <span>{step.concern}</span>
              <em>{step.suggestedControl}</em>
            </li>
          ))}
        </ul>
      )}
      <p className="advisory-note">Advisory only — the deterministic risk gate is the source of truth.</p>
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

export function McpActivityRail({ compact = false, proofMode = false, items = mcpActivity }: { compact?: boolean; proofMode?: boolean; items?: readonly McpActivity[] }) {
  const visibleItems = compact ? items.slice(0, 4) : items;
  return (
    <aside className={`panel mcp-rail ${compact ? "compact" : ""} ${proofMode ? "proof-timeline" : ""}`} aria-label={proofMode ? "MCP Evidence Timeline" : "MCP Activity"}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MCP Activity</p>
          <h2>Audit-safe trace</h2>
        </div>
        <span className="live-dot">Live</span>
      </div>
      {visibleItems.map((item) => (
        <article key={item.id} className={item.status}>
          <span className="activity-icon">{item.status === "success" ? <Check size={15} /> : item.status === "warning" ? <AlertTriangle size={15} /> : <Lock size={15} />}</span>
          <div>
            <strong>{item.action}</strong>
            <p>{proofMode ? proofSentence(item) : item.summary}</p>
            <small>{item.actor} / {item.correlationId}</small>
          </div>
        </article>
      ))}
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
  const selected = records.find((item) => item.id === selectedId) ?? records[0] ?? capabilities[0];
  const pendingCount = records.filter((item) => ["proposed", "risk_scored", "in_review"].includes(item.status)).length;
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
        {reviews.map((item) => {
          const capability = records.find((record) => record.id === item.proposalId) ?? capabilities[0];
          if (!capability) {
            return null;
          }
          return (
            <button key={item.id} type="button" className={selectedId === capability.id ? "selected" : ""} onClick={() => onSelect(capability.id)}>
              <PackageCheck size={22} />
              <span>
                <strong>{capability.title}</strong>
                <small>{capability.version} / {capability.department}</small>
              </span>
              <em>{item.status}</em>
            </button>
          );
        })}
      </div>
      <RiskGate selected={selected} riskReviews={riskReviews} />
      <ReleasePacketDrawer selected={selected} packets={packets} reviews={reviews} />
      <McpActivityRail compact items={activity} />
      <div className={`decision-banner ${decisionState}`}>
        <strong>{decisionCopy[decisionState].title}</strong>
        <span>{decisionCopy[decisionState].body}</span>
      </div>
      <div className="approval-bar">
        <button type="button" onClick={onRequestChanges}><AlertTriangle size={17} /> Request Changes</button>
        <button type="button" onClick={onSaveForLater}><ClipboardCheck size={17} /> Save for Later</button>
        <button type="button" className="primary" onClick={onApproveRelease}><Check size={18} /> Approve & Release</button>
      </div>
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
        <p>Judge-readable summary of how synthetic work signals become reviewed, released Copilot capabilities.</p>
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
        </div>
        {events.map((event) => (
          <div key={event.id}>
            <span>{event.actor}</span>
            <strong>{event.action}</strong>
            <small>{event.targetRecord}</small>
            <em>{event.correlationId}</em>
          </div>
        ))}
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
