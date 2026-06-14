import { useEffect, useRef, useState } from "react";
import { ChevronRight, FileText, X } from "lucide-react";
import type { Capability, ReleasePacket, ReviewItem, RiskReview } from "@signal-foundry/shared";
import { releasePackets, reviewItems, riskReview } from "./data";
import { buildReleaseArtifacts, type ReleaseArtifact } from "./releaseArtifacts";

export function ReleasePacketDrawer({
  selected,
  packets = releasePackets,
  reviews = reviewItems,
  riskReviews = [riskReview]
}: {
  selected: Capability;
  packets?: readonly ReleasePacket[];
  reviews?: readonly ReviewItem[];
  riskReviews?: readonly RiskReview[];
}) {
  const packet = packets.find((item) => item.capabilityId === selected.id) ?? makePendingPacket(selected, reviews);
  const risk = riskReviews.find((item) => item.proposalId === selected.id);
  const artifacts = buildReleaseArtifacts(selected, packet, risk);
  const [openArtifact, setOpenArtifact] = useState<ReleaseArtifact | null>(null);

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
        {artifacts.map((artifact) => (
          <button
            key={artifact.key}
            type="button"
            className="artifact-row"
            onClick={() => setOpenArtifact(artifact)}
            aria-haspopup="dialog"
          >
            <FileText size={16} aria-hidden />
            <span className="artifact-row-text">
              <strong>{artifact.title}</strong>
              <small>{artifact.version} / synthetic</small>
            </span>
            <ChevronRight size={15} aria-hidden />
          </button>
        ))}
      </div>
      <ul>
        {packet.usageGuidance.map((item) => <li key={item}>{item}</li>)}
      </ul>
      {openArtifact ? <ArtifactDialog artifact={openArtifact} onClose={() => setOpenArtifact(null)} /> : null}
    </section>
  );
}

function ArtifactDialog({ artifact, onClose }: { artifact: ReleaseArtifact; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const titleId = `artifact-${artifact.key}-title`;
  return (
    <div className="artifact-dialog-overlay" onMouseDown={onClose}>
      <div
        className="artifact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="artifact-dialog-head">
          <div>
            <p className="eyebrow">Release artifact · {artifact.version}</p>
            <h3 id={titleId}>{artifact.title}</h3>
            <small className="artifact-provenance">{artifact.provenance}</small>
          </div>
          <button ref={closeRef} type="button" className="artifact-dialog-close" aria-label="Close artifact" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <p className="artifact-dialog-summary">{artifact.summary}</p>
        <div className="artifact-dialog-body">
          {artifact.sections.map((section) => (
            <section key={section.heading} className="artifact-section">
              <h4>{section.heading}</h4>
              {section.heading === "Flow" ? (
                <pre className="artifact-flow">{section.lines.join("\n")}</pre>
              ) : (
                <ul>
                  {section.lines.map((line, index) => <li key={`${section.heading}-${index}`}>{line}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function makePendingPacket(selected: Capability, reviews: readonly ReviewItem[]): ReleasePacket {
  const review = reviews.find((item) => item.proposalId === selected.id);
  return {
    id: `packet-${selected.id}`,
    capabilityId: selected.id,
    version: selected.version,
    owner: selected.owner,
    approvedAudience: selected.intendedAudience,
    approvedSourceTypes: selected.approvedSourceTypes,
    requiredHumanReview: true,
    usageGuidance: ["Hold release until reviewer approval", "Use approved summaries only", "Keep correlation IDs sanitized"],
    reviewer: review?.reviewer ?? "Pending reviewer assignment",
    releasedAt: "Pending reviewer approval",
    correlationId: review?.correlationId ?? `corr-${selected.id}`
  };
}
