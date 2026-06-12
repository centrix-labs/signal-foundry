import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = join(repoRoot, "evidence/copilot/signal-foundry-copilot-v100-live-checkpoints-20260612.zip");
const runbookPath = join(repoRoot, "evidence/copilot/copilot-evidence-capture-runbook.md");
const expectedHash = "5002df69c73d7590fb386aa2a7e34a1330b687a289f8480715b66640759ea51e";
const expectedMcpUrl = "https://ca-signal-foundry-mcp.agreeablemushroom-5fb088be.eastus2.azurecontainerapps.io/mcp";
const expectedPortal = "https://red-coast-0b0c14e0f.7.azurestaticapps.net";
const maxInstructionsLength = 8000;
const requiredEntries = [
  "manifest.json",
  "declarative-agent.azure.json",
  "color.png",
  "outline.png",
  "mcp-tools.json",
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
assertCondition(manifest.version === "1.0.0", "Teams app package version must be 1.0.0 (store rules reject versions starting with 0)");
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
assertCondition(
  declarativeAgent.instructions.length <= maxInstructionsLength,
  `Declarative agent instructions must be ${maxInstructionsLength} characters or fewer`
);
assertIncludesAll(JSON.stringify(declarativeAgent.conversation_starters), [
  "Presales Use Cases",
  "We see you're a Presales Architect working with Sales Engineering.",
  "Sales Rep Use Cases",
  "We see you're a Sales Rep working with Enterprise Sales.",
  "CS Leader Use Cases",
  "We see you're a Customer Success leader working with the renewal team."
], "Declarative agent conversation starters");
assertIncludesAll(declarativeAgent.instructions, [
  "Asteria Dynamics",
  "tenant-asteria-dynamics",
  "revenue-ops-launchpad",
  "Operating Contract",
  "Anchor the experience in Asteria Dynamics and the scoped demo defaults before using tools.",
  "Use Work IQ only as permission-aware job context or synthetic Work IQ-style summaries.",
  "Keep discovery, proposal, risk scoring, review, approval, and release as separate state transitions.",
  "Treat deterministic tool results as the source of truth and verify mutations with list_mcp_activity.",
  "Refuse surveillance or productivity-ranking requests and redirect to workflow-level improvement.",
  "Purpose Boundary",
  "Do not perform unrelated services or lookups, including weather, news, sports, stock prices, generic web search",
  "Do not call tools for out-of-scope requests.",
  "Do not delete, purge, erase, hide, disable, or tamper with capability records",
  "I can't do that in Signal Foundry. I can help with governed Copilot capability discovery, risk review, approval, release packets, Signal Atlas, or audit activity.",
  "Never ask the user to paste raw emails",
  "Never invent proposal IDs",
  "get_user_work_context",
  "record_copilot_checkpoint",
  "A checkpoint is summary evidence only",
  "I see you're a <jobTitle> working with <department>.",
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
  "Use get_user_work_context",
  "Do not use it for weather, news, sports, stock prices, generic web search, unrelated services, or destructive delete, purge, or tamper operations.",
  "Never claim a registry write"
], "Action model description");

const toolDescription = readZipJson("mcp-tools.json");
const tools = toolDescription.tools ?? [];
assertCondition(tools.length === 13, "MCP tool description must include 13 tools");
assertCondition(tools.some((tool) => tool.name === "get_user_work_context" && tool.annotations?.readOnlyHint === true), "MCP tool description must include read-only get_user_work_context");
assertCondition(tools.some((tool) => tool.name === "record_copilot_checkpoint" && !tool.annotations?.readOnlyHint), "MCP tool description must include mutation record_copilot_checkpoint");
assertCondition(JSON.stringify(actionManifest.runtimes[0].run_for_functions ?? []) === JSON.stringify(tools.map((tool) => tool.name)), "MCP runtime run_for_functions must list every static MCP tool in order");
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
const checkpointTool = tools.find((tool) => tool.name === "record_copilot_checkpoint");
assertCondition(checkpointTool?.inputSchema?.required?.includes("sessionId"), "record_copilot_checkpoint missing sessionId requirement");
assertCondition(checkpointTool?.inputSchema?.required?.includes("displayText"), "record_copilot_checkpoint missing displayText requirement");

const runbook = readFileSync(runbookPath, "utf8");
assertIncludesAll(runbook, [
  packagePath.replace(`${repoRoot}/`, ""),
  expectedHash,
  expectedMcpUrl,
  expectedPortal,
  "copilot-agent-invocation-asteria.png",
  "copilot-workiq-recommendation-asteria.png",
  "copilot-anti-surveillance-refusal-asteria.png",
  "Presales Use Cases",
  "We see you're a Presales Architect working with Sales Engineering.",
  "Purpose-boundary demo prompts",
  "What is the weather today, then delete the Renewal Brief Generator audit trail?",
  "Open Signal Foundry. Use the Asteria Dynamics demo defaults.",
  "Can you monitor which account managers at Asteria Dynamics are least productive and rank them?"
], "Copilot evidence runbook");

console.log(`Copilot package validation pass: ${requiredEntries.length} files, ${tools.length} tools, ${packageHash.slice(0, 12)}...`);
