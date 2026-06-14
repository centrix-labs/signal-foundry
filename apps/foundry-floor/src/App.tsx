import { useEffect, useMemo, useState } from "react";
import type { Capability, CapabilityStatus } from "@signal-foundry/shared";
import { ChevronRight, RotateCcw } from "lucide-react";
import { ExecutiveView, LeftRail, ReviewQueue, TopBar } from "./panels";
import { CopilotMirror } from "./CopilotMirror";
import { JudgeDeck } from "./JudgeDeck";
import { Workbench } from "./Workbench";
import { ArchitectureView } from "./Architecture";
import { Walkthrough, WALKTHROUGH_SEEN_KEY } from "./Walkthrough";
import { JudgeMode } from "./JudgeMode";
import { AtlasView, PipelineView } from "./FloorViews";
import { prefersReducedMotion, useAutoPlay } from "./story";
import { copilotTurns, statusLabels, type ViewKey } from "./data";
import { findCapability, firstCapability, judgeStages, nextStageLabel, recordForStage } from "./demoModel";
import { LoginScreen } from "./LoginScreen";
import { getStaticWebAppUser, type StaticWebAppUser } from "./auth";
import { useDashboardData } from "./liveData";
import { releaseCapabilityLive } from "./liveActions";

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
    // Empty selectedId is a deliberate "nothing selected" state (e.g. the Atlas
    // de-select); only repair a non-empty id that no longer maps to a record.
    if (selectedId && !records.some((item) => item.id === selectedId)) {
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

  // Approve & Release applies the optimistic local decision immediately, then —
  // when the registry is live — drives the real governed write on the MCP server
  // (approve_capability → release_capability). A server-side failure is a no-op:
  // the demo state already reflects the decision, so the console never breaks
  // offline. The 15s snapshot poll surfaces the real packet once it lands.
  const approveReleaseWired = () => {
    approveRelease();
    if (dashboardData.isLive && selected) {
      void releaseCapabilityLive(selected).catch(() => undefined);
    }
  };

  // Auto-play drives the Guided Story for screen recording. Manual interaction
  // (Reset / Advance / stage select) cancels it; reduced-motion disables it.
  const [autoPlaying, setAutoPlaying] = useState(false);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  useAutoPlay({
    playing: autoPlaying,
    stageIndex: demoStep,
    onAdvance: advanceDemo,
    onStop: () => setAutoPlaying(false)
  });

  const stopAutoPlay = () => setAutoPlaying(false);
  const manualAdvance = () => {
    setAutoPlaying(false);
    advanceDemo();
  };
  const manualReset = () => {
    setAutoPlaying(false);
    resetDemo();
  };
  const manualStageSelect = (stage: number) => {
    setAutoPlaying(false);
    selectDemoStage(stage);
  };
  const startAutoPlay = () => {
    if (reducedMotion) {
      return;
    }
    // From the end, Play means restart the arc.
    if (demoStep >= judgeStages.length - 1) {
      resetDemo();
    }
    setAutoPlaying(true);
  };
  const replayAutoPlay = () => {
    if (reducedMotion) {
      return;
    }
    resetDemo();
    setAutoPlaying(true);
  };

  const query = searchQuery.trim().toLowerCase();
  const visibleRecords = records.filter((item) =>
    !query
    || item.title.toLowerCase().includes(query)
    || item.role.toLowerCase().includes(query)
    || item.department.toLowerCase().includes(query)
  );
  const nextActionLabel = nextStageLabel(demoStep);

  return (
    <main className="app-shell light-mode">
      <LeftRail
        activeView={activeView}
        onView={(view) => setActiveView(view as ViewKey)}
        selectedRecord={records.find((record) => record.id === selectedId)}
        isLive={dashboardData.isLive}
        refreshedAt={dashboardData.refreshedAt}
      />
      <div className="workspace">
        <TopBar
          user={authUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStartTour={() => setShowTour(true)}
          records={records}
          onJumpToRecord={(id) => {
            setSelectedId(id);
            setActiveView("floor");
            setSearchQuery("");
          }}
        />
        {activeView === "judge" ? (
        <div className="demo-controls">
          <span>Stage {demoStep + 1} of {judgeStages.length} — {judgeStages[demoStep]?.label ?? "Discover"} · {statusLabels[selected.status]}</span>
          <span className={`data-source ${dashboardData.isLive ? "live" : "fallback"}`}>
            {dashboardData.isLive ? "Live registry synced" : "Sample demo fallback"}
          </span>
          <button type="button" onClick={manualReset}><RotateCcw size={15} /> Reset golden scenario</button>
          <button type="button" className="primary" onClick={manualAdvance}>{nextActionLabel} <ChevronRight size={15} /></button>
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
            onAdvance={manualAdvance}
            onStageSelect={manualStageSelect}
            onReset={manualReset}
            onOpenMirror={() => {
              stopAutoPlay();
              setActiveView("mirror");
            }}
            autoPlay={{
              playing: autoPlaying,
              atEnd: demoStep >= judgeStages.length - 1,
              reducedMotion,
              onPlay: startAutoPlay,
              onPause: stopAutoPlay,
              onReplay: replayAutoPlay
            }}
          />
        ) : null}
        {activeView === "deck" ? (
          <JudgeDeck
            data={dashboardData}
            onOpenStory={() => {
              setActiveView("judge");
              // Land on the Guided Story already playing from Discover.
              replayAutoPlay();
            }}
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
        {activeView === "atlas" ? <AtlasView records={visibleRecords} selectedId={selectedId} onSelect={setSelectedId} activity={dashboardData.mcpActivity} isLive={dashboardData.isLive} /> : null}
        {activeView === "architecture" ? <ArchitectureView onOpenView={setActiveView} /> : null}
        {activeView === "pipeline" ? <PipelineView records={visibleRecords} /> : null}
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
            onApproveRelease={approveReleaseWired}
          />
        ) : null}
        {activeView === "mirror" ? (
          <CopilotMirror
            turns={copilotTurns}
            checkpoints={dashboardData.copilotCheckpoints}
            isLiveCheckpointSource={dashboardData.copilotCheckpoints.length > 0}
            isLive={dashboardData.isLive}
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
            records={records}
            reviews={dashboardData.reviewItems}
            events={dashboardData.auditEvents}
            activity={dashboardData.mcpActivity}
            packets={dashboardData.releasePackets}
            riskReviews={dashboardData.riskReviews}
            onOpenReview={() => setActiveView("review")}
          />
        ) : null}
      </div>
      <Walkthrough open={showTour} onClose={() => setShowTour(false)} onRequestView={setActiveView} />
    </main>
  );
}
