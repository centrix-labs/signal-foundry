import { useEffect, useMemo, useState } from "react";
import type { Capability, CapabilityStatus, McpActivity, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { Check, ChevronRight, ClipboardCheck, FilePlus2, RotateCcw, Scale, ShieldCheck, Sparkles } from "lucide-react";
import {
  ExecutiveView,
  LeftRail,
  McpActivityRail,
  ReviewQueue,
  TopBar,
  type RecordFilters
} from "./panels";
import { CopilotMirror } from "./CopilotMirror";
import { JudgeDeck } from "./JudgeDeck";
import { Workbench } from "./Workbench";
import { ArchitectureView } from "./Architecture";
import { Walkthrough, WALKTHROUGH_SEEN_KEY } from "./Walkthrough";
import { ReleasePipeline, SignalAtlas } from "./visuals";
import { capabilities, copilotTurns, statusLabels, type ViewKey } from "./data";
import { LoginScreen } from "./LoginScreen";
import { getStaticWebAppUser, type StaticWebAppUser } from "./auth";
import { useDashboardData } from "./liveData";

const firstCapability = capabilities[0];
const judgeStages = [
  { key: "discover", label: "Discover", body: "Permission-aware summaries enter the forge." },
  { key: "propose", label: "Propose", body: "Copilot calls MCP to shape a governed capability." },
  { key: "score", label: "Score", body: "Deterministic controls decide what happens next." },
  { key: "review", label: "Review", body: "Human approval blocks release until ready." },
  { key: "release", label: "Release", body: "A release packet and audit trail prove the workflow." }
] as const;

if (!firstCapability) {
  throw new Error("Foundry Floor requires at least one synthetic capability.");
}

function findCapability(id: string, records: readonly Capability[]): Capability {
  return records.find((item) => item.id === id) ?? records[0] ?? firstCapability;
}

function recordForStage(stageIndex: number, records: readonly Capability[]): Capability {
  if (stageIndex === 4) {
    return records.find((item) => item.status === "released" || item.status === "approved_for_release") ?? records[0] ?? firstCapability;
  }
  return records.find((item) => ["proposed", "risk_scored", "in_review"].includes(item.status)) ?? records[0] ?? firstCapability;
}

function nextStageLabel(stageIndex: number) {
  const next = stageIndex >= judgeStages.length - 1 ? 0 : stageIndex + 1;
  return next === 0 ? "Restart story" : `Advance to ${judgeStages[next]?.label ?? "next step"}`;
}

function useDemoState(baseRecords: readonly Capability[]) {
  const [activeView, setActiveView] = useState<ViewKey>("judge");
  const [selectedId, setSelectedId] = useState(firstCapability.id);
  const [demoStep, setDemoStep] = useState(0);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CapabilityStatus>>({});
  const [decisionState, setDecisionState] = useState<"pending" | "saved" | "changes_requested" | "released">("pending");
  const records = useMemo(
    () => baseRecords.map((item) => ({ ...item, status: statusOverrides[item.id] ?? item.status })),
    [baseRecords, statusOverrides]
  );
  const selected = useMemo(() => findCapability(selectedId, records), [records, selectedId]);

  useEffect(() => {
    if (!records.some((item) => item.id === selectedId)) {
      setSelectedId(records[0]?.id ?? firstCapability.id);
    }
  }, [records, selectedId]);

  function advanceDemo() {
    setDemoStep((step) => {
      const next = step >= judgeStages.length - 1 ? 0 : step + 1;
      const target = recordForStage(next, records);
      setSelectedId(target.id);
      setActiveView((view) => (view === "deck" ? view : "judge"));
      return next;
    });
  }

  function resetDemo() {
    setSelectedId(records[0]?.id ?? firstCapability.id);
    setDemoStep(0);
    setActiveView((view) => (view === "deck" ? view : "judge"));
    setStatusOverrides({});
    setDecisionState("pending");
  }

  function selectDemoStage(stageIndex: number) {
    const boundedStage = Math.max(0, Math.min(stageIndex, judgeStages.length - 1));
    setDemoStep(boundedStage);
    setSelectedId(recordForStage(boundedStage, records).id);
    setActiveView((view) => (view === "deck" ? view : "judge"));
  }

  function setSelectedStatus(status: CapabilityStatus) {
    setStatusOverrides((current) => ({ ...current, [selectedId]: status }));
  }

  function requestChanges() {
    setSelectedStatus("rejected");
    setDecisionState("changes_requested");
  }

  function saveForLater() {
    setSelectedStatus("in_review");
    setDecisionState("saved");
  }

  function approveRelease() {
    setSelectedStatus("released");
    setDecisionState("released");
    setDemoStep(judgeStages.length - 1);
    setActiveView((view) => (view === "deck" ? view : "judge"));
  }

  return {
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,
    selected,
    records,
    decisionState,
    demoStep,
    advanceDemo,
    selectDemoStage,
    resetDemo,
    requestChanges,
    saveForLater,
    approveRelease
  };
}

function getRiskReview(selected: Capability, riskReviews: readonly RiskReview[]) {
  return riskReviews.find((item) => item.proposalId === selected.id);
}

function getReleasePacket(selected: Capability, packets: readonly ReleasePacket[]) {
  return packets.find((item) => item.capabilityId === selected.id);
}

function getReview(selected: Capability, reviews: readonly ReviewItem[]) {
  return reviews.find((item) => item.proposalId === selected.id);
}

function latestCorrelation(activity: readonly McpActivity[], packet?: ReleasePacket) {
  return activity.find((item) => item.correlationId)?.correlationId ?? packet?.correlationId ?? "Audit correlation pending";
}

function JudgeMode({
  records,
  selected,
  selectedId,
  onSelect,
  activity,
  packets,
  reviews,
  riskReviews,
  stageIndex,
  onAdvance,
  onStageSelect,
  onReset,
  onOpenMirror,
  checkpointCount = 0,
  isLive = false
}: {
  records: readonly Capability[];
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
  activity: ReturnType<typeof useDashboardData>["mcpActivity"];
  packets: ReturnType<typeof useDashboardData>["releasePackets"];
  reviews: ReturnType<typeof useDashboardData>["reviewItems"];
  riskReviews: ReturnType<typeof useDashboardData>["riskReviews"];
  stageIndex: number;
  checkpointCount: number;
  isLive?: boolean;
  onAdvance: () => void;
  onStageSelect: (stageIndex: number) => void;
  onReset: () => void;
  onOpenMirror: () => void;
}) {
  const currentStage = judgeStages[stageIndex % judgeStages.length] ?? judgeStages[0];
  const packet = getReleasePacket(selected, packets);
  const correlationId = latestCorrelation(activity, packet);
  const nextActionLabel = nextStageLabel(stageIndex);

  return (
    <section className="judge-mode" aria-label="Judge Mode">
      <div className="judge-hero">
        <div className="judge-copy">
          <p className="eyebrow">Judge Mode</p>
          <h1>Signal Foundry</h1>
          <p>Governed Copilot workflows from idea to approved release.</p>
        </div>
        <div className="stage-stepper" data-tour="stage-stepper" aria-label="Judge Mode stages">
          {judgeStages.map((stage, index) => (
            <button
              key={stage.key}
              type="button"
              className={currentStage.key === stage.key ? "active" : ""}
              aria-current={currentStage.key === stage.key ? "step" : undefined}
              onClick={() => onStageSelect(index)}
            >
              <span>{index + 1}</span>
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      <div className="judge-grid">
        <div className="judge-atlas" data-tour="atlas">
          <SignalAtlas
            records={records}
            selectedId={selectedId}
            onSelect={onSelect}
            stageKey={currentStage.key}
            judgeMode
          />
        </div>
        <StoryLedger
          records={records}
          riskReviews={riskReviews}
          reviews={reviews}
          packets={packets}
          stageIndex={stageIndex}
          isLive={isLive}
          onStageSelect={onStageSelect}
        />
      </div>

      <div className="judge-action-strip">
        <div className="strip-copy" key={currentStage.key}>
          <p className="eyebrow">{currentStage.label} — stage {stageIndex + 1} of {judgeStages.length}</p>
          <strong>{currentStage.body}</strong>
          <small>{selected.title} / {correlationId}</small>
        </div>
        <div className="strip-bridge" aria-label="Copilot proof panel">
          <div className="proof-badges" aria-label="Copilot package proof badges">
            {["People", "Meetings", "OAuth", "Summary-only", "No raw M365 content"].map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <button type="button" className="text-link" onClick={onOpenMirror}>
            {checkpointCount > 0
              ? `${checkpointCount} live Copilot checkpoint${checkpointCount === 1 ? "" : "s"} — open Copilot proof`
              : "Open Copilot proof"} <ChevronRight size={14} />
          </button>
        </div>
        <div className="judge-actions" data-tour="advance">
          <button type="button" onClick={onReset}><RotateCcw size={15} /> Reset</button>
          <button type="button" className="primary" onClick={onAdvance}>
            {nextActionLabel} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function StoryLedger({
  records,
  riskReviews,
  reviews,
  packets,
  stageIndex,
  isLive,
  onStageSelect
}: {
  records: readonly Capability[];
  riskReviews: readonly RiskReview[];
  reviews: readonly ReviewItem[];
  packets: readonly ReleasePacket[];
  stageIndex: number;
  isLive: boolean;
  onStageSelect: (stageIndex: number) => void;
}) {
  const storyRecord = records.find((item) => ["proposed", "risk_scored", "in_review", "approved_for_release", "released"].includes(item.status)) ?? records[0] ?? firstCapability;
  const releasedRecord = records.find((item) => item.status === "released" || item.status === "approved_for_release");
  const risk = riskReviews.find((item) => item.proposalId === storyRecord.id) ?? riskReviews[0];
  const review = reviews.find((item) => item.proposalId === storyRecord.id) ?? reviews[0];
  const packet = (releasedRecord ? packets.find((item) => item.capabilityId === releasedRecord.id) : undefined) ?? packets[0];
  const advisoryLine = risk?.advisory?.status === "available"
    ? risk.advisory.agreesWithGate === false
      ? "Advisory disagreed — the gate ruled, and the gate wins"
      : "Advisory agrees with the deterministic gate"
    : "Advisory degrades safely — the gate stands alone";

  const entries = [
    {
      icon: <Sparkles size={15} />,
      label: "Discover",
      done: "People + Meetings grounded, summary-only",
      pending: "Permission-aware work signals enter the forge",
      evidence: "Declarative agent package v1.0.3 — no raw M365 content",
      live: isLive
    },
    {
      icon: <FilePlus2 size={15} />,
      label: "Propose",
      done: storyRecord.title,
      pending: "Copilot drafts a governed proposal",
      evidence: "Confirmation gate satisfied before the write",
      live: isLive
    },
    {
      icon: <Scale size={15} />,
      label: "Score",
      done: risk ? `${risk.requiredControls.length} controls — verdict ${risk.riskLevel}` : "Deterministic verdict recorded",
      pending: "The deterministic gate scores the risk",
      evidence: advisoryLine,
      live: isLive && Boolean(risk)
    },
    {
      icon: <ShieldCheck size={15} />,
      label: "Review",
      done: review && review.status !== "pending" ? `Reviewer decision: ${review.status.replace("_", " ")}` : "Human approval recorded",
      pending: "No release without a human decision",
      evidence: review ? `Reviewer: ${review.reviewer}` : "Reviewer required by policy",
      live: isLive && Boolean(review)
    },
    {
      icon: <ClipboardCheck size={15} />,
      label: "Release",
      done: packet ? `${packet.version} released — audit packet sealed` : "Release packet generated",
      pending: "A release packet seals the audit trail",
      evidence: packet?.correlationId ?? "One correlation ID links the entire trail",
      live: isLive && Boolean(packet)
    }
  ];

  return (
    <aside className="story-ledger" data-tour="story-ledger" aria-label="Story ledger: evidence per stage">
      {entries.map((entry, index) => {
        const state = index < stageIndex ? "done" : index === stageIndex ? "current" : "upcoming";
        return (
          <button
            key={entry.label}
            type="button"
            className={`ledger-card ${state}`}
            aria-current={state === "current" ? "step" : undefined}
            onClick={() => onStageSelect(index)}
          >
            <span className="ledger-status" aria-hidden="true">{state === "done" ? <Check size={13} /> : index + 1}</span>
            <span className="ledger-head">
              {entry.icon} {entry.label}
              {entry.live && state !== "upcoming" ? <i className="ledger-live" title="Live registry value" /> : null}
            </span>
            <strong>{state === "upcoming" ? entry.pending : entry.done}</strong>
            <small>{state === "upcoming" ? "Pending" : entry.evidence}</small>
          </button>
        );
      })}
    </aside>
  );
}

function AtlasView({
  records,
  selectedId,
  onSelect,
  activity
}: {
  records: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
  activity: ReturnType<typeof useDashboardData>["mcpActivity"];
}) {
  return (
    <div className="atlas-view">
      <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} />
      <div className="atlas-support">
        <McpActivityRail compact items={activity} />
        <ReleasePipeline selected={findCapability(selectedId, records)} />
      </div>
    </div>
  );
}

function PipelineView({ records, selected }: { records: readonly Capability[]; selected: Capability }) {
  return (
    <div className="pipeline-view">
      <ReleasePipeline selected={selected} detailed />
      <div className="pipeline-columns">
        {records.map((item) => (
          <article key={item.id} className={`panel release-card ${item.riskLevel}`}>
            <p className="eyebrow">{statusLabels[item.status]}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span>{item.version} / {item.owner}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [authUser, setAuthUser] = useState<StaticWebAppUser | null>(null);
  const [localUser, setLocalUser] = useState<StaticWebAppUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadUser() {
      setIsCheckingAuth(true);
      const user = await getStaticWebAppUser();
      if (isCurrent) {
        setAuthUser(user);
        setIsCheckingAuth(false);
      }
    }

    void loadUser();
    return () => {
      isCurrent = false;
    };
  }, []);

  // A real Static Web Apps (Microsoft OAuth) session takes precedence; the local
  // demo credential is a fallback for environments without the /.auth backend.
  const user = authUser ?? localUser;

  if (!user) {
    return <LoginScreen isCheckingAuth={isCheckingAuth} onLocalLogin={setLocalUser} />;
  }

  return <AuthenticatedWorkspace authUser={user} />;
}

function AuthenticatedWorkspace({ authUser }: { authUser: StaticWebAppUser }) {
  const dashboardData = useDashboardData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RecordFilters>({});
  const [showTour, setShowTour] = useState(false);

  // First-time visitors get the walkthrough automatically; afterwards it lives
  // behind the Help button.
  useEffect(() => {
    if (window.localStorage.getItem(WALKTHROUGH_SEEN_KEY) !== "1") {
      setShowTour(true);
    }
  }, []);
  const {
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,
    selected,
    records,
    decisionState,
    demoStep,
    advanceDemo,
    selectDemoStage,
    resetDemo,
    requestChanges,
    saveForLater,
    approveRelease
  } = useDemoState(dashboardData.records);

  const pendingStatuses: readonly string[] = ["proposed", "risk_scored", "in_review"];
  const query = searchQuery.trim().toLowerCase();
  const visibleRecords = records.filter((item) => {
    return (!query
        || item.title.toLowerCase().includes(query)
        || item.role.toLowerCase().includes(query)
        || item.department.toLowerCase().includes(query))
      && (!filters.role || item.role === filters.role)
      && (!filters.department || item.department === filters.department)
      && (!filters.pendingOnly || pendingStatuses.includes(item.status));
  });
  const nextActionLabel = nextStageLabel(demoStep);

  return (
    <main className="app-shell light-mode">
      <LeftRail
        activeView={activeView}
        onView={(view) => setActiveView(view as ViewKey)}
        records={records}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <div className="workspace">
        <TopBar
          user={authUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStartTour={() => setShowTour(true)}
        />
        {["judge", "floor"].includes(activeView) ? (
        <div className="demo-controls">
          <span>Stage {demoStep + 1} of {judgeStages.length} — {judgeStages[demoStep]?.label ?? "Discover"} · {statusLabels[selected.status]}</span>
          <span className={`data-source ${dashboardData.isLive ? "live" : "fallback"}`}>
            {dashboardData.isLive ? "Live registry synced" : "Sample demo fallback"}
          </span>
          <button type="button" onClick={resetDemo}><RotateCcw size={15} /> Reset golden scenario</button>
          <button type="button" className="primary" onClick={advanceDemo}>{nextActionLabel} <ChevronRight size={15} /></button>
        </div>
        ) : null}
        {activeView === "judge" ? (
          <JudgeMode
            records={visibleRecords}
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activity={dashboardData.mcpActivity}
            packets={dashboardData.releasePackets}
            reviews={dashboardData.reviewItems}
            riskReviews={dashboardData.riskReviews}
            stageIndex={demoStep}
            checkpointCount={dashboardData.copilotCheckpoints.length}
            isLive={dashboardData.isLive}
            onAdvance={advanceDemo}
            onStageSelect={selectDemoStage}
            onReset={resetDemo}
            onOpenMirror={() => setActiveView("mirror")}
          />
        ) : null}
        {activeView === "deck" ? (
          <JudgeDeck
            data={dashboardData}
            onOpenStory={() => setActiveView("judge")}
            onOpenMirror={() => setActiveView("mirror")}
          />
        ) : null}
        {activeView === "floor" ? (
          <Workbench
            records={visibleRecords}
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activity={dashboardData.mcpActivity}
            packets={dashboardData.releasePackets}
            reviews={dashboardData.reviewItems}
            riskReviews={dashboardData.riskReviews}
            checkpoints={dashboardData.copilotCheckpoints}
            onOpenMirror={() => setActiveView("mirror")}
          />
        ) : null}
        {activeView === "atlas" ? <AtlasView records={visibleRecords} selectedId={selectedId} onSelect={setSelectedId} activity={dashboardData.mcpActivity} /> : null}
        {activeView === "architecture" ? <ArchitectureView /> : null}
        {activeView === "pipeline" ? <PipelineView records={visibleRecords} selected={selected} /> : null}
        {activeView === "review" ? (
          <ReviewQueue
            records={records}
            reviews={dashboardData.reviewItems}
            packets={dashboardData.releasePackets}
            riskReviews={dashboardData.riskReviews}
            activity={dashboardData.mcpActivity}
            selectedId={selectedId}
            decisionState={decisionState}
            onSelect={setSelectedId}
            onRequestChanges={requestChanges}
            onSaveForLater={saveForLater}
            onApproveRelease={approveRelease}
          />
        ) : null}
        {activeView === "mirror" ? (
          <CopilotMirror
            turns={copilotTurns}
            checkpoints={dashboardData.copilotCheckpoints}
            isLiveCheckpointSource={dashboardData.copilotCheckpoints.length > 0}
            selected={selected}
            records={visibleRecords}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onHide={() => setActiveView("floor")}
          />
        ) : null}
        {activeView === "executive" ? (
          <ExecutiveView
            selected={selected}
            reviews={dashboardData.reviewItems}
            events={dashboardData.auditEvents}
            onOpenReview={() => setActiveView("review")}
          />
        ) : null}
      </div>
      <Walkthrough open={showTour} onClose={() => setShowTour(false)} onRequestView={setActiveView} />
    </main>
  );
}
