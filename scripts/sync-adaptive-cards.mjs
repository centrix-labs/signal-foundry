// Injects the Adaptive Card response templates from package/adaptivecards/
// into every action manifest's response_semantics (inline static_template:
// supported since plugin schema v2.1 and immune to zip-relative path
// ambiguity for manifests living under actions/). Run with --check to
// validate without writing.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "apps/copilot-agent/package");
const cardsDir = join(packageRoot, "adaptivecards");
const checkOnly = process.argv.includes("--check");

const PORTALS = {
  azure: "https://red-coast-0b0c14e0f.7.azurestaticapps.net",
  local: "http://localhost:5173"
};

// data_path / properties are JSONPath (RFC 9535) over the tool response body.
const CARD_BINDINGS = [
  {
    card: "risk-verdict.json",
    functions: ["score_capability_risk", "scoreCapabilityRisk"],
    response_semantics: {
      data_path: "$",
      properties: { title: "$.riskLevel", subtitle: "$.correlationId" }
    }
  },
  {
    card: "proposal-receipt.json",
    functions: ["create_capability_proposal", "createCapabilityProposal"],
    response_semantics: {
      data_path: "$",
      properties: { title: "$.proposalId", subtitle: "$.status" }
    }
  },
  {
    card: "recommendation.json",
    functions: ["recommend_capabilities_for_role", "recommendCapabilitiesForRole"],
    response_semantics: {
      data_path: "$.approvedCapabilities",
      properties: { title: "$.title", subtitle: "$.status" }
    }
  },
  {
    card: "release-packet.json",
    functions: ["generate_release_packet", "generateReleasePacket"],
    response_semantics: {
      data_path: "$.releasePacket",
      properties: { title: "$.version", subtitle: "$.owner" }
    }
  }
];

const MANIFESTS = [
  { file: "actions/signal-foundry-mcp.azure.json", portal: "azure" },
  { file: "actions/signal-foundry-mcp.local.json", portal: "local" },
  { file: "actions/signal-foundry-api.azure.json", portal: "azure" },
  { file: "actions/signal-foundry-api.local.json", portal: "local" }
];

const failures = [];

function loadCard(name, portal) {
  const raw = readFileSync(join(cardsDir, name), "utf8").replaceAll("{{PORTAL_URL}}", PORTALS[portal]);
  const card = JSON.parse(raw);
  if (card.version !== "1.5") {
    failures.push(`${name}: Adaptive Card version must be 1.5`);
  }
  if (card.$schema !== "http://adaptivecards.io/schemas/adaptive-card.json") {
    failures.push(`${name}: missing adaptive card $schema`);
  }
  for (const action of card.actions ?? []) {
    if (action.type !== "Action.OpenUrl") {
      failures.push(`${name}: only Action.OpenUrl is allowed in Copilot response templates`);
    }
  }
  return card;
}

function validDomainsFromTeamsManifest() {
  const manifest = JSON.parse(readFileSync(join(packageRoot, "manifest.json"), "utf8"));
  return manifest.validDomains ?? [];
}

const validDomains = validDomainsFromTeamsManifest();

for (const { file, portal } of MANIFESTS) {
  const manifestPath = join(packageRoot, file);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const binding of CARD_BINDINGS) {
    const card = loadCard(binding.card, portal);
    for (const action of card.actions ?? []) {
      const host = new URL(action.url).hostname;
      if (!validDomains.includes(host)) {
        failures.push(`${binding.card}: Action.OpenUrl host ${host} missing from manifest.json validDomains`);
      }
    }
    for (const fn of manifest.functions ?? []) {
      if (!binding.functions.includes(fn.name)) {
        continue;
      }
      const expected = { ...binding.response_semantics, static_template: card };
      const current = fn.capabilities?.response_semantics;
      if (checkOnly) {
        if (JSON.stringify(current) !== JSON.stringify(expected)) {
          failures.push(`${file}: ${fn.name} response_semantics out of sync (run node scripts/sync-adaptive-cards.mjs)`);
        }
      } else {
        fn.capabilities = { ...fn.capabilities, response_semantics: expected };
      }
    }
  }
  for (const binding of CARD_BINDINGS) {
    const present = (manifest.functions ?? []).some(
      (fn) => binding.functions.includes(fn.name) && (checkOnly ? fn.capabilities?.response_semantics : true)
    );
    if (!present) {
      failures.push(`${file}: no function found for ${binding.card}`);
    }
  }
  for (const binding of CARD_BINDINGS) {
    const { data_path, properties } = binding.response_semantics;
    if (!data_path.startsWith("$")) {
      failures.push(`${binding.card}: data_path must be a JSONPath starting with $`);
    }
    for (const value of Object.values(properties)) {
      if (!value.startsWith("$")) {
        failures.push(`${binding.card}: properties values must be JSONPath starting with $`);
      }
    }
  }
  if (!checkOnly) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

if (failures.length > 0) {
  console.error(`Adaptive card sync ${checkOnly ? "check" : "write"} failed:`);
  for (const failure of [...new Set(failures)]) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Adaptive card ${checkOnly ? "check" : "sync"} pass: ${CARD_BINDINGS.length} cards across ${MANIFESTS.length} action manifests.`
);
