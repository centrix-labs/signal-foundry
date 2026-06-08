import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve("/Users/mattgraves/Documents/hackathon-enterprise");

const requiredFiles = [
  "evidence/copilot/signal-foundry-copilot-asteria-live-20260608-1145.zip",
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
  "tenant sideload screenshot pending",
  "Microsoft 365 Copilot Chat sideload screenshot",
  "Copilot Chat role recommendation screenshot",
  "Copilot Chat anti-surveillance refusal screenshot"
];

function fileStatus(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return { path: relativePath, status: "missing" };
  }
  const size = statSync(absolutePath).size;
  return { path: relativePath, status: size > 0 ? "present" : "empty", bytes: size };
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
const screenshotStatuses = requiredCopilotScreenshots.map(fileStatus);
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
