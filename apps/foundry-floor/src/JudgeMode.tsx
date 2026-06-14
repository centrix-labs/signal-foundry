import type { Capability, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { Check, ChevronRight, ClipboardCheck, FilePlus2, RotateCcw, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { SignalAtlas } from "./visuals";
import {
  AutoPlayControl,
  InlineReasoning,
  pickScoreRisk,
  proofBadgesForStage,
  storyStateForStage
} from "./story";
import { firstCapability, getReleasePacket, judgeStages, latestCorrelation, nextStageLabel } from "./demoModel";
import type { useDashboardData } from "./liveData";

export function JudgeMode({
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
  isLive = false,
  autoPlay
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
  autoPlay: {
    playing: boolean;
    atEnd: boolean;
    reducedMotion: boolean;
    onPlay: () => void;
    onPause: () => void;
    onReplay: () => void;
  };
}) {
  const currentStage = judgeStages[stageIndex % judgeStages.length] ?? judgeStages[0];
  const stageKey = currentStage.key;
  const packet = getReleasePacket(selected, packets);
  const correlationId = latestCorrelation(activity, packet);
  const nextActionLabel = nextStageLabel(stageIndex);

  // The focal record is the live selected capability; its risk review drives the
  // story node, reasoning, and proof-badge counts. At Score we may swap to the
  // disagreement record so the model-vs-gate drama always lands.
  const focalRisk = riskReviews.find((item) => item.proposalId === selected.id);
  const scoreRisk = pickScoreRisk(focalRisk, riskReviews);
  const activeRisk = stageKey === "score" ? scoreRisk : focalRisk;
  const story = storyStateForStage(stageKey, selected);
  const badges = proofBadgesForStage(stageKey, activeRisk, packet);

  return (
    <section className="judge-mode" aria-label="Judge Mode">
      <div className="judge-hero">
        <div className="judge-copy">
          <p className="eyebrow">Guided Story</p>
          <h1>Signal Foundry</h1>
          <p>Governed Copilot workflows from idea to approved release.</p>
        </div>
        <div className="stage-stepper" data-tour="stage-stepper" aria-label="Judge Mode stages">
          {judgeStages.map((stage, index) => {
            const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "upcoming";
            return (
              <button
                key={stage.key}
                type="button"
                className={`${state} ${index <= stageIndex ? "filled" : ""}`}
                aria-current={state === "active" ? "step" : undefined}
                onClick={() => onStageSelect(index)}
              >
                <span aria-hidden="true">{state === "done" ? <Check size={13} /> : index + 1}</span>
                {stage.label}
              </button>
            );
          })}
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
            isLive={isLive}
            story={story}
            heroLabel={selected.title}
          />
          {stageKey === "score" ? (
            <InlineReasoning risk={activeRisk} stageKey={stageKey} />
          ) : null}
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
          <small title={`${selected.title} / ${correlationId}`}>{selected.title} / {correlationId}</small>
          <span className="illustrative-stat" title="Illustrative figure, not a measured metric">
            ~3,400 shadow-AI workflows ungoverned — illustrative for this tenant
          </span>
        </div>
        <div className="strip-bridge" aria-label="Copilot proof panel">
          <div className="proof-badges" key={stageKey} aria-label="Stage proof badges">
            {badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <button type="button" className="text-link" onClick={onOpenMirror}>
            {checkpointCount > 0
              ? `${checkpointCount} live Copilot checkpoint${checkpointCount === 1 ? "" : "s"} — open Copilot proof`
              : "Open Copilot proof"} <ChevronRight size={14} />
          </button>
        </div>
        <div className="judge-actions" data-tour="advance">
          <AutoPlayControl
            playing={autoPlay.playing}
            atEnd={autoPlay.atEnd}
            reducedMotion={autoPlay.reducedMotion}
            onPlay={autoPlay.onPlay}
            onPause={autoPlay.onPause}
            onReplay={autoPlay.onReplay}
          />
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
