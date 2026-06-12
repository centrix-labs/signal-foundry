import { useEffect, useMemo, useState } from "react";
import type { Capability, CapabilityStatus, McpActivity, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { Check, ChevronRight, ClipboardCheck, Lock, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import {
  CapabilityList,
  CopilotMirror,
  ExecutiveView,
  LeftRail,
  McpActivityRail,
  ReleasePacketDrawer,
  ReviewQueue,
  RiskGate,
  TopBar,
  type RecordFilters
} from "./panels";
import { ReleasePipeline, SignalAtlas } from "./visuals";
import { capabilities, copilotTurns, statusLabels, type ViewKey } from "./data";
import { LoginScreen } from "./LoginScreen";
import { AccessGate } from "./AccessGate";
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
      setActiveView("judge");
      return next;
    });
  }

  function resetDemo() {
    setSelectedId(records[0]?.id ?? firstCapability.id);
    setDemoStep(0);
    setActiveView("judge");
    setStatusOverrides({});
    setDecisionState("pending");
  }

  function selectDemoStage(stageIndex: number) {
    const boundedStage = Math.max(0, Math.min(stageIndex, judgeStages.length - 1));
    setDemoStep(boundedStage);
    setSelectedId(recordForStage(boundedStage, records).id);
    setActiveView("judge");
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
    setActiveView("judge");
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
  onOpenMirror
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
  onAdvance: () => void;
  onStageSelect: (stageIndex: number) => void;
  onReset: () => void;
  onOpenMirror: () => void;
}) {
  const currentStage = judgeStages[stageIndex % judgeStages.length] ?? judgeStages[0];
  const selectedRisk = getRiskReview(selected, riskReviews);
  const packet = getReleasePacket(selected, packets);
  const review = getReview(selected, reviews);
  const requiredControls = selectedRisk?.requiredControls.length;
  const correlationId = latestCorrelation(activity, packet);
  const releaseState = packet ? "Release packet" : "Release packet not yet generated";
  const reviewState = selectedRisk?.requiresHumanReview || review?.status === "pending" ? "Human review required" : "Review state unavailable";
  const nextActionLabel = nextStageLabel(stageIndex);

  return (
    <section className="judge-mode" aria-label="Judge Mode">
      <div className="judge-hero">
        <div className="judge-copy">
          <p className="eyebrow">Judge Mode</p>
          <h1>Signal Foundry</h1>
          <p>Governed Copilot workflows from idea to approved release.</p>
        </div>
        <div className="stage-stepper" aria-label="Judge Mode stages">
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
        <div className="judge-atlas">
          <SignalAtlas
            records={records}
            selectedId={selectedId}
            onSelect={onSelect}
            stageKey={currentStage.key}
            judgeMode
          />
        </div>
        <aside className="proof-rail" aria-label="Source-backed proof cards">
          <article>
            <Sparkles size={18} />
            <span>Copilot grounded</span>
            <strong>People + Meetings, summary-only</strong>
            <small>Declarative agent package</small>
          </article>
          <article>
            <ShieldCheck size={18} />
            <span>Risk gated</span>
            <strong>{requiredControls == null ? "Controls unavailable" : `${requiredControls} required controls`}</strong>
            <small>Deterministic verdict: {selectedRisk ? selectedRisk.riskLevel : selected.riskLevel}</small>
          </article>
          <article>
            <ClipboardCheck size={18} />
            <span>Audit ready</span>
            <strong>{releaseState}</strong>
            <small>{correlationId}</small>
          </article>
        </aside>
      </div>

      <div className="judge-evidence-row">
        <section key={currentStage.key} className="panel judge-stage-card">
          <p className="eyebrow">{currentStage.label}</p>
          <h2>{currentStage.body}</h2>
          <dl>
            <div><dt>Capability</dt><dd>{selected.title}</dd></div>
            <div><dt>Review</dt><dd>{reviewState}</dd></div>
            <div><dt>Correlation</dt><dd>{correlationId}</dd></div>
          </dl>
          <div className="judge-actions">
            <button type="button" onClick={onReset}><RotateCcw size={15} /> Reset golden scenario</button>
            <button type="button" className="primary" onClick={onAdvance}>
              {nextActionLabel} <ChevronRight size={15} />
            </button>
          </div>
        </section>
        <RiskGate selected={selected} riskReviews={riskReviews} compact />
        <section className="panel copilot-bridge" aria-label="Copilot proof panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Copilot Mirror</p>
              <h2>Copilot calls governed MCP</h2>
            </div>
            <button type="button" className="text-link" onClick={onOpenMirror}>Open Copilot proof <ChevronRight size={14} /></button>
          </div>
          <ol>
            <li><Lock size={15} /> User asks Copilot</li>
            <li><Sparkles size={15} /> Copilot calls Signal Foundry MCP</li>
            <li><Check size={15} /> Signal Foundry returns governed result</li>
          </ol>
          <div className="proof-badges" aria-label="Copilot package proof badges">
            {["People", "Meetings", "OAuth", "Summary-only", "No raw M365 content"].map((badge) => <span key={badge}>{badge}</span>)}
          </div>
        </section>
      </div>
      <McpActivityRail items={activity} proofMode />
    </section>
  );
}

function FoundryFloor({
  records,
  selected,
  selectedId,
  onSelect,
  activity,
  packets,
  reviews,
  riskReviews,
  onOpenMirror
}: {
  records: readonly Capability[];
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
  activity: ReturnType<typeof useDashboardData>["mcpActivity"];
  packets: ReturnType<typeof useDashboardData>["releasePackets"];
  reviews: ReturnType<typeof useDashboardData>["reviewItems"];
  riskReviews: ReturnType<typeof useDashboardData>["riskReviews"];
  onOpenMirror: () => void;
}) {
  return (
    <div className="floor-grid">
      <CapabilityList records={records} selectedId={selectedId} onSelect={onSelect} />
      <div className="floor-center">
        <ReleasePipeline selected={selected} detailed />
        <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} compact />
        <section className="panel copilot-proof">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Copilot Mirror</p>
              <h2>Latest governed interaction</h2>
            </div>
            <span className="status-pill approved">Live</span>
          </div>
          <p>{copilotTurns[2]?.text}</p>
          <button type="button" className="text-link" onClick={onOpenMirror}>Open mirror <ChevronRight size={14} /></button>
        </section>
      </div>
      <div className="right-stack">
        <RiskGate selected={selected} riskReviews={riskReviews} />
        <ReleasePacketDrawer selected={selected} packets={packets} reviews={reviews} />
      </div>
      <McpActivityRail items={activity} />
    </div>
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
  const [hasAccess, setHasAccess] = useState(() => window.sessionStorage.getItem("signal-foundry-access") === "granted");
  const [authUser, setAuthUser] = useState<StaticWebAppUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");

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

  if (!hasAccess) {
    return <AccessGate onUnlock={() => setHasAccess(true)} theme={theme} onThemeChange={setTheme} />;
  }

  if (!authUser) {
    return <LoginScreen theme={theme} onThemeChange={setTheme} isCheckingAuth={isCheckingAuth} />;
  }

  return <AuthenticatedWorkspace authUser={authUser} theme={theme} onThemeChange={setTheme} />;
}

function AuthenticatedWorkspace({
  authUser,
  theme,
  onThemeChange
}: {
  authUser: StaticWebAppUser;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}) {
  const dashboardData = useDashboardData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RecordFilters>({});
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
    <main className={`app-shell ${theme === "light" || activeView === "executive" ? "light-mode" : ""}`}>
      <LeftRail
        activeView={activeView}
        onView={(view) => setActiveView(view as ViewKey)}
        records={records}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <div className="workspace">
        <TopBar
          theme={theme}
          onThemeChange={onThemeChange}
          user={authUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="demo-controls">
          <span>Checkpoint D / Step {demoStep + 1}: {statusLabels[selected.status]}</span>
          <span className={`data-source ${dashboardData.isLive ? "live" : "fallback"}`}>
            {dashboardData.isLive ? "Live registry synced" : "Sample demo fallback"}
          </span>
          <button type="button" onClick={resetDemo}><RotateCcw size={15} /> Reset golden scenario</button>
          <button type="button" className="primary" onClick={advanceDemo}>{nextActionLabel} <ChevronRight size={15} /></button>
        </div>
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
            onAdvance={advanceDemo}
            onStageSelect={selectDemoStage}
            onReset={resetDemo}
            onOpenMirror={() => setActiveView("mirror")}
          />
        ) : null}
        {activeView === "floor" ? (
          <FoundryFloor
            records={visibleRecords}
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activity={dashboardData.mcpActivity}
            packets={dashboardData.releasePackets}
            reviews={dashboardData.reviewItems}
            riskReviews={dashboardData.riskReviews}
            onOpenMirror={() => setActiveView("mirror")}
          />
        ) : null}
        {activeView === "atlas" ? <AtlasView records={visibleRecords} selectedId={selectedId} onSelect={setSelectedId} activity={dashboardData.mcpActivity} /> : null}
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
    </main>
  );
}
