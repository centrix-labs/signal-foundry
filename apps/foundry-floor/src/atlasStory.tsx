import { pathFor } from "./atlasGeometry";
import type { StoryState } from "./story";

// Lane anchors for the Guided Story hero node. These mirror the x-positions of
// the fixed backdrop nodes in data.ts (forge 52, gate 67, workflow 82) so the
// hero lines up with the structural graph as it travels.
const STORY_FORGE = { x: 52, y: 49 };
const STORY_GATE = { x: 67, y: 49 };
const STORY_WORKFLOW = { x: 82, y: 49 };
const STORY_ROLE = { x: 32, y: 34 };
// Mirrors RELEASE_SEAL in story.tsx — where the hero seals below the lane.
const STORY_SEAL = { x: 82, y: 98 };

function storyEdgePath(key: StoryState["activeEdges"][number]): string {
  switch (key) {
    case "role-forge":
      return pathFor({ ...STORY_ROLE, id: "s", label: "", kind: "role" }, { ...STORY_FORGE, id: "f", label: "", kind: "department" });
    case "forge-gate":
      return pathFor({ ...STORY_FORGE, id: "f", label: "", kind: "department" }, { ...STORY_GATE, id: "g", label: "", kind: "risk_gate" });
    case "gate-workflow":
      return pathFor({ ...STORY_GATE, id: "g", label: "", kind: "risk_gate" }, { ...STORY_WORKFLOW, id: "w", label: "", kind: "workflow" });
    case "gate-seal":
      return pathFor({ ...STORY_GATE, id: "g", label: "", kind: "risk_gate" }, { ...STORY_SEAL, id: "seal", label: "", kind: "workflow" });
    default:
      return "";
  }
}

// The Guided Story renders in two layers so the connector never sits on top of
// a node: StoryEdges draws with the other edges (behind nodes), StoryHero draws
// after the nodes (on top). Both are keyed on the stage so one-shot animations
// replay on each advance; the hero group is NOT keyed so it travels smoothly.
export function StoryEdges({ story, stageKey }: { story: StoryState; stageKey?: string }) {
  return (
    <g className="story-edges" aria-hidden="true">
      {story.activeEdges.map((edge) => (
        <path
          key={`${edge}-${stageKey}`}
          className={`story-edge ${edge} ${story.gateFiring && edge === "forge-gate" ? "firing" : ""}`}
          d={storyEdgePath(edge)}
          pathLength={1}
        />
      ))}
    </g>
  );
}

export function StoryHero({ story, stageKey, heroLabel }: { story: StoryState; stageKey?: string; heroLabel?: string }) {
  const { heroPos, variant, heroVisible } = story;
  if (!heroVisible) {
    return null;
  }
  // Size the label box to its text so wide titles never bleed past the box.
  const heroText = heroLabel ? (heroLabel.length > 26 ? `${heroLabel.slice(0, 25)}…` : heroLabel) : "";
  const heroLabelWidth = Math.max(10, heroText.length * 0.9 + 2.4);
  return (
    <g
      className={`story-hero story-hero-${variant}`}
      style={{ transform: `translate(${heroPos.x}px, ${heroPos.y}px)` }}
      aria-hidden="true"
    >
      {/* arrive / seal one-shots replay via the stage key */}
      <g key={`hero-fx-${stageKey}`} className="story-hero-fx" pointerEvents="none">
        <circle className="story-hero-burst" r={3.4} />
      </g>
      {variant === "sealed" ? (
        <g key={`seal-${stageKey}`} className="story-seal-pop" pointerEvents="none">
          <rect className="story-packet" x={-1.2} y={-1.2} width={2.4} height={2.4} rx={0.5} />
        </g>
      ) : null}
      {variant === "hold" ? (
        <g className="story-hold-marker" pointerEvents="none">
          {/* shield outline — human hold */}
          <path className="story-shield" d="M0 -3.1 L2.4 -2 L2.4 0.4 Q2.4 2.4 0 3.4 Q-2.4 2.4 -2.4 0.4 L-2.4 -2 Z" />
        </g>
      ) : null}
      <circle className="story-hero-ring" r={2.7} />
      <circle className="story-hero-core" r={1.15} />
      {/* Label only the sealed result — in the clear space below the lane. While
          the hero is in flight the right-rail ledger already names the record,
          so an axis label here would just crowd the forge/gate nodes. */}
      {heroText && variant === "sealed" ? (
        <g className="story-hero-label" pointerEvents="none">
          <rect className="story-hero-label-bg" x={-heroLabelWidth / 2} y={3.4} width={heroLabelWidth} height={3.4} rx={0.8} />
          <text className="story-hero-label-text" x={0} y={5.7} textAnchor="middle">{heroText}</text>
        </g>
      ) : null}
    </g>
  );
}
