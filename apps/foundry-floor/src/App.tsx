import { useMemo, useState } from "react";
import type { Capability } from "@signal-foundry/shared";
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
  const selected = useMemo(() => findCapability(selectedId), [selectedId]);

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
  }

  return { activeView, setActiveView, selectedId, setSelectedId, selected, demoStep, advanceDemo, resetDemo };
}

function FoundryFloor({
  selected,
  selectedId,
  onSelect
}: {
  selected: Capability;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="floor-grid">
      <CapabilityList selectedId={selectedId} onSelect={onSelect} />
      <div className="floor-center">
        <ReleasePipeline selected={selected} detailed />
        <SignalAtlas selectedId={selectedId} onSelect={onSelect} compact />
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

function AtlasView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="atlas-view">
      <SignalAtlas selectedId={selectedId} onSelect={onSelect} />
      <div className="atlas-support">
        <McpActivityRail compact />
        <ReleasePipeline selected={findCapability(selectedId)} />
      </div>
    </div>
  );
}

function PipelineView({ selected }: { selected: Capability }) {
  return (
    <div className="pipeline-view">
      <ReleasePipeline selected={selected} detailed />
      <div className="pipeline-columns">
        {capabilities.map((item) => (
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
  const { activeView, setActiveView, selectedId, setSelectedId, selected, demoStep, advanceDemo, resetDemo } = useDemoState();

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
          <FoundryFloor selected={selected} selectedId={selectedId} onSelect={setSelectedId} />
        ) : null}
        {activeView === "atlas" ? <AtlasView selectedId={selectedId} onSelect={setSelectedId} /> : null}
        {activeView === "pipeline" ? <PipelineView selected={selected} /> : null}
        {activeView === "review" ? <ReviewQueue selectedId={selectedId} onSelect={setSelectedId} /> : null}
        {activeView === "mirror" ? <CopilotMirror turns={copilotTurns} selected={selected} /> : null}
        {activeView === "executive" ? <ExecutiveView selected={selected} /> : null}
      </div>
    </main>
  );
}
