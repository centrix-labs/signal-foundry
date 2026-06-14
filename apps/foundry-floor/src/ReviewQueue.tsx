import { useEffect, useState } from "react";
import { AlertTriangle, Check, ClipboardCheck, PackageCheck } from "lucide-react";
import type { Capability, McpActivity, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { capabilities, mcpActivity, releasePackets, reviewItems, riskReview } from "./data";
import { decisionCopy } from "./decisionText";
import { Pager } from "./ui";
import { RiskGate } from "./RiskGate";
import { ReleasePacketDrawer } from "./ReleasePacket";
import { McpActivityRail } from "./McpActivityRail";

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

// A reviewer decision updates the capability's status (local demo override or a
// live release write). Derive each row's queue status from that capability state
// so an approval moves the row from Pending into Approved, a change request into
// Rejected, and a save keeps it Pending — list, filter, and count stay in sync.
function effectiveReviewStatus(item: ReviewItem, capability: Capability): string {
  switch (capability.status) {
    case "released":
    case "approved_for_release":
    case "approved":
      return "approved";
    case "rejected":
    case "blocked":
      return "rejected";
    case "proposed":
    case "risk_scored":
    case "in_review":
    case "candidate":
      return "pending";
    default:
      return item.status;
  }
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
  // rows that all highlighted together. The effective status reflects any
  // reviewer decision already taken on that capability.
  const renderableReviews = reviews
    .map((item) => {
      const capability = records.find((record) => record.id === item.proposalId);
      return capability ? { item, capability, status: effectiveReviewStatus(item, capability) } : null;
    })
    .filter((entry): entry is { item: ReviewItem; capability: Capability; status: string } => Boolean(entry));

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

  // Filter the queue by review status (default Pending) + paginate it.
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [reviewTab, setReviewTab] = useState<"risk" | "packet" | "mcp">("risk");
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const filteredReviews = statusFilter === "all"
    ? renderableReviews
    : renderableReviews.filter((entry) => entry.status === statusFilter);
  const total = filteredReviews.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const shownReviews = filteredReviews.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function selectReview(reviewId: string, capabilityId: string) {
    setActiveReviewId(reviewId);
    onSelect(capabilityId);
  }

  const REVIEW_FILTERS = [
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["all", "All"]
  ] as const;
  const REVIEW_TABS = [
    ["risk", "Risk Gate"],
    ["packet", "Release Packet"],
    ["mcp", "MCP Activity"]
  ] as const;

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
        <div className="review-filter" role="group" aria-label="Filter by status">
          {REVIEW_FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={statusFilter === key ? "is-active" : ""}
              aria-pressed={statusFilter === key}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="review-list-scroll">
          {total === 0 ? (
            <p className="review-empty">No {statusFilter === "all" ? "" : `${statusFilter} `}reviews in the queue.</p>
          ) : (
            shownReviews.map(({ item, capability, status }) => (
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
                <em className={`review-status ${status}`}>{reviewStatusLabel(status)}</em>
              </button>
            ))
          )}
        </div>
        {total > 0 ? (
          <Pager
            total={total}
            page={safePage}
            pageSize={pageSize}
            pageSizes={[5, 10, 20]}
            onPage={setPage}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        ) : null}
      </div>
      <div className="review-detail">
        <div className="review-decision">
          <div className={`decision-banner ${decisionState}`}>
            <strong>{decisionCopy[decisionState].title}</strong>
            <span>{decisionCopy[decisionState].body}</span>
          </div>
          <div className="approval-bar">
            <button type="button" className={decisionState === "changes_requested" ? "chosen" : ""} aria-pressed={decisionState === "changes_requested"} onClick={onRequestChanges}><AlertTriangle size={17} /> Request Changes</button>
            <button type="button" className={decisionState === "saved" ? "chosen" : ""} aria-pressed={decisionState === "saved"} onClick={onSaveForLater}><ClipboardCheck size={17} /> Save for Later</button>
            <button type="button" className={`primary ${decisionState === "released" ? "chosen" : ""}`} aria-pressed={decisionState === "released"} onClick={onApproveRelease}><Check size={18} /> {decisionState === "released" ? "Released" : "Approve & Release"}</button>
          </div>
        </div>
        <div className="mirror-tabs" role="tablist" aria-label="Review detail">
          {REVIEW_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={reviewTab === key}
              className={reviewTab === key ? "is-active" : ""}
              onClick={() => setReviewTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mirror-panel">
          {reviewTab === "risk" ? <RiskGate selected={selected} riskReviews={riskReviews} /> : null}
          {reviewTab === "packet" ? <ReleasePacketDrawer selected={selected} packets={packets} reviews={reviews} riskReviews={riskReviews} /> : null}
          {reviewTab === "mcp" ? <McpActivityRail compact paginate items={activity} /> : null}
        </div>
      </div>
    </section>
  );
}
