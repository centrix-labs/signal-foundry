import { useEffect, useState } from "react";
import { Activity, ChevronRight, X } from "lucide-react";
import type { Capability, CapabilityStatus } from "@signal-foundry/shared";
import { CapabilityList, McpActivityRail, ReleasePacketDrawer, RiskGate } from "./panels";
import { copilotTurns, riskLabels, statusLabels } from "./data";
import type { DashboardData } from "./liveData";

const STEPPER_ORDER: CapabilityStatus[] = ["proposed", "risk_scored", "in_review", "approved_for_release", "released"];
const STEPPER_LABELS: Record<string, string> = {
  proposed: "Proposed",
  risk_scored: "Scored",
  in_review: "In review",
  approved_for_release: "Approved",
  released: "Released"
};

function MiniStepper({ status }: { status: CapabilityStatus }) {
  if (status === "rejected" || status === "blocked") {
    return (
      <div className="mini-stepper terminal" aria-label={`Workflow state: ${statusLabels[status]}`}>
        <span className="terminal-chip">{statusLabels[status]}</span>
      </div>
    );
  }
  // approved/candidate registry records map onto the released end of the journey
  const effective = status === "approved" || status === "candidate" ? "released" : status;
  const activeIndex = STEPPER_ORDER.indexOf(effective);
  return (
    <div className="mini-stepper" aria-label={`Workflow stage: ${statusLabels[status]}`}>
      {STEPPER_ORDER.map((step, index) => (
        <span
          key={step}
          className={`stepper-seg ${index < activeIndex ? "done" : index === activeIndex ? "current" : ""}`}
        >
          {STEPPER_LABELS[step]}
        </span>
      ))}
    </div>
  );
}

export function Workbench({
  records,
  selected,
  selectedId,
  onSelect,
  activity,
  packets,
  reviews,
  riskReviews,
  checkpoints = [],
  onOpenMirror
}: {
  records: readonly Capability[];
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
  activity: DashboardData["mcpActivity"];
  packets: DashboardData["releasePackets"];
  reviews: DashboardData["reviewItems"];
  riskReviews: DashboardData["riskReviews"];
  checkpoints?: DashboardData["copilotCheckpoints"];
  onOpenMirror: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"risk" | "packet" | "trail">("risk");
  const DETAIL_TABS = [
    ["risk", "Risk Gate"],
    ["packet", "Release Packet"],
    ["trail", "Record Trail"]
  ] as const;

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const riskReview = riskReviews.find((item) => item.proposalId === selected.id);
  const packet = packets.find((item) => item.capabilityId === selected.id);
  const scopedActivity = activity.filter(
    (item) =>
      item.recordId === selected.id ||
      (riskReview && item.correlationId === riskReview.correlationId) ||
      (packet && item.correlationId === packet.correlationId)
  );

  return (
    <div className="workbench-grid">
      <CapabilityList records={records} selectedId={selectedId} onSelect={onSelect} />
      <div className="workbench-detail">
        <section className="panel workbench-header" aria-label="Selected capability">
          <div className="workbench-title">
            <div>
              <p className="eyebrow">{selected.department} / {selected.role}</p>
              <h2>{selected.title}</h2>
              <small>Owner: {selected.owner} · {riskLabels[selected.riskLevel]} risk · {selected.version}</small>
            </div>
            <div className="workbench-title-actions">
              <span className={`status-pill ${selected.riskLevel}`}>{statusLabels[selected.status]}</span>
              <button type="button" className="text-link" aria-label="Open audit trail" onClick={() => setDrawerOpen(true)}>
                <Activity size={15} /> Audit trail
              </button>
            </div>
          </div>
          <MiniStepper status={selected.status} />
          <div className="workbench-copilot-strip">
            <span className={`status-pill ${checkpoints.length > 0 ? "approved" : "pending"}`}>
              {checkpoints.length > 0 ? "Live" : "Demo"}
            </span>
            <p title={checkpoints[0]?.displayText ?? copilotTurns[2]?.text}>{checkpoints[0]?.displayText ?? copilotTurns[2]?.text}</p>
            <button type="button" className="text-link" onClick={onOpenMirror}>Open mirror <ChevronRight size={14} /></button>
          </div>
        </section>
        <div className="mirror-tabs" role="tablist" aria-label="Record detail">
          {DETAIL_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={detailTab === key}
              className={detailTab === key ? "is-active" : ""}
              onClick={() => setDetailTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mirror-panel">
          {detailTab === "risk" ? <RiskGate selected={selected} riskReviews={riskReviews} /> : null}
          {detailTab === "packet" ? <ReleasePacketDrawer selected={selected} packets={packets} reviews={reviews} /> : null}
          {detailTab === "trail" ? (
            <section className="panel workbench-trail" aria-label="This record's trail">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Record trail</p>
                  <h2>What happened to this capability</h2>
                </div>
              </div>
              {scopedActivity.length === 0 ? (
                <p className="empty-state">No recorded activity for this record yet.</p>
              ) : (
                <McpActivityRail compact items={scopedActivity} />
              )}
            </section>
          ) : null}
        </div>
      </div>
      {drawerOpen ? (
        <>
          <div
            className="audit-drawer-scrim"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="audit-drawer" role="dialog" aria-label="Audit trail" aria-modal="true">
            <div className="audit-drawer-head">
              <button type="button" className="text-link" aria-label="Close audit trail" onClick={() => setDrawerOpen(false)}>
                <X size={15} /> Close
              </button>
            </div>
            <McpActivityRail items={activity} />
          </div>
        </>
      ) : null}
    </div>
  );
}
