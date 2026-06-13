import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react";
import type { ViewKey } from "./data";

export const WALKTHROUGH_SEEN_KEY = "signal-foundry-walkthrough-seen";

type TourStep = {
  title: string;
  body: string;
  selector?: string;
  view?: ViewKey;
  placement?: "auto" | "center";
};

const STEPS: TourStep[] = [
  {
    title: "Welcome to Signal Foundry",
    body: "A 45-second tour of how an employee AI idea becomes a risk-scored, human-approved, audit-safe Copilot workflow. Use Next, or skip anytime.",
    placement: "center"
  },
  {
    title: "Guided Story is where to start",
    body: "Start here. The Guided Story walks the full governance journey end to end — no setup, no clicking around to find the point.",
    selector: '[data-tour="nav-judge"]',
    view: "judge"
  },
  {
    title: "Five governed stages",
    body: "Discover → Propose → Score → Review → Release. Each stage is a real control, not a slide. Click a stage to jump to it.",
    selector: '[data-tour="stage-stepper"]',
    view: "judge"
  },
  {
    title: "The Signal Atlas",
    body: "Summary work signals flow left to right into approved workflows. Click any node to focus it — selecting a node pulses to show what changed.",
    selector: '[data-tour="atlas"]',
    view: "judge"
  },
  {
    title: "Evidence accrues per stage",
    body: "The story ledger fills in the proof for each stage — grounding, the risk verdict, the reviewer decision, and the sealed release packet.",
    selector: '[data-tour="story-ledger"]',
    view: "judge"
  },
  {
    title: "Advance the story",
    body: "Step through the journey here, or reset to the golden scenario. Everything updates live — the Atlas, the ledger, and the proof panel.",
    selector: '[data-tour="advance"]',
    view: "judge"
  },
  {
    title: "Trace the architecture",
    body: "The Architecture view maps every tier and service. Hover any service to light up exactly what it connects to, with right-angle paths.",
    selector: '[data-tour="nav-architecture"]',
    view: "architecture"
  },
  {
    title: "You're ready",
    body: "Re-open this tour anytime from the Help button in the top bar. Now walk the story — the reasoning lives in the Risk Gate, the guarantee lives in the test.",
    placement: "center"
  }
];

type SpotRect = { top: number; left: number; width: number; height: number };

type WalkthroughProps = {
  open: boolean;
  onClose: () => void;
  onRequestView: (view: ViewKey) => void;
};

export function Walkthrough({ open, onClose, onRequestView }: WalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);

  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  // Switch to the view a step needs before we measure its target element.
  useEffect(() => {
    if (open && step.view) {
      onRequestView(step.view);
    }
  }, [open, step.view, onRequestView]);

  const measure = useCallback(() => {
    if (!open) {
      return;
    }
    if (step.placement === "center" || !step.selector) {
      setSpot(null);
      return;
    }
    const el = document.querySelector(step.selector);
    if (!el) {
      setSpot(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const pad = 8;
    setSpot({
      top: Math.max(8, rect.top - pad),
      left: Math.max(8, rect.left - pad),
      width: rect.width + pad * 2,
      height: rect.height + pad * 2
    });
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [open, step.placement, step.selector]);

  // Measure after the view switch / layout settles, and on resize/scroll.
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const raf = requestAnimationFrame(() => {
      const timer = window.setTimeout(measure, 90);
      void timer;
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, stepIndex, measure]);

  const finish = useCallback(() => {
    window.localStorage.setItem(WALKTHROUGH_SEEN_KEY, "1");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        finish();
      } else if (event.key === "ArrowRight" && !isLast) {
        setStepIndex((index) => index + 1);
      } else if (event.key === "ArrowLeft" && !isFirst) {
        setStepIndex((index) => index - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isFirst, isLast, finish]);

  if (!open) {
    return null;
  }

  const tipStyle = computeTipStyle(spot);

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="Signal Foundry walkthrough">
      {spot ? (
        <div
          className="tour-spotlight"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          aria-hidden="true"
        />
      ) : (
        <div className="tour-scrim" aria-hidden="true" />
      )}

      <div className={`tour-card ${spot ? "" : "tour-card-center"}`} style={tipStyle}>
        <div className="tour-card-head">
          <span className="tour-kicker"><Compass size={14} /> Tour · {stepIndex + 1} of {STEPS.length}</span>
          <button type="button" className="tour-close" onClick={finish} aria-label="Close walkthrough"><X size={16} /></button>
        </div>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div className="tour-progress" aria-hidden="true">
          {STEPS.map((item, index) => (
            <i key={item.title} className={index === stepIndex ? "on" : ""} />
          ))}
        </div>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>Skip</button>
          <div className="tour-nav">
            {!isFirst ? (
              <button type="button" className="tour-back" onClick={() => setStepIndex((index) => index - 1)}>
                <ChevronLeft size={15} /> Back
              </button>
            ) : null}
            {isLast ? (
              <button type="button" className="tour-next" onClick={finish}>Done</button>
            ) : (
              <button type="button" className="tour-next" onClick={() => setStepIndex((index) => index + 1)}>
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function computeTipStyle(spot: SpotRect | null): React.CSSProperties {
  if (!spot) {
    return {};
  }
  const cardW = 340;
  const cardH = 210;
  const gap = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - (spot.top + spot.height);
  const placeBelow = spaceBelow > cardH + gap || spaceBelow > spot.top;
  const top = placeBelow
    ? Math.min(spot.top + spot.height + gap, vh - cardH - 8)
    : Math.max(8, spot.top - cardH - gap);

  let left = spot.left + spot.width / 2 - cardW / 2;
  left = Math.max(12, Math.min(left, vw - cardW - 12));

  return { top, left, width: cardW };
}
