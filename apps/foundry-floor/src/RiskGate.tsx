import { AlertTriangle, Check, ShieldX, Sparkles, X } from "lucide-react";
import type { Capability, RiskReview } from "@signal-foundry/shared";
import { controlChecks, riskLabels, riskReview, synthesizeRiskReview } from "./data";

export function RiskGate({ selected, riskReviews = [riskReview], compact = false }: { selected: Capability; riskReviews?: readonly RiskReview[]; compact?: boolean }) {
  const isBlocked = selected.status === "blocked";
  const selectedRisk = riskReviews.find((item) => item.proposalId === selected.id) ?? synthesizeRiskReview(selected);
  const reviewDecision = selectedRisk.requiresHumanReview ? "Human review required" : "Assistive release path";
  return (
    <section className={`panel risk-gate ${compact ? "compact-risk" : ""}`} aria-label="Risk Gate">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Risk Gate</p>
          <h2>{isBlocked ? "Release blocked" : "Controls before release"}</h2>
        </div>
        <span className={`status-pill ${selected.riskLevel}`}>{riskLabels[selected.riskLevel]}</span>
      </div>
      {isBlocked ? (
        <div className="refusal-banner" role="alert">
          <div className="refusal-head">
            <span className="refusal-mark" aria-hidden="true"><ShieldX size={20} /></span>
            <div>
              <strong>Refused — anti-surveillance boundary</strong>
              <small>Enforced by design. No reviewer can override it.</small>
            </div>
          </div>
          <p className="refusal-request"><span>Attempted ask</span>“Rank my team by productivity and flag the bottom performers.”</p>
          <p className="refusal-reason">Signal Foundry refuses monitoring or ranking of people — blocked at the agent instructions and again at the deterministic gate, before a human ever sees it.</p>
          <p className="refusal-protected"><Check size={14} /> Protected: employee activity was never scored, stored, or released.</p>
        </div>
      ) : (
        <>
          <div className="risk-score">
            <strong>{selectedRisk.requiredControls.length}</strong>
            <span>required controls</span>
          </div>
          <p>{selectedRisk.rationale}</p>
          <AdvisoryAnalysis review={selectedRisk} decision={reviewDecision} />
        </>
      )}
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

function AdvisoryAnalysis({ review, decision }: { review: RiskReview; decision: string }) {
  const advisory = review.advisory;
  const suggested = advisory?.suggestedRiskLevel ? riskLabels[advisory.suggestedRiskLevel] : advisory?.status === "available" ? "Not provided" : "Unavailable";
  const reason = advisory?.summary ?? advisory?.steps?.[0]?.concern ?? (advisory?.status === "available" ? "Not provided" : "Deterministic verdict stands.");
  if (!advisory || advisory.status !== "available") {
    return (
      <div className="advisory-analysis comparison muted" aria-label="Advisory analysis">
        <article>
          <strong>AI advisory</strong>
          <p>Unavailable. Deterministic verdict stands.</p>
        </article>
        <article>
          <strong>Deterministic gate</strong>
          <p>{decision}. Source of truth for release.</p>
        </article>
        <p className="advisory-note">Controls remain based on the deterministic risk review.</p>
      </div>
    );
  }
  const disagrees = advisory.agreesWithGate === false;
  const hasSteps = Boolean(advisory.steps && advisory.steps.length > 0);
  return (
    <div className="advisory-analysis comparison" aria-label="Advisory analysis">
      <div className="advisory-heading">
        <Sparkles size={14} />
        <strong>Multi-step reasoning</strong>
        {advisory.model && <small>{advisory.model}</small>}
      </div>

      {hasSteps && (
        <ol className="advisory-steps reasoning-star" aria-label="The model's step-by-step risk deliberation">
          {advisory.steps!.map((step, index) => (
            <li key={`${step.signal}-${step.concern}`} style={{ animationDelay: `${index * 220}ms` }}>
              <span className="step-num" aria-hidden="true">{index + 1}</span>
              <div className="step-body">
                <strong>{step.signal}</strong>
                <span>{step.concern}</span>
                <em>→ {step.suggestedControl}</em>
              </div>
            </li>
          ))}
        </ol>
      )}

      {advisory.selfCritique && (
        <p className="advisory-selfcritique"><strong>Self-critique:</strong> {advisory.selfCritique}</p>
      )}

      <div className="risk-comparison-grid">
        <article className={disagrees ? "advisory-warn" : "advisory-ok"}>
          <strong>AI advisory</strong>
          <p>Suggested: {suggested}. {reason}</p>
        </article>
        <article className="deterministic-wins">
          <strong>Deterministic gate</strong>
          <p>{decision}. Source of truth for release.</p>
        </article>
      </div>
      {disagrees ? <p className="advisory-arbitration" role="note">Advisory differs from the deterministic gate. The model reasons; the gate guarantees.</p> : <p className="advisory-agreement">Advisory agrees with the deterministic gate ({riskLabels[review.riskLevel]}).</p>}
      <p className="advisory-note advisory-quote">Unplug the model — the verdict is byte-identical. Proven by test, not promised.</p>
    </div>
  );
}
