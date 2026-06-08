import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve("/Users/mattgraves/Documents/hackathon-enterprise");

const requiredFiles = [
  "evidence/copilot/signal-foundry-copilot-role-aware-starters-20260608-1305.zip",
  "evidence/copilot/copilot-evidence-capture-runbook.md",
  "evidence/azure/deployed-smoke-results.md",
  "evidence/azure/resource-list.json",
  "evidence/azure/container-app-state.json",
  "evidence/azure/static-web-app-state.json",
  "evidence/azure/sanitized-log-analytics-sample.json",
  "evidence/azure/budget.json",
  "evidence/videos/signal-foundry-live-demo.webm"
];

const requiredCopilotScreenshots = [
  "evidence/screenshots/copilot-agent-invocation-asteria.png",
  "evidence/screenshots/copilot-workiq-recommendation-asteria.png",
  "evidence/screenshots/copilot-anti-surveillance-refusal-asteria.png"
];

const requiredEvidencePhrases = [
  "evidence/screenshots/copilot-agent-invocation-asteria.png",
  "evidence/screenshots/copilot-workiq-recommendation-asteria.png",
  "evidence/screenshots/copilot-anti-surveillance-refusal-asteria.png",
  "Microsoft 365 Copilot Chat screenshots captured"
];

function fileStatus(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return { path: relativePath, status: "missing" };
  }
  const size = statSync(absolutePath).size;
  return { path: relativePath, status: size > 0 ? "present" : "empty", bytes: size };
}

function pngStatus(relativePath) {
  const baseStatus = fileStatus(relativePath);
  if (baseStatus.status !== "present") {
    return baseStatus;
  }

  const absolutePath = join(repoRoot, relativePath);
  const buffer = readFileSync(absolutePath);
  if (buffer.length < 24) {
    return { ...baseStatus, status: "invalid", reason: "too_small_for_png_header" };
  }

  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    return { ...baseStatus, status: "invalid", reason: "not_png" };
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (buffer.length < 10 * 1024) {
    return { ...baseStatus, status: "invalid", reason: "too_small", width, height };
  }
  if (width < 320 || height < 320) {
    return { ...baseStatus, status: "invalid", reason: "dimensions_too_small", width, height };
  }

  return { ...baseStatus, width, height };
}

function assertEvidenceHonesty() {
  const checklist = readFileSync(join(repoRoot, "evidence/judge-evidence-checklist.md"), "utf8");
  const summary = readFileSync(join(repoRoot, "evidence/final-summary.md"), "utf8");
  const combined = `${checklist}\n${summary}`;
  return requiredEvidencePhrases
    .filter((phrase) => !combined.includes(phrase))
    .map((phrase) => ({ phrase, status: "missing" }));
}

const requiredFileStatuses = requiredFiles.map(fileStatus);
const screenshotStatuses = requiredCopilotScreenshots.map(pngStatus);
const missingEvidencePhrases = assertEvidenceHonesty();

const blockingItems = [
  ...requiredFileStatuses.filter((item) => item.status !== "present"),
  ...screenshotStatuses.filter((item) => item.status !== "present"),
  ...missingEvidencePhrases
];

const report = {
  status: blockingItems.length === 0 ? "ready" : "not_ready",
  requiredFiles: requiredFileStatuses,
  copilotScreenshots: screenshotStatuses,
  evidenceHonesty: missingEvidencePhrases.length === 0 ? "present" : "missing",
  blockingItems
};

console.log(JSON.stringify(report, null, 2));

if (blockingItems.length > 0) {
  process.exitCode = 1;
}
