import { useEffect, useState } from "react";
import {
  Activity,
  ClipboardCheck,
  Gauge,
  Lock,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { DashboardData } from "./liveData";
import { apiBase } from "./liveData";

const READ_ACTIONS = new Set([
  "search_capabilities",
  "recommend_capabilities_for_role",
  "get_user_work_context",
  "generate_release_packet",
  "generate_capability_map",
  "list_mcp_activity"
]);

type DeckStatus = "live" | "demo" | "action";

function useHealthProbe() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  useEffect(() => {
    let isCurrent = true;
    async function probe() {
      try {
        const response = await fetch(`${apiBase}/health`, { cache: "no-store" });
        if (isCurrent) {
          setHealthy(response.ok);
        }
      } catch {
        if (isCurrent) {
          setHealthy(false);
        }
      }
    }
    void probe();
    const interval = window.setInterval(probe, 30000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, []);
  return healthy;
}

function DeckCard({
  icon,
  label,
  status,
  headline,
  context,
  evidence
}: {
  icon: React.ReactNode;
  label: string;
  status: DeckStatus;
  headline: string;
  context: string;
  evidence?: string;
}) {
  const statusLabel = status === "live" ? "Live" : status === "demo" ? "Demo data" : "Run demo";
  return (
    <article className="deck-card">
      <header>
        <span>{icon} {label}</span>
        <em className={`deck-status ${status}`}>{statusLabel}</em>
      </header>
      <strong>{headline}</strong>
      <p>{context}</p>
      {evidence ? <code>{evidence}</code> : null}
    </article>
  );
}

export function JudgeDeck({
  data,
  onOpenStory,
  onOpenMirror
}: {
  data: DashboardData;
  onOpenStory: () => void;
  onOpenMirror: () => void;
}) {
  const healthy = useHealthProbe();
  const liveStatus: DeckStatus = data.isLive ? "live" : "demo";
  const checkpoints = data.copilotCheckpoints;
  const latestCheckpoint = checkpoints[0];
  const reads = data.mcpActivity.filter((item) => READ_ACTIONS.has(item.action)).length;
  const writes = data.mcpActivity.filter((item) => !READ_ACTIONS.has(item.action) && item.status === "success").length;
  const rejected = data.mcpActivity.find((item) => item.status === "rejected");
  const latestRisk = data.riskReviews[0];
  const advisory = latestRisk?.advisory;
  const pendingReviews = data.reviewItems.filter((item) => item.status === "pending").length;
  const packet = data.releasePackets[0];
  const latestCorrelation = data.mcpActivity.find((item) => item.correlationId)?.correlationId;

  return (
    <section className="judge-deck" aria-label="Judge Deck evidence scorecard">
      <div className="deck-header">
        <div>
          <h1>Judge Deck</h1>
          <p className="deck-sub">Every claim on one screen, verified against the live registry. No scrolling, no hand-waving.</p>
        </div>
        <div className="deck-meta">
          <em className={`deck-status ${healthy === false ? "action" : healthy ? "live" : "demo"}`}>
            {healthy == null ? "Checking MCP…" : healthy ? "MCP healthy" : "MCP unreachable"}
          </em>
          <em className={`deck-status ${liveStatus}`}>{data.isLive ? "Live registry" : "Sample fallback"}</em>
          <button type="button" className="deck-link" onClick={onOpenStory}>Play the story</button>
          <button type="button" className="deck-link" onClick={onOpenMirror}>Open Copilot proof</button>
        </div>
      </div>

      <div className="deck-grid">
        <DeckCard
          icon={<Gauge size={14} />}
          label="MCP server"
          status={healthy ? "live" : healthy === false ? "action" : "demo"}
          headline={healthy ? "External MCP server healthy" : healthy === false ? "Health probe failed" : "Probing health endpoint"}
          context="A real external MCP server on Azure Container Apps — 13 governed tools behind OAuth, JSON-RPC and REST."
          evidence={`${apiBase.replace("https://", "")}/health`}
        />
        <DeckCard
          icon={<MessagesSquare size={14} />}
          label="Copilot surface"
          status={checkpoints.length > 0 ? "live" : "demo"}
          headline={checkpoints.length > 0 ? `${checkpoints.length} live Copilot checkpoints` : "Sideload-ready agent package v1.0.1"}
          context="Declarative agent in Microsoft 365 Copilot Chat. Every governed turn is recorded as a checkpoint and replayable in the mirror."
          evidence={latestCheckpoint ? `${latestCheckpoint.stage ?? "checkpoint"} / ${latestCheckpoint.correlationId}` : "57/57 Agents Toolkit validation rules"}
        />
        <DeckCard
          icon={<Sparkles size={14} />}
          label="Work IQ grounding"
          status={liveStatus}
          headline="People + Meetings, summary-only"
          context="Permission-aware org and meeting context grounds recommendations. Raw Microsoft 365 content never reaches the MCP server by contract."
          evidence="Schema-enforced, length-capped, sanitized summary fields"
        />
        <DeckCard
          icon={<Activity size={14} />}
          label="MCP read / write"
          status={liveStatus}
          headline={`${reads} reads / ${writes} governed writes`}
          context="Reads discover and verify; writes require explicit confirmation plus an idempotency key, and every call carries a correlation ID."
          evidence={latestCorrelation}
        />
        <DeckCard
          icon={<Lock size={14} />}
          label="Auth boundary"
          status={rejected ? "live" : "action"}
          headline={rejected ? "Unauthorized attempt rejected safely" : "No rejected attempts recorded yet"}
          context={rejected
            ? "Role checks block employee self-approval. Errors are sanitized: no tokens, no stack traces, logged for audit."
            : "Run the unauthorized demo: attempt an approval as the employee actor and watch it land here."}
          evidence={rejected?.correlationId}
        />
        <DeckCard
          icon={<Scale size={14} />}
          label="Risk gate + advisory"
          status={latestRisk ? "live" : "demo"}
          headline={latestRisk
            ? `${latestRisk.requiredControls.length} controls, verdict ${latestRisk.riskLevel}`
            : "Deterministic gate awaiting first score"}
          context={advisory?.status === "available"
            ? advisory.agreesWithGate === false
              ? "Foundry advisory disagreed — the deterministic gate ruled and wins. Disagreement is shown, never hidden."
              : "Foundry advisory analysis agrees with the deterministic verdict."
            : "Advisory reasoning degrades gracefully; the deterministic verdict stands alone and is byte-identical either way."}
          evidence={latestRisk?.correlationId}
        />
        <DeckCard
          icon={<ShieldCheck size={14} />}
          label="Human review"
          status={liveStatus}
          headline={packet ? "Released with reviewer approval" : `${pendingReviews} review${pendingReviews === 1 ? "" : "s"} pending`}
          context="Nothing releases without an explicit human decision. Approve, reject, or request changes — the gate is structural, not optional."
          evidence={packet ? `${packet.version} / reviewer ${packet.reviewer}` : undefined}
        />
        <DeckCard
          icon={<ClipboardCheck size={14} />}
          label="Audit trail"
          status={liveStatus}
          headline={`${data.mcpActivity.length} sanitized activity records`}
          context="Release packets carry owner, reviewer, controls, audience, and timestamps. The whole trail is correlation-ID linked and replayable."
          evidence={packet?.correlationId ?? latestCorrelation}
        />
      </div>
    </section>
  );
}
