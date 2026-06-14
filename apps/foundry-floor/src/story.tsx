import { useEffect, useRef } from "react";
import type { Capability, ReleasePacket, RiskReview } from "@signal-foundry/shared";

// ---------------------------------------------------------------------------
// Guided Story choreography (Judge Mode only)
//
// One hero proposal node travels across the Atlas lanes as the judge walks
// Discover -> Release. Everything here is a pure function of (stageKey, record)
// so the animation is deterministic and replays cleanly off a React key.
// ---------------------------------------------------------------------------

export type StoryStageKey = "discover" | "propose" | "score" | "review" | "release";

export type StoryVariant = "hidden" | "forge" | "gate" | "hold" | "sealed";

export type StoryState = {
  /** Hero node position in the Atlas viewBox coordinate space. */
  heroPos: { x: number; y: number };
  variant: StoryVariant;
  /** Whether the hero node should be painted at all. */
  heroVisible: boolean;
  /** Edges (by logical id) that should draw-on / pulse for this stage. */
  activeEdges: StoryEdgeKey[];
  /** Whether the forge->gate run should fire amber (gate firing). */
  gateFiring: boolean;
  /** Whether the seal/packet pop should play (release). */
  sealed: boolean;
};

export type StoryEdgeKey = "role-forge" | "forge-gate" | "gate-workflow" | "gate-seal";

// Lane anchors mirror data.ts atlasNodes x-positions so the hero lines up with
// the fixed backdrop: signals 12, roles 32, forge 52, gate 67, workflow 82.
const FORGE = { x: 52, y: 49 };
const GATE = { x: 67, y: 49 };
// The hero seals as the newest approved workflow, appended below the live lane,
// so the sealing node never overlaps an existing one. The Atlas includes this
// point in its auto-fit, so the camera pulls back to reveal the sealed result.
const RELEASE_SEAL = { x: 82, y: 98 };
// Just off-stage left of the forge so "animate in" reads as entering the forge.
const OFFSTAGE = { x: 40, y: 49 };

/**
 * Pure mapping from a story stage + its focal record to where/how the hero
 * proposal node should render. No record fields change the geometry today, but
 * the record is threaded through so future variants (risk-tinted seal, etc.)
 * stay a pure function of live data.
 */
export function storyStateForStage(stageKey: string, _record: Capability | undefined): StoryState {
  switch (stageKey) {
    case "discover":
      return {
        heroPos: OFFSTAGE,
        variant: "hidden",
        heroVisible: false,
        activeEdges: [],
        gateFiring: false,
        sealed: false
      };
    case "propose":
      return {
        heroPos: FORGE,
        variant: "forge",
        heroVisible: true,
        activeEdges: ["role-forge"],
        gateFiring: false,
        sealed: false
      };
    case "score":
      return {
        heroPos: GATE,
        variant: "gate",
        heroVisible: true,
        activeEdges: ["forge-gate"],
        gateFiring: true,
        sealed: false
      };
    case "review":
      return {
        heroPos: GATE,
        variant: "hold",
        heroVisible: true,
        activeEdges: ["forge-gate"],
        gateFiring: false,
        sealed: false
      };
    case "release":
      return {
        heroPos: RELEASE_SEAL,
        variant: "sealed",
        heroVisible: true,
        // Link the sealed release back to the Risk Gate so it reads as a
        // governed workflow that passed the gate, not a node floating free.
        activeEdges: ["gate-seal"],
        gateFiring: false,
        sealed: true
      };
    default:
      return {
        heroPos: OFFSTAGE,
        variant: "hidden",
        heroVisible: false,
        activeEdges: [],
        gateFiring: false,
        sealed: false
      };
  }
}

// ---------------------------------------------------------------------------
// Auto-play: the centerpiece for screen recording.
//
// Play advances stages on a fixed beat, stops at Release with a Replay; any
// manual interaction (or Pause) cancels it. Timers are cleaned up on unmount
// and whenever the loop is toggled. prefers-reduced-motion disables auto-play.
// ---------------------------------------------------------------------------

const AUTOPLAY_BEAT_MS = 3500;
const STAGE_COUNT = 5;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Drives auto-advance. `stageIndex` is the source of truth (owned by the demo
 * state); this hook only schedules a beat that calls `onAdvance` and stops the
 * moment we reach Release. Toggling `playing` off (Pause) or any external stage
 * jump that lands on Release ends the loop.
 */
export function useAutoPlay({
  playing,
  stageIndex,
  onAdvance,
  onStop
}: {
  playing: boolean;
  stageIndex: number;
  onAdvance: () => void;
  onStop: () => void;
}) {
  const advanceRef = useRef(onAdvance);
  const stopRef = useRef(onStop);
  advanceRef.current = onAdvance;
  stopRef.current = onStop;

  useEffect(() => {
    if (!playing) {
      return;
    }
    // Reached the end of the arc: stop and let the strip offer Replay.
    if (stageIndex >= STAGE_COUNT - 1) {
      stopRef.current();
      return;
    }
    const timer = window.setTimeout(() => {
      advanceRef.current();
    }, AUTOPLAY_BEAT_MS);
    return () => window.clearTimeout(timer);
  }, [playing, stageIndex]);
}

// ---------------------------------------------------------------------------
// Stage-aware proof badges. The badge set tells a different governance story at
// each stage; counts come from the focal record's live risk review / packet
// where available, else from static fallbacks.
// ---------------------------------------------------------------------------

export function proofBadgesForStage(
  stageKey: string,
  risk: RiskReview | undefined,
  packet: ReleasePacket | undefined
): string[] {
  switch (stageKey) {
    case "discover":
      return ["People", "Meetings", "Summary-only", "No raw M365 content"];
    case "propose":
      return ["Confirmation gate", "Correlation ID", "Governed write"];
    case "score": {
      const controls = risk?.requiredControls?.length ?? 0;
      const controlLabel = controls > 0 ? `${controls} controls` : "Deterministic controls";
      return [controlLabel, "Deterministic verdict", "Advisory reasoning"];
    }
    case "review":
      return ["Reviewer required", "Human-in-the-loop", "No release without approval"];
    case "release":
      return [
        packet ? `Release packet ${packet.version}` : "Release packet",
        "Owner + Reviewer",
        "One correlation ID"
      ];
    default:
      return ["People", "Meetings", "Summary-only", "No raw M365 content"];
  }
}

// ---------------------------------------------------------------------------
// Inline reasoning at Score. Reuses the existing `.advisory-steps.reasoning-star`
// classes (we render our own JSX rather than importing from panels.tsx). When
// the advisory is unavailable we fall back to the deterministic-verdict line so
// the panel is never empty.
// ---------------------------------------------------------------------------

export function InlineReasoning({ risk, stageKey }: { risk: RiskReview | undefined; stageKey: string }) {
  const advisory = risk?.advisory;
  const available = advisory?.status === "available";
  const steps = available ? advisory?.steps ?? [] : [];
  const disagrees = advisory?.agreesWithGate === false;

  return (
    // Keyed on stageKey so the numbered steps replay their land-in animation
    // each time the judge re-enters Score.
    <aside className="story-reasoning" key={`reasoning-${stageKey}`} aria-label="Reasoning at the gate">
      <div className="story-reasoning-head">
        <span className="eyebrow">Reasoning at the gate</span>
        {risk ? <small>{`Verdict ${risk.riskLevel.toUpperCase()}`}</small> : null}
      </div>

      {available && steps.length > 0 ? (
        <>
          <ol className="advisory-steps reasoning-star" aria-label="The model's step-by-step risk deliberation">
            {steps.map((step, index) => (
              <li key={`${step.signal}-${index}`} style={{ animationDelay: `${index * 220}ms` }}>
                <span className="step-num" aria-hidden="true">{index + 1}</span>
                <div className="step-body">
                  <strong>{step.signal}</strong>
                  <span>{step.concern}</span>
                  <em>&rarr; {step.suggestedControl}</em>
                </div>
              </li>
            ))}
          </ol>
          <p className={`story-reasoning-verdict ${disagrees ? "disagree" : "agree"}`}>
            {disagrees
              ? "Advisory disagreed — the deterministic gate ruled, and the gate wins."
              : "Advisory agrees with the deterministic gate."}
          </p>
        </>
      ) : (
        <div className="story-reasoning-fallback">
          <strong>{risk ? `Deterministic verdict: ${risk.riskLevel.toUpperCase()}` : "Deterministic verdict recorded"}</strong>
          <p>Unplug the model — the verdict is byte-identical. Proven by test, not promised.</p>
        </div>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Disagreement lock at Score. Prefer the focal record when its advisory already
// disagrees with the gate; otherwise pick any review whose advisory disagrees so
// the model-vs-gate drama always lands. Falls back to the focal record.
// ---------------------------------------------------------------------------

export function pickScoreRisk(
  focalRisk: RiskReview | undefined,
  riskReviews: readonly RiskReview[]
): RiskReview | undefined {
  if (focalRisk?.advisory?.status === "available" && focalRisk.advisory.agreesWithGate === false) {
    return focalRisk;
  }
  const disagreement = riskReviews.find(
    (item) => item.advisory?.status === "available" && item.advisory.agreesWithGate === false
  );
  return disagreement ?? focalRisk ?? riskReviews[0];
}

// Lightweight Play/Pause/Replay control for the action strip.
export function AutoPlayControl({
  playing,
  atEnd,
  reducedMotion,
  onPlay,
  onPause,
  onReplay
}: {
  playing: boolean;
  atEnd: boolean;
  reducedMotion: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
}) {
  if (reducedMotion) {
    return null;
  }
  if (atEnd && !playing) {
    return (
      <button type="button" className="autoplay-btn" onClick={onReplay} aria-label="Replay the guided story">
        <ReplayGlyph /> Replay
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`autoplay-btn ${playing ? "is-playing" : ""}`}
      onClick={playing ? onPause : onPlay}
      aria-pressed={playing}
      aria-label={playing ? "Pause auto-play" : "Play the guided story"}
    >
      {playing ? <PauseGlyph /> : <PlayGlyph />} {playing ? "Pause" : "Play"}
    </button>
  );
}

function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4 3.2 12.5 8 4 12.8z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
      <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

function ReplayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8 3a5 5 0 1 1-4.6 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M3.4 2.2 3.4 6 7.1 6z" fill="currentColor" />
    </svg>
  );
}
