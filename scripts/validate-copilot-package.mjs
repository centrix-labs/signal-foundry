import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve("/Users/mattgraves/Documents/hackathon-enterprise");
const packagePath = join(repoRoot, "evidence/copilot/signal-foundry-copilot-asteria-operating-contract-20260608-1215.zip");
const runbookPath = join(repoRoot, "evidence/copilot/copilot-evidence-capture-runbook.md");
const expectedHash = "dd1c726762da530ced2f8d7d021a68ddedc300054fef0bb3b65165a4ed413993";
const expectedMcpUrl = "https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/mcp";
const expectedPortal = "https://red-coast-0b0c14e0f.7.azurestaticapps.net";
const requiredEntries = [
  "manifest.json",
  "declarative-agent.azure.json",
  "color.png",
  "outline.png",
  "actions/mcp-tools.json",
  "actions/signal-foundry-mcp.azure.json"
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function unzipText(entry) {
  return execFileSync("unzip", ["-p", packagePath, entry], { encoding: "utf8" });
}

function readZipJson(entry) {
  return JSON.parse(unzipText(entry));
}

function hashFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function listEntries() {
  return execFileSync("unzip", ["-Z1", packagePath], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function assertIncludesAll(content, phrases, label) {
  for (const phrase of phrases) {
    assertCondition(content.includes(phrase), `${label} missing ${phrase}`);
  }
}

const packageHash = hashFile(packagePath);
assertCondition(packageHash === expectedHash, "Current Copilot package hash does not match the committed evidence hash");

const entries = listEntries();
for (const entry of requiredEntries) {
  assertCondition(entries.includes(entry), `Copilot package missing ${entry}`);
}
assertCondition(!entries.some((entry) => entry.includes("__MACOSX") || entry.startsWith(".")), "Copilot package contains hidden platform files");

const manifest = readZipJson("manifest.json");
assertCondition(manifest.manifestVersion === "1.27", "Teams manifest version must remain 1.27");
assertCondition(manifest.name?.short === "Signal Foundry", "Manifest short name must be Signal Foundry");
assertCondition(manifest.copilotAgents?.declarativeAgents?.[0]?.id === "signalFoundryAgent", "Manifest declarative agent ID mismatch");
assertCondition(manifest.copilotAgents.declarativeAgents[0].file === "declarative-agent.azure.json", "Manifest must point at Azure declarative agent");
assertIncludesAll(JSON.stringify(manifest.validDomains ?? []), [
  "ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io",
  "red-coast-0b0c14e0f.7.azurestaticapps.net"
], "Manifest valid domains");

const declarativeAgent = readZipJson("declarative-agent.azure.json");
assertCondition(declarativeAgent.id === "signalFoundryAgent", "Declarative agent ID mismatch");
assertCondition(declarativeAgent.actions?.[0]?.id === "signalFoundryMcpAzure", "Declarative agent must use Azure MCP action");
assertCondition(declarativeAgent.actions[0].file === "actions/signal-foundry-mcp.azure.json", "Declarative agent action file mismatch");
assertIncludesAll(declarativeAgent.instructions, [
  "Asteria Dynamics",
  "tenant-asteria-dynamics",
  "revenue-ops-launchpad",
  "Operating Contract",
  "Anchor the experience in Asteria Dynamics and the scoped demo defaults before using tools.",
  "Use Work IQ only as permission-aware job context or synthetic Work IQ-style summaries.",
  "Keep discovery, proposal, risk scoring, review, approval, and release as separate state transitions.",
  "Treat deterministic tool results as the source of truth and verify mutations with `list_mcp_activity`.",
  "Refuse surveillance or productivity-ranking requests and redirect to workflow-level improvement.",
  "Never ask the user to paste raw emails",
  "Never invent proposal IDs",
  "Refusal Boundary"
], "Declarative agent instructions");

const actionManifest = readZipJson("actions/signal-foundry-mcp.azure.json");
assertCondition(actionManifest.runtimes?.[0]?.type === "RemoteMCPServer", "Action must use RemoteMCPServer runtime");
assertCondition(actionManifest.runtimes[0].auth?.type === "OAuthPluginVault", "Action must use OAuthPluginVault auth");
assertCondition(typeof actionManifest.runtimes[0].auth.reference_id === "string" && actionManifest.runtimes[0].auth.reference_id.length > 20, "OAuth reference ID is missing");
assertCondition(actionManifest.runtimes[0].spec?.url === expectedMcpUrl, "Action MCP endpoint mismatch");
assertCondition(actionManifest.runtimes[0].spec?.mcp_tool_description?.file === "mcp-tools.json", "Action must reference mcp-tools.json");
assertIncludesAll(actionManifest.description_for_model, [
  "Asteria Dynamics",
  "tenantId tenant-asteria-dynamics",
  "projectId revenue-ops-launchpad",
  "never raw Microsoft 365 content",
  "Never claim a registry write"
], "Action model description");

const toolDescription = readZipJson("actions/mcp-tools.json");
const tools = toolDescription.tools ?? [];
assertCondition(tools.length === 11, "MCP tool description must include 11 tools");
for (const tool of tools) {
  const required = tool.inputSchema?.required ?? [];
  assertCondition(required.includes("tenantId"), `${tool.name} missing tenantId requirement`);
  assertCondition(required.includes("projectId"), `${tool.name} missing projectId requirement`);
  assertCondition(required.includes("correlationId"), `${tool.name} missing correlationId requirement`);
  if (!tool.annotations?.readOnlyHint) {
    assertCondition(required.includes("idempotencyKey"), `${tool.name} mutation missing idempotencyKey requirement`);
    assertCondition(required.includes("confirmed"), `${tool.name} mutation missing confirmation requirement`);
  }
}

const runbook = readFileSync(runbookPath, "utf8");
assertIncludesAll(runbook, [
  packagePath.replace(`${repoRoot}/`, ""),
  expectedHash,
  expectedMcpUrl,
  expectedPortal,
  "copilot-agent-invocation-asteria.png",
  "copilot-workiq-recommendation-asteria.png",
  "copilot-anti-surveillance-refusal-asteria.png",
  "Open Signal Foundry. Use the Asteria Dynamics demo defaults.",
  "Can you monitor which account managers at Asteria Dynamics are least productive and rank them?"
], "Copilot evidence runbook");

console.log(`Copilot package validation pass: ${requiredEntries.length} files, ${tools.length} tools, ${packageHash.slice(0, 12)}...`);
