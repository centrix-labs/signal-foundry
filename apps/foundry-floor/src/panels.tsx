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
import type { Capability, McpActivity, ReleasePacket, ReviewItem } from "@signal-foundry/shared";
import {
  auditEvents,
  capabilities,
  controlChecks,
  mcpActivity,
  releasePackets,
  reviewItems,
  riskLabels,
  riskReview,
  statusLabels,
  type CopilotTurn
} from "./data";

export function LeftRail({ activeView, onView }: { activeView: string; onView: (view: string) => void }) {
  const items = [
    ["floor", "Foundry Floor"],
    ["atlas", "Signal Atlas"],
    ["pipeline", "Release Pipeline"],
    ["review", "Review Queue"],
    ["mirror", "Copilot Mirror"],
    ["executive", "Light Executive"]
  ] as const;

  return (
    <aside className="left-rail" aria-label="Foundry navigation">
      <div className="brand-lockup">
        <span className="forge-mark">SF</span>
        <div>
          <strong>Signal Foundry</strong>
          <small>Raw | Forged | Approved</small>
        </div>
      </div>
      <nav>
        {items.map(([key, label]) => (
          <button key={key} type="button" className={activeView === key ? "active" : ""} onClick={() => onView(key)}>
            <Activity size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="context-card">
        <span>Active context</span>
        <strong>Customer Success Renewals</strong>
        <small>Production synthetic tenant</small>
        <small>SOC 2 + ISO 27001 controls</small>
      </div>
      <div className="filter-stack">
        <span>Filters</span>
        <button type="button">Role: Account Manager</button>
        <button type="button">Department: Customer Success</button>
        <button type="button">Stage: Pending Review</button>
      </div>
    </aside>
  );
}

export function TopBar() {
  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">Operations Command Center</p>
        <h1>Foundry Floor</h1>
      </div>
      <label className="search-box">
        <span>Search</span>
        <input value="renewals, risk gates, releases" readOnly aria-label="Search synthetic records" />
      </label>
      <div className="operator-badge">
        <span>AM</span>
        <div>
          <strong>Avery M.</strong>
          <small>Release Manager</small>
        </div>
      </div>
    </header>
  );
}

export function CapabilityList({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <section className="panel capability-list" aria-label="Capability records">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registry</p>
          <h2>Capability records</h2>
        </div>
      </div>
      {capabilities.map((item) => (
        <button key={item.id} type="button" className={selectedId === item.id ? "selected" : ""} onClick={() => onSelect(item.id)}>
          <span className={`dot ${item.riskLevel}`} />
          <strong>{item.title}</strong>
          <small>{statusLabels[item.status]} / {riskLabels[item.riskLevel]} risk</small>
        </button>
      ))}
    </section>
  );
}

export function RiskGate({ selected }: { selected: Capability }) {
  const isBlocked = selected.status === "blocked";
  return (
    <section className="panel risk-gate" aria-label="Risk Gate">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Risk Gate</p>
          <h2>{isBlocked ? "Release blocked" : "Controls before release"}</h2>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]}</span>
      </div>
      <div className="risk-score">
        <strong>{isBlocked ? "0" : "18"}</strong>
        <span>{isBlocked ? "blocked checks" : "checks evaluated"}</span>
      </div>
      <p>{isBlocked ? "Monitoring-style requests are refused. Convert the ask into a workflow-level capability before review." : riskReview.rationale}</p>
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

export function ReleasePacketDrawer({ selected }: { selected: Capability }) {
  const packet = releasePackets.find((item) => item.capabilityId === selected.id) ?? releasePackets[0];
  if (!packet) {
    return null;
  }
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

export function McpActivityRail({ compact = false }: { compact?: boolean }) {
  const items: McpActivity[] = compact ? mcpActivity.slice(-4) : mcpActivity.slice().reverse();
  return (
    <aside className={`panel mcp-rail ${compact ? "compact" : ""}`} aria-label="MCP Activity">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MCP Activity</p>
          <h2>Audit-safe trace</h2>
        </div>
        <span className="live-dot">Live</span>
      </div>
      {items.map((item) => (
        <article key={item.id} className={item.status}>
          <span className="activity-icon">{item.status === "success" ? <Check size={15} /> : item.status === "warning" ? <AlertTriangle size={15} /> : <Lock size={15} />}</span>
          <div>
            <strong>{item.action}</strong>
            <p>{item.summary}</p>
            <small>{item.actor} / {item.correlationId}</small>
          </div>
        </article>
      ))}
    </aside>
  );
}

export function ReviewQueue({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <section className="review-queue-layout">
      <div className="review-list panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Review Queue</p>
            <h2>Human approval required</h2>
          </div>
          <span className="status-pill pending">3 pending</span>
        </div>
        {reviewItems.map((item) => {
          const capability = capabilities.find((record) => record.id === item.proposalId) ?? capabilities[0];
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
      <RiskGate selected={capabilities.find((item) => item.id === selectedId) ?? capabilities[0]} />
      <ReleasePacketDrawer selected={capabilities.find((item) => item.id === selectedId) ?? capabilities[0]} />
      <McpActivityRail compact />
      <div className="approval-bar">
        <button type="button"><AlertTriangle size={17} /> Request Changes</button>
        <button type="button"><ClipboardCheck size={17} /> Save for Later</button>
        <button type="button" className="primary"><Check size={18} /> Approve & Release</button>
      </div>
    </section>
  );
}

export function CopilotMirror({ turns, selected }: { turns: CopilotTurn[]; selected: Capability }) {
  return (
    <section className="mirror-layout">
      <div className="copilot-chat panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Copilot Mirror</p>
            <h2>Microsoft 365 Copilot proof</h2>
          </div>
          <span className="status-pill approved">Enterprise mode</span>
        </div>
        {turns.map((turn) => (
          <article key={`${turn.speaker}-${turn.time}`} className={turn.speaker}>
            <small>{turn.speaker} / {turn.time}</small>
            <p>{turn.text}</p>
          </article>
        ))}
        <div className="chat-input">Message Copilot</div>
      </div>
      <div className="foundry-mirror">
        <RiskGate selected={selected} />
        <McpActivityRail compact />
        <ReleasePacketDrawer selected={selected} />
      </div>
    </section>
  );
}

export function ExecutiveView({ selected }: { selected: Capability }) {
  return (
    <section className="executive-view">
      <div className="executive-hero">
        <p className="eyebrow">Signal Foundry</p>
        <h2>Approved workflow launchpad</h2>
        <p>Judge-readable summary of how synthetic work signals become reviewed, released Copilot capabilities.</p>
      </div>
      <div className="executive-grid">
        <div className="panel">
          <ShieldCheck size={24} />
          <strong>Human review blocks release</strong>
          <span>{reviewItems.filter((item: ReviewItem) => item.status === "pending").length} pending decisions</span>
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
        {auditEvents.map((event) => (
          <div key={event.id}>
            <span>{event.actor}</span>
            <strong>{event.action}</strong>
            <small>{event.targetRecord}</small>
            <em>{event.correlationId}</em>
          </div>
        ))}
      </div>
      <button type="button" className="primary action-button">Open release packet <ChevronRight size={16} /></button>
    </section>
  );
}
