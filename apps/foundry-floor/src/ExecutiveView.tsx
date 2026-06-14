import { useEffect, useState } from "react";
import { ChevronRight, Lock, PackageCheck, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import type { AuditEvent, Capability, McpActivity, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { auditEvents, mcpActivity, releasePackets, reviewItems, riskLabels, riskReview, statusLabels } from "./data";
import { Pager } from "./ui";

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
  records = [],
  reviews = reviewItems,
  events = auditEvents,
  activity = mcpActivity,
  packets = releasePackets,
  riskReviews = [riskReview],
  onOpenReview
}: {
  selected: Capability;
  records?: readonly Capability[];
  reviews?: readonly ReviewItem[];
  events?: readonly AuditEvent[];
  activity?: readonly McpActivity[];
  packets?: readonly ReleasePacket[];
  riskReviews?: readonly RiskReview[];
  onOpenReview?: () => void;
}) {
  const governedWrites = activity.filter((item) => !EXECUTIVE_READ_ACTIONS.has(item.action) && item.status === "success").length;
  // Count capabilities still awaiting a human decision, using the exact same rule
  // as the Review Queue header (records in a pending-ish status) so the two
  // surfaces always reconcile. Falls back to raw pending review items only when
  // no records are supplied (sample-only render).
  const pendingReviews = records.length > 0
    ? records.filter((item) => ["proposed", "risk_scored", "in_review"].includes(item.status)).length
    : reviews.filter((item) => item.status === "pending").length;

  // Audit View: search across all columns + paginate (10/25/50).
  const [auditQuery, setAuditQuery] = useState("");
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [auditPage, setAuditPage] = useState(0);
  useEffect(() => {
    setAuditPage(0);
  }, [auditQuery, auditPageSize]);
  const aq = auditQuery.trim().toLowerCase();
  const filteredEvents = aq
    ? events.filter((event) =>
        [event.actor, auditActionLabel(event.action), event.action, event.targetRecord, event.correlationId]
          .some((value) => value.toLowerCase().includes(aq))
      )
    : events;
  const auditTotal = filteredEvents.length;
  const auditPageCount = Math.max(1, Math.ceil(auditTotal / auditPageSize));
  const auditSafePage = Math.min(auditPage, auditPageCount - 1);
  const pagedEvents = filteredEvents.slice(auditSafePage * auditPageSize, auditSafePage * auditPageSize + auditPageSize);

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
        <label className="audit-search">
          <Search size={15} aria-hidden />
          <input
            value={auditQuery}
            onChange={(event) => setAuditQuery(event.target.value)}
            placeholder="Search actor, action, record, or correlation ID…"
            aria-label="Search audit events"
          />
          {auditQuery ? (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setAuditQuery("")}>
              <X size={14} />
            </button>
          ) : null}
        </label>
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
            {pagedEvents.length === 0 ? (
              <tr><td colSpan={4} className="audit-empty">No audit events match “{auditQuery}”.</td></tr>
            ) : (
              pagedEvents.map((event, index) => (
                <tr key={event.id} className={index % 2 === 0 ? "audit-row-even" : "audit-row-odd"}>
                  <td>{event.actor}</td>
                  <td><strong title={event.action}>{auditActionLabel(event.action)}</strong></td>
                  <td><code className="audit-record-id">{event.targetRecord}</code></td>
                  <td><code className="audit-corr-id">{event.correlationId}</code></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {auditTotal > 0 ? (
          <Pager
            total={auditTotal}
            page={auditSafePage}
            pageSize={auditPageSize}
            pageSizes={[10, 25, 50]}
            onPage={setAuditPage}
            onPageSize={setAuditPageSize}
          />
        ) : null}
      </div>
      <button type="button" className="primary action-button" onClick={onOpenReview}>Open release packet <ChevronRight size={16} /></button>
    </section>
  );
}
