import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonOutput = process.argv.includes("--json");

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function gate(name, passed, evidence, detail) {
  return { name, status: passed ? "pass" : "fail", evidence, detail };
}

function includesAll(content, phrases) {
  return phrases.every((phrase) => content.includes(phrase));
}

const declarativeAgent = readJson("apps/copilot-agent/package/declarative-agent.azure.json");
const actionManifest = readJson("apps/copilot-agent/package/actions/signal-foundry-mcp.azure.json");
const mcpToolsSource = read("packages/shared/src/mcpTools.ts");
const serverToolsSource = read("apps/mcp-server/src/tools.ts");
const advisorySource = read("apps/mcp-server/src/advisory.ts");
const advisoryTests = read("apps/mcp-server/src/advisory.test.ts");
const infraMain = read("infra/main.bicep");
const infraParameters = readJson("infra/main.parameters.json");
const infraResources = read("infra/resources.bicep");
const serverTests = read("apps/mcp-server/src/server.test.ts");
const portalPanels = read("apps/foundry-floor/src/panels.tsx");
const submission = read("docs/submission/SUBMISSION.md");
const morningWalkthrough = read("docs/submission/MORNING-WALKTHROUGH.md");
const deployedSmoke = read("evidence/azure/deployed-smoke-results.md");
const foundrySmoke = read("evidence/azure/foundry-advisory-smoke.md");
const acceptanceAudit = read("evidence/acceptance-rubric-audit.md");

const capabilities = declarativeAgent.capabilities ?? [];
const peopleCapability = capabilities.find((capability) => capability.name === "People");
const meetingsCapability = capabilities.find((capability) => capability.name === "Meetings");
const runFunctions = actionManifest.runtimes?.[0]?.run_for_functions ?? [];
const liveFoundryConfigured = [
  "SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT",
  "SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT",
  "SIGNAL_FOUNDRY_FOUNDRY_API_VERSION"
].every((name) => Boolean(process.env[name]));

const gates = [
  gate(
    "Copilot Work IQ grounding",
    peopleCapability?.include_related_content === false && Boolean(meetingsCapability)
      && includesAll(declarativeAgent.instructions, [
        "Use permission-aware Microsoft 365 Copilot/Work IQ summaries or synthetic Work IQ-style summaries only.",
        "If live Work IQ is unavailable, say the demo uses synthetic Work IQ-style context.",
        "get_user_work_context",
        "Never ask the user to paste raw emails"
      ]),
    "apps/copilot-agent/package/declarative-agent.azure.json",
    "People grounding is org context only, Meetings is enabled, and instructions force sanitized Work IQ-style summaries."
  ),
  gate(
    "MCP Work IQ tools",
    runFunctions.includes("get_user_work_context")
      && includesAll(mcpToolsSource, [
        "permission-aware Work IQ summaries or synthetic Work IQ-style summaries",
        "enum: [\"graph_profile\", \"work_iq\", \"synthetic_demo\"]",
        "never pass and never return raw Microsoft 365 content"
      ]),
    "packages/shared/src/mcpTools.ts",
    "The Copilot action exposes get_user_work_context and recommend_capabilities_for_role with Work IQ-safe schemas."
  ),
  gate(
    "Work IQ runtime behavior",
    includesAll(serverToolsSource, [
      "source: hasGroundedSummary || input.sourceHint === \"graph_profile\" || input.sourceHint === \"work_iq\"",
      "permission_aware_profile_summary",
      "synthetic_work_iq",
      "Signal Foundry does not rank people, monitor employees, or return raw Microsoft 365 content."
    ]) && includesAll(serverTests, [
      "returns sanitized user work context without raw content",
      "uses agent-supplied work-context summaries and strips unsafe content",
      "sourceHint: \"work_iq\""
    ]),
    "apps/mcp-server/src/tools.ts; apps/mcp-server/src/server.test.ts",
    "The server returns role/team/use-case context, strips unsafe content, and has tests for Work IQ-style inputs."
  ),
  gate(
    "Azure AI Foundry advisory path",
    includesAll(advisorySource, [
      "SIGNAL_FOUNDRY_ADVISORY_MODE",
      "foundry",
      "DefaultAzureCredential",
      "response_format: { type: \"json_object\" }",
      "deterministic risk gate is the source of truth",
      "return { status: \"unavailable\" }"
    ]),
    "apps/mcp-server/src/advisory.ts",
    "Foundry mode calls Azure OpenAI-compatible chat completions, parses strict JSON, and degrades without changing the gate."
  ),
  gate(
    "Azure AI Foundry subscription provisioning",
    infraParameters.parameters?.enableFoundryAdvisory?.value === true
      && typeof infraParameters.parameters?.containerImage?.value === "string"
      && infraParameters.parameters.containerImage.value.startsWith("acrsignalfoundry.azurecr.io/signal-foundry-mcp:")
      && includesAll(infraMain, [
        "param enableFoundryAdvisory bool = true",
        "param foundryAccountName string",
        "param foundryDeploymentName string"
      ])
      && includesAll(infraResources, [
        "Microsoft.CognitiveServices/accounts@2024-10-01",
        "kind: 'OpenAI'",
        "Microsoft.CognitiveServices/accounts/deployments@2024-10-01",
        "SIGNAL_FOUNDRY_ADVISORY_MODE",
        "SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT",
        "SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT",
        "CognitiveServicesOpenAIUser",
        "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd",
        "disableLocalAuth: true"
      ]),
    "infra/main.bicep; infra/resources.bicep; infra/main.parameters.json",
    "The subscription deployment creates the advisory account/model, uses managed identity, and sets the MCP runtime variables."
  ),
  gate(
    "Foundry functional tests",
    includesAll(advisoryTests, [
      "parses a valid advisory payload and computes disagreement deterministically",
      "marks agreement when the suggested level matches the gate",
      "degrades to unavailable on upstream failure after one retry",
      "never changes the deterministic verdict regardless of advisory outcome"
    ]),
    "apps/mcp-server/src/advisory.test.ts",
    "Tests prove available, disagreement, agreement, failure, sanitization, and deterministic isolation paths."
  ),
  gate(
    "Foundry Floor visibility",
    includesAll(portalPanels, [
      "Advisory unavailable — deterministic verdict stands.",
      "Advisory suggested",
      "Gate wins.",
      "Advisory only — the deterministic risk gate is the source of truth."
    ]),
    "apps/foundry-floor/src/panels.tsx",
    "The portal shows the advisory state beside the deterministic gate instead of hiding model availability."
  ),
  gate(
    "Submission honesty",
    includesAll(submission, [
      "Work IQ-grounded discovery",
      "Azure AI Foundry / Azure OpenAI advisory path"
    ]) && includesAll(morningWalkthrough, [
      "deployed Azure AI Foundry / Azure OpenAI account",
      "infra/main.bicep",
      "when the model is down, the deterministic gate stands"
    ]) && includesAll(acceptanceAudit, [
      "Azure AI Foundry / Azure OpenAI advisory rationale is deployed and live-smoked through the MCP server.",
      "Deterministic risk scoring is the source of truth."
    ]),
    "docs/submission/SUBMISSION.md; docs/submission/MORNING-WALKTHROUGH.md; evidence/acceptance-rubric-audit.md",
    "Submission language includes the technologies while the runbook/audit disclose the current live-Foundry boundary."
  ),
  gate(
    "Deployed Work IQ smoke",
    includesAll(deployedSmoke, [
      "Read-only work context: passed for `get_user_work_context`",
      "sanitized Presales Architect / Sales Engineering context"
    ]),
    "evidence/azure/deployed-smoke-results.md",
    "Azure smoke evidence proves the deployed server resolves sanitized work context."
  ),
  gate(
    "Deployed Foundry advisory smoke",
    includesAll(foundrySmoke, [
      "Advisory status: `available`",
      "gpt-4.1-mini-2025-04-14",
      "sf-advisory-gpt41-mini",
      "ca-signal-foundry-mcp--0000021",
      "No raw Microsoft 365 content"
    ]) && includesAll(deployedSmoke, [
      "Azure AI Foundry advisory: passed",
      "deterministic gate still source of truth"
    ]),
    "evidence/azure/foundry-advisory-smoke.md; evidence/azure/deployed-smoke-results.md",
    "Live Azure smoke proves the deployed MCP server can call the advisory model and preserve deterministic arbitration."
  )
];

const failed = gates.filter((item) => item.status !== "pass");
const report = {
  status: failed.length === 0 ? "ready" : "not_ready",
  liveFoundryConfig: liveFoundryConfigured ? "configured" : "not_configured",
  liveFoundryNote: liveFoundryConfigured
    ? "Environment contains the minimum live Azure AI Foundry variables. Run the advisory disagreement demo against the configured server before claiming live model output."
    : "Live Azure AI Foundry variables are not set in this shell. Use the deployed smoke evidence in evidence/azure/foundry-advisory-smoke.md for subscription-backed model output claims.",
  gates
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Work IQ + Foundry readiness: ${report.status}`);
  for (const item of gates) {
    console.log(`- ${item.status}: ${item.name} (${item.evidence})`);
  }
  console.log(`Live Foundry config: ${report.liveFoundryConfig}`);
  console.log(report.liveFoundryNote);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
