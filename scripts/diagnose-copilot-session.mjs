import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "..");
const snapshotDirectory = join(repoRoot, ".playwright-mcp");
const outputPath = join(repoRoot, "evidence/copilot/copilot-session-diagnostic.md");

const requiredScreenshots = [
  "evidence/screenshots/copilot-agent-invocation-asteria.png",
  "evidence/screenshots/copilot-workiq-recommendation-asteria.png",
  "evidence/screenshots/copilot-anti-surveillance-refusal-asteria.png"
];

function snapshotFiles() {
  if (!existsSync(snapshotDirectory)) {
    return [];
  }

  return readdirSync(snapshotDirectory)
    .filter((entry) => /^page-.+\.yml$/.test(entry))
    .sort()
    .map((entry) => join(snapshotDirectory, entry));
}

function collectSignals(files) {
  const signals = {
    m365Copilot: false,
    workIqVisible: false,
    messageBoxVisible: false,
    signInPending: false,
    signalFoundryAgent: false
  };

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    signals.m365Copilot ||=
      content.includes("M365 Copilot") ||
      content.includes("Message Copilot") ||
      content.includes("Commercial data protection badge.");
    signals.workIqVisible ||= content.includes("Work IQ");
    signals.messageBoxVisible ||= content.includes("Message Copilot");
    signals.signInPending ||= content.includes("Trying to sign you in");
    signals.signalFoundryAgent ||= content.includes("Signal Foundry");
  }

  return signals;
}

function formatBoolean(value) {
  return value ? "observed" : "not observed";
}

const files = snapshotFiles();
const latestSnapshot = files.length > 0 ? files[files.length - 1].replace(`${repoRoot}/`, "") : "none";
const latestFile = files.length > 0 ? files[files.length - 1] : undefined;
const latestSignals = collectSignals(latestFile ? [latestFile] : []);
const historicalSignals = collectSignals(files);
const capturedScreenshots = requiredScreenshots.filter((path) => existsSync(join(repoRoot, path)));
const latestSnapshotTimestamp = latestSnapshot.match(/page-(.+)\.yml$/)?.[1] ?? "no-snapshot";

const lines = [
  "# Copilot Session Diagnostic",
  "",
  `Snapshot timestamp: ${latestSnapshotTimestamp}`,
  "",
  "This diagnostic summarizes safe browser-state signals only. It does not copy raw Copilot chat text, tenant content, user names, emails, tokens, cookies, or Microsoft 365 source material.",
  "",
  "## Latest Snapshot Signals",
  "",
  `- Snapshot files inspected: ${files.length}`,
  `- Latest snapshot path: \`${latestSnapshot}\``,
  `- M365 Copilot page: ${formatBoolean(latestSignals.m365Copilot)}`,
  `- Work IQ control: ${formatBoolean(latestSignals.workIqVisible)}`,
  `- Copilot message box: ${formatBoolean(latestSignals.messageBoxVisible)}`,
  `- Signal Foundry text in snapshot body: ${formatBoolean(latestSignals.signalFoundryAgent)}`,
  `- Historical sign-in pending screen: ${formatBoolean(historicalSignals.signInPending)}`,
  "",
  "## Evidence Status",
  "",
  `Authenticated Microsoft 365 Copilot screenshots captured: ${capturedScreenshots.length} of ${requiredScreenshots.length}. The final readiness gate validates these as non-empty PNG files with minimum dimensions:`,
  "",
  ...requiredScreenshots.map((path) => `- \`${path}\``),
  "",
  "Use `evidence/copilot/copilot-evidence-capture-runbook.md` for the exact prompts and pass criteria."
];

writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${outputPath.replace(`${repoRoot}/`, "")}`);
