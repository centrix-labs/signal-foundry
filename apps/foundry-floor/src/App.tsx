import { useEffect, useMemo, useState } from "react";
import type { Capability, CapabilityStatus } from "@signal-foundry/shared";
import { ChevronRight, RotateCcw } from "lucide-react";
import {
  CapabilityList,
  CopilotMirror,
  ExecutiveView,
  LeftRail,
  McpActivityRail,
  ReleasePacketDrawer,
  ReviewQueue,
  RiskGate,
  TopBar
} from "./panels";
import { ReleasePipeline, SignalAtlas } from "./visuals";
import { capabilities, copilotTurns, statusLabels, type ViewKey } from "./data";
import { LoginScreen } from "./LoginScreen";
import { AccessGate } from "./AccessGate";
import { getStaticWebAppUser, type StaticWebAppUser } from "./auth";
import { useDashboardData } from "./liveData";

const firstCapability = capabilities[0];

if (!firstCapability) {
  throw new Error("Foundry Floor requires at least one synthetic capability.");
}

function findCapability(id: string, records: readonly Capability[]): Capability {
  return records.find((item) => item.id === id) ?? records[0] ?? firstCapability;
}

function useDemoState(baseRecords: readonly Capability[]) {
  const [activeView, setActiveView] = useState<ViewKey>("floor");
  const [selectedId, setSelectedId] = useState(firstCapability.id);
  const [demoStep, setDemoStep] = useState(3);
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
      const next = step >= 5 ? 0 : step + 1;
      const target = records[next % records.length] ?? firstCapability;
      setSelectedId(target.id);
      return next;
    });
  }

  function resetDemo() {
    setSelectedId(records[0]?.id ?? firstCapability.id);
    setDemoStep(0);
    setActiveView("floor");
    setStatusOverrides({});
    setDecisionState("pending");
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
    setDemoStep(5);
    setActiveView("atlas");
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
    resetDemo,
    requestChanges,
    saveForLater,
    approveRelease
  };
}

function FoundryFloor({
  records,
  selected,
  selectedId,
  onSelect,
  activity,
  packets,
  reviews,
  riskReviews
}: {
  records: readonly Capability[];
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
  activity: ReturnType<typeof useDashboardData>["mcpActivity"];
  packets: ReturnType<typeof useDashboardData>["releasePackets"];
  reviews: ReturnType<typeof useDashboardData>["reviewItems"];
  riskReviews: ReturnType<typeof useDashboardData>["riskReviews"];
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
          <button type="button" className="text-link">Open mirror <ChevronRight size={14} /></button>
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
    resetDemo,
    requestChanges,
    saveForLater,
    approveRelease
  } = useDemoState(dashboardData.records);

  return (
    <main className={`app-shell ${theme === "light" || activeView === "executive" ? "light-mode" : ""}`}>
      <LeftRail activeView={activeView} onView={(view) => setActiveView(view as ViewKey)} />
      <div className="workspace">
        <TopBar theme={theme} onThemeChange={onThemeChange} user={authUser} />
        <div className="demo-controls">
          <span>Checkpoint D / Step {demoStep + 1}: {statusLabels[selected.status]}</span>
          <span className={`data-source ${dashboardData.isLive ? "live" : "fallback"}`}>
            {dashboardData.isLive ? "Live registry synced" : "Sample demo fallback"}
          </span>
          <button type="button" onClick={resetDemo}><RotateCcw size={15} /> Reset golden scenario</button>
          <button type="button" className="primary" onClick={advanceDemo}>Advance story <ChevronRight size={15} /></button>
        </div>
        {activeView === "floor" ? (
          <FoundryFloor
            records={records}
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activity={dashboardData.mcpActivity}
            packets={dashboardData.releasePackets}
            reviews={dashboardData.reviewItems}
            riskReviews={dashboardData.riskReviews}
          />
        ) : null}
        {activeView === "atlas" ? <AtlasView records={records} selectedId={selectedId} onSelect={setSelectedId} activity={dashboardData.mcpActivity} /> : null}
        {activeView === "pipeline" ? <PipelineView records={records} selected={selected} /> : null}
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
        {activeView === "mirror" ? <CopilotMirror turns={copilotTurns} selected={selected} /> : null}
        {activeView === "executive" ? <ExecutiveView selected={selected} reviews={dashboardData.reviewItems} events={dashboardData.auditEvents} /> : null}
      </div>
    </main>
  );
}
