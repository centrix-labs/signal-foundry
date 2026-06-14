import type { Capability, ReleasePacket, RiskReview } from "@signal-foundry/shared";
import { riskLabels, statusLabels } from "./data";

// A generated, viewable release-packet document. Every field is derived from the
// capability + release packet (+ risk review when present) — there is no static
// placeholder content. The tenant data is synthetic, so artifacts are labelled
// "Synthetic — production-shaped" rather than claimed as real customer records.
export interface ReleaseArtifactSection {
  heading: string;
  lines: string[];
}

export interface ReleaseArtifact {
  key: string;
  title: string;
  version: string;
  provenance: string;
  summary: string;
  sections: ReleaseArtifactSection[];
}

const PROVENANCE = "Synthetic — production-shaped";

function audienceLabel(scope: string): string {
  return scope.charAt(0).toUpperCase() + scope.slice(1);
}

function list(values: readonly string[], fallback: string): string[] {
  return values.length > 0 ? [...values] : [fallback];
}

export function buildReleaseArtifacts(
  capability: Capability,
  packet: ReleasePacket,
  risk?: RiskReview
): ReleaseArtifact[] {
  const version = packet.version || capability.version;
  const released = packet.releasedAt && !packet.releasedAt.startsWith("Pending");
  const advisory = risk?.advisory;
  const advisoryLine = advisory?.status === "available"
    ? advisory.agreesWithGate === false
      ? `Advisory (${advisory.model ?? "model"}) disagreed; the deterministic gate ruled.`
      : `Advisory (${advisory.model ?? "model"}) agreed with the deterministic gate.`
    : "Advisory unavailable — the deterministic gate stands alone.";

  return [
    {
      key: "workflow-spec",
      title: "Workflow Spec",
      version,
      provenance: PROVENANCE,
      summary: `What ${capability.title} does and the boundaries it runs inside.`,
      sections: [
        {
          heading: "Purpose",
          lines: [capability.description, `Owner: ${capability.owner} · ${capability.department}`, `Primary role: ${capability.role}`]
        },
        {
          heading: "Approved audience",
          lines: [`Scope: ${audienceLabel(packet.approvedAudience)}`, "Outputs are summary-only and require human review before customer-facing use."]
        },
        { heading: "Inputs required", lines: list(capability.inputsRequired, "No structured inputs declared.") },
        { heading: "Proposed outputs", lines: list(capability.proposedOutputs, "No outputs declared.") },
        {
          heading: "Grounding sources",
          lines: [capability.sourceSummary, ...list(packet.approvedSourceTypes, "No approved source types recorded.")]
        }
      ]
    },
    {
      key: "risk-assessment",
      title: "Risk Assessment",
      version,
      provenance: PROVENANCE,
      summary: `Deterministic verdict ${riskLabels[capability.riskLevel]} with ${risk?.requiredControls.length ?? 0} required controls.`,
      sections: [
        {
          heading: "Verdict",
          lines: [
            `Risk level: ${riskLabels[capability.riskLevel]}`,
            risk ? `Data sensitivity: ${riskLabels[risk.dataSensitivity]} · External sharing: ${riskLabels[risk.externalSharing]}` : "Sub-scores synthesized from the capability profile.",
            risk ? `Automation: ${risk.automationLevel.replace(/_/g, " ")} · Uses customer data: ${risk.usesCustomerData ? "yes" : "no"}` : "Automation level: assistive."
          ]
        },
        { heading: "Required controls", lines: list(risk?.requiredControls ?? [], "Standard governed-write controls apply.") },
        { heading: "Rationale", lines: [risk?.rationale ?? "Controls follow the deterministic risk profile for this audience and data class."] },
        { heading: "AI advisory", lines: [advisoryLine, ...(advisory?.selfCritique ? [`Self-critique: ${advisory.selfCritique}`] : [])] },
        { heading: "Human review", lines: [packet.requiredHumanReview ? "Required — release is blocked until a reviewer approves." : "Assistive path — human review recommended."] }
      ]
    },
    {
      key: "data-flow",
      title: "Data-Flow Diagram",
      version,
      provenance: PROVENANCE,
      summary: "How a work signal becomes an approved, audited release — and where the boundaries sit.",
      sections: [
        {
          heading: "Flow",
          lines: [
            "[ Work signals ]  People + Meetings, summary-only (Work IQ-style)",
            "        |",
            "        v",
            "[ M365 Copilot ]  declarative agent, confirmation gate",
            "        |  create_capability_proposal",
            "        v",
            "[ MCP risk gate ]  deterministic score + AI advisory",
            "        |  approved_for_release only after human review",
            "        v",
            "[ Human review ]  reviewer approves or blocks",
            "        |  release_capability",
            "        v",
            "[ Release packet ]  this document set + audit trail"
          ]
        },
        {
          heading: "Boundaries",
          lines: [
            "No raw emails, chats, files, or transcripts cross the boundary — summaries only.",
            "Every hop writes a sanitized audit event under one correlation ID.",
            `Correlation ID: ${packet.correlationId}`
          ]
        }
      ]
    },
    {
      key: "runbook",
      title: "Runbook",
      version,
      provenance: PROVENANCE,
      summary: `Operate, verify, and roll back ${capability.title}.`,
      sections: [
        { heading: "Status", lines: [`${statusLabels[capability.status]} · version ${version}`, released ? `Released: ${packet.releasedAt}` : "Not yet released — pending reviewer approval.", `Reviewer: ${packet.reviewer}`] },
        { heading: "Usage guidance", lines: list(packet.usageGuidance, "Use approved summaries only; keep human review for customer-facing outputs.") },
        {
          heading: "Verify",
          lines: [
            "Confirm the deterministic gate verdict matches this packet's risk level.",
            "Confirm the audit trail shows approve_capability before release_capability.",
            advisoryLine
          ]
        },
        {
          heading: "Rollback",
          lines: [
            "Re-run review to move the capability back to In Review and halt new releases.",
            "Anti-surveillance and no-raw-content policies cannot be overridden by rollback.",
            `Trace everything via correlation ID ${packet.correlationId}.`
          ]
        }
      ]
    }
  ];
}
