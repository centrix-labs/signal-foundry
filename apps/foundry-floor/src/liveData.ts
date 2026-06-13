import { useEffect, useMemo, useState } from "react";
import type {
  AuditEvent,
  Capability,
  CapabilityProposal,
  CopilotCheckpoint,
  McpActivity,
  ReleasePacket,
  ReviewItem,
  RiskReview,
  SignalFoundryRegistry
} from "@signal-foundry/shared";
import {
  auditEvents as sampleAuditEvents,
  capabilities as sampleCapabilities,
  mcpActivity as sampleMcpActivity,
  releasePackets as sampleReleasePackets,
  reviewItems as sampleReviewItems,
  riskReview as sampleRiskReview
} from "./data";

const defaultApiBase = "https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io";
export const apiBase = ((import.meta.env["VITE_SIGNAL_FOUNDRY_API_BASE"] as string | undefined) ?? defaultApiBase).replace(/\/$/, "");
const demoActorId = (import.meta.env["VITE_SIGNAL_FOUNDRY_DEMO_ACTOR"] as string | undefined) ?? "actor-alex";

type RegistrySnapshot = Pick<
  SignalFoundryRegistry,
  "capabilities" | "proposals" | "riskReviews" | "reviewItems" | "releasePackets" | "mcpActivity" | "copilotCheckpoints" | "auditEvents"
>;

type SnapshotResponse = {
  ok: boolean;
  registry?: RegistrySnapshot;
};

export type DashboardData = {
  records: Capability[];
  reviewItems: ReviewItem[];
  releasePackets: ReleasePacket[];
  riskReviews: RiskReview[];
  mcpActivity: McpActivity[];
  copilotCheckpoints: CopilotCheckpoint[];
  auditEvents: AuditEvent[];
  isLive: boolean;
  liveError?: string;
  refreshedAt?: string;
};

export function useDashboardData(): DashboardData {
  const [snapshot, setSnapshot] = useState<RegistrySnapshot | null>(null);
  const [liveError, setLiveError] = useState<string>();
  const [refreshedAt, setRefreshedAt] = useState<string>();

  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();

    async function loadSnapshot() {
      try {
        const response = await fetch(`${apiBase}/registry/snapshot`, {
          headers: { "x-sf-actor-id": demoActorId },
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Registry snapshot failed with ${response.status}.`);
        }
        const body = (await response.json()) as SnapshotResponse;
        if (!body.ok || !body.registry) {
          throw new Error("Registry snapshot payload was incomplete.");
        }
        if (isCurrent) {
          setSnapshot(body.registry);
          setLiveError(undefined);
          setRefreshedAt(new Date().toISOString());
        }
      } catch (error) {
        if (!isCurrent || controller.signal.aborted) {
          return;
        }
        setLiveError(error instanceof Error ? error.message : "Registry snapshot unavailable.");
      }
    }

    void loadSnapshot();
    const interval = window.setInterval(loadSnapshot, 15000);
    return () => {
      isCurrent = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return useMemo(() => buildDashboardData(snapshot, liveError, refreshedAt), [snapshot, liveError, refreshedAt]);
}

function buildDashboardData(snapshot: RegistrySnapshot | null, liveError?: string, refreshedAt?: string): DashboardData {
  if (!snapshot) {
    return {
      records: [...sampleCapabilities],
      reviewItems: [...sampleReviewItems],
      releasePackets: [...sampleReleasePackets],
      riskReviews: [sampleRiskReview],
      mcpActivity: [...sampleMcpActivity],
      copilotCheckpoints: [],
      auditEvents: [...sampleAuditEvents],
      isLive: false,
      liveError
    };
  }

  const proposalRecords = snapshot.proposals.map((proposal) => projectProposal(proposal, snapshot.riskReviews));
  const records = clean(mergeById(proposalRecords, snapshot.capabilities, sampleCapabilities));
  const reviewItems = clean(mergeById(withSyntheticReviewItems(snapshot.reviewItems, snapshot.proposals, snapshot.riskReviews), sampleReviewItems));

  return {
    records,
    reviewItems,
    releasePackets: clean(mergeById(snapshot.releasePackets, sampleReleasePackets)),
    riskReviews: clean(mergeById(snapshot.riskReviews, [sampleRiskReview])),
    mcpActivity: clean(mergeById(snapshot.mcpActivity, sampleMcpActivity)),
    copilotCheckpoints: clean([...(snapshot.copilotCheckpoints ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    auditEvents: clean(mergeById(snapshot.auditEvents, sampleAuditEvents)),
    isLive: true,
    liveError,
    refreshedAt
  };
}

// Smoke-test and probe records created during live validation are demo noise.
// Filter them out of every collection so the registry reads as a curated demo.
const DEMO_NOISE = /checkpoint smoke|advisory probe|smoke test/i;

function clean<T>(items: readonly T[]): T[] {
  return items.filter((item) => !DEMO_NOISE.test(JSON.stringify(item)));
}

function projectProposal(proposal: CapabilityProposal, riskReviews: RiskReview[]): Capability {
  const risk = riskReviews.find((item) => item.proposalId === proposal.id);
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    role: proposal.role,
    department: proposal.department,
    owner: proposal.owner,
    intendedAudience: proposal.intendedAudience,
    inputsRequired: proposal.inputsRequired,
    proposedOutputs: proposal.proposedOutputs,
    sourceSummary: proposal.sourceSummary,
    approvedSourceTypes: ["Pending reviewer approval"],
    status: proposal.status,
    riskLevel: risk?.riskLevel ?? "medium",
    version: "v0.1.0",
    updatedAt: proposal.createdAt
  };
}

function withSyntheticReviewItems(reviewItems: ReviewItem[], proposals: CapabilityProposal[], riskReviews: RiskReview[]) {
  const existingProposalIds = new Set(reviewItems.map((item) => item.proposalId));
  const pending = proposals
    .filter((proposal) => ["proposed", "risk_scored", "in_review"].includes(proposal.status) && !existingProposalIds.has(proposal.id))
    .map((proposal): ReviewItem => ({
      id: `review-${proposal.id}`,
      proposalId: proposal.id,
      reviewer: "Alex Kim",
      dueDate: new Date().toISOString().slice(0, 10),
      status: "pending",
      recommendedDecision: riskReviews.find((risk) => risk.proposalId === proposal.id)?.riskLevel ?? "medium",
      createdAt: proposal.createdAt,
      correlationId: proposal.correlationId
    }));
  return [...reviewItems, ...pending];
}

function mergeById<T extends { id: string }>(...collections: readonly (readonly T[])[]) {
  const merged = new Map<string, T>();
  for (const collection of collections) {
    for (const item of collection) {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    }
  }
  return [...merged.values()];
}
