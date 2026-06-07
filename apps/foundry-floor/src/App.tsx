import { useMemo, useState } from "react";
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

const firstCapability = capabilities[0];

if (!firstCapability) {
  throw new Error("Foundry Floor requires at least one synthetic capability.");
}

function findCapability(id: string): Capability {
  return capabilities.find((item) => item.id === id) ?? firstCapability;
}

function useDemoState() {
  const [activeView, setActiveView] = useState<ViewKey>("floor");
  const [selectedId, setSelectedId] = useState(firstCapability.id);
  const [demoStep, setDemoStep] = useState(3);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CapabilityStatus>>({});
  const [decisionState, setDecisionState] = useState<"pending" | "saved" | "changes_requested" | "released">("pending");
  const records = useMemo(
    () => capabilities.map((item) => ({ ...item, status: statusOverrides[item.id] ?? item.status })),
    [statusOverrides]
  );
  const selected = useMemo(() => records.find((item) => item.id === selectedId) ?? findCapability(selectedId), [records, selectedId]);

  function advanceDemo() {
    setDemoStep((step) => {
      const next = step >= 5 ? 0 : step + 1;
      const target = capabilities[next % capabilities.length] ?? firstCapability;
      setSelectedId(target.id);
      return next;
    });
  }

  function resetDemo() {
    setSelectedId(firstCapability.id);
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
  onSelect
}: {
  records: readonly Capability[];
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
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
        <RiskGate selected={selected} />
        <ReleasePacketDrawer selected={selected} />
      </div>
      <McpActivityRail />
    </div>
  );
}

function AtlasView({ records, selectedId, onSelect }: { records: readonly Capability[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="atlas-view">
      <SignalAtlas records={records} selectedId={selectedId} onSelect={onSelect} />
      <div className="atlas-support">
        <McpActivityRail compact />
        <ReleasePipeline selected={records.find((item) => item.id === selectedId) ?? findCapability(selectedId)} />
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
  } = useDemoState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen onEnter={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className={`app-shell ${activeView === "executive" ? "light-mode" : ""}`}>
      <LeftRail activeView={activeView} onView={(view) => setActiveView(view as ViewKey)} />
      <div className="workspace">
        <TopBar />
        <div className="demo-controls">
          <span>Checkpoint D / Step {demoStep + 1}: {statusLabels[selected.status]}</span>
          <button type="button" onClick={resetDemo}><RotateCcw size={15} /> Reset golden scenario</button>
          <button type="button" className="primary" onClick={advanceDemo}>Advance story <ChevronRight size={15} /></button>
        </div>
        {activeView === "floor" ? (
          <FoundryFloor records={records} selected={selected} selectedId={selectedId} onSelect={setSelectedId} />
        ) : null}
        {activeView === "atlas" ? <AtlasView records={records} selectedId={selectedId} onSelect={setSelectedId} /> : null}
        {activeView === "pipeline" ? <PipelineView records={records} selected={selected} /> : null}
        {activeView === "review" ? (
          <ReviewQueue
            records={records}
            selectedId={selectedId}
            decisionState={decisionState}
            onSelect={setSelectedId}
            onRequestChanges={requestChanges}
            onSaveForLater={saveForLater}
            onApproveRelease={approveRelease}
          />
        ) : null}
        {activeView === "mirror" ? <CopilotMirror turns={copilotTurns} selected={selected} /> : null}
        {activeView === "executive" ? <ExecutiveView selected={selected} /> : null}
      </div>
    </main>
  );
}
