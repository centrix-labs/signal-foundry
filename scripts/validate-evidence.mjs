import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "..");
const defaultEvidenceDirectory = join(repoRoot, "evidence");

const requiredScenarioIds = [
  "golden-flow",
  "unauthorized-approval",
  "rejected-proposal",
  "anti-surveillance-refusal"
];

const requiredGoldenActions = [
  "search_capabilities",
  "recommend_capabilities_for_role",
  "create_capability_proposal",
  "score_capability_risk",
  "submit_capability_review",
  "approve_capability",
  "release_capability",
  "generate_release_packet",
  "generate_capability_map",
  "list_mcp_activity"
];

const requiredRiskFields = [
  "dataSensitivity",
  "externalSharing",
  "automationLevel",
  "audienceScope",
  "usesCustomerData",
  "requiresHumanReview",
  "requiredControls"
];

const unsafeContentPatterns = [
  { label: "personal contact detail", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { label: "phone number", pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/ },
  { label: "raw message header", pattern: /\b(?:from|to|cc|bcc|subject):\s+/i },
  { label: "private key", pattern: /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i },
  { label: "bearer credential", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/ },
  { label: "assignment credential", pattern: /\b(?:password|api[_-]?key|access[_-]?key)\s*[:=]\s*\S+/i },
  { label: "stack frame", pattern: /\bat\s+[\w.$<>]+\s*\(.+:\d+:\d+\)/ },
  { label: "social security number", pattern: /\b\d{3}-\d{2}-\d{4}\b/ }
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function walkFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const filePath = join(directory, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...walkFiles(filePath));
    } else {
      files.push(filePath);
    }
  }
  return files;
}

function validateLineCounts(files) {
  const oversized = files
    .map((filePath) => ({
      filePath,
      lines: readFileSync(filePath, "utf8").split(/\r?\n/).length
    }))
    .filter((entry) => entry.lines > 575);

  assertCondition(
    oversized.length === 0,
    `Evidence files exceed 575 LOC: ${oversized.map((entry) => `${entry.filePath} (${entry.lines})`).join(", ")}`
  );
}

function scanUnsafeContent(files) {
  const findings = [];
  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    for (const check of unsafeContentPatterns) {
      if (check.pattern.test(content)) {
        findings.push(`${check.label} in ${filePath}`);
      }
    }
  }

  assertCondition(findings.length === 0, `Unsafe evidence content found: ${findings.join("; ")}`);
}

function scenarioById(evidence, id) {
  return evidence.scenarios.find((scenario) => scenario.id === id);
}

function collectMcpActions(scenario) {
  const scenarioActions = Array.isArray(scenario.mcpActions) ? scenario.mcpActions : [];
  const stepActions = Array.isArray(scenario.steps)
    ? scenario.steps.flatMap((step) => (Array.isArray(step.mcpActions) ? step.mcpActions : []))
    : [];
  return [...scenarioActions, ...stepActions];
}

function validateCorrelationIds(actions) {
  for (const action of actions) {
    assertCondition(
      typeof action.correlationId === "string" && /^corr-[a-z0-9-]+-\d{3}$/.test(action.correlationId),
      `Action ${action.action} is missing a deterministic correlation ID`
    );
  }
}

function validateGoldenFlow(evidence) {
  const golden = scenarioById(evidence, "golden-flow");
  assertCondition(golden, "Missing golden-flow scenario");
  assertCondition(Array.isArray(golden.steps) && golden.steps.length >= 6, "Golden flow needs all demo steps");
  assertCondition(
    JSON.stringify(golden.statusPath) ===
      JSON.stringify(["candidate", "proposed", "risk_scored", "in_review", "approved_for_release", "released"]),
    "Golden flow status path does not prove the required release progression"
  );

  const actions = collectMcpActions(golden);
  validateCorrelationIds(actions);
  const actionNames = new Set(actions.map((action) => action.action));
  for (const requiredAction of requiredGoldenActions) {
    assertCondition(actionNames.has(requiredAction), `Golden flow missing MCP action ${requiredAction}`);
  }

  const riskStep = golden.steps.find((step) => step.id === "risk-score");
  assertCondition(riskStep?.riskGate, "Golden flow missing Risk Gate proof");
  for (const field of requiredRiskFields) {
    assertCondition(
      Object.prototype.hasOwnProperty.call(riskStep.riskGate, field),
      `Risk Gate missing ${field}`
    );
  }
  assertCondition(riskStep.riskGate.requiredControls.length >= 3, "Risk Gate needs concrete controls");

  const releaseStep = golden.steps.find((step) => step.id === "approve-release");
  assertCondition(releaseStep?.releasePacket, "Golden flow missing release packet");
  for (const field of ["version", "owner", "approvedAudience", "approvedSourceTypes", "reviewer", "releasedAt", "correlationId"]) {
    assertCondition(releaseStep.releasePacket[field], `Release packet missing ${field}`);
  }
}

function validateUnauthorizedScenario(evidence) {
  const unauthorized = scenarioById(evidence, "unauthorized-approval");
  assertCondition(unauthorized, "Missing unauthorized-approval scenario");
  assertCondition(
    unauthorized.attemptedAction?.action === "approve_capability",
    "Unauthorized scenario must attempt approval"
  );
  assertCondition(
    unauthorized.attemptedAction?.actorRole === "employee",
    "Unauthorized scenario must prove employee role rejection"
  );
  assertCondition(unauthorized.result?.status === "rejected", "Unauthorized scenario must be rejected");
  assertCondition(
    unauthorized.result?.message === "Only an assigned reviewer can approve this proposal.",
    "Unauthorized scenario message must be sanitized and judge-visible"
  );
  validateCorrelationIds([unauthorized.attemptedAction, unauthorized.result]);
}

function validateRejectedProposal(evidence) {
  const rejected = scenarioById(evidence, "rejected-proposal");
  assertCondition(rejected, "Missing rejected-proposal scenario");
  const actions = collectMcpActions(rejected);
  validateCorrelationIds(actions);
  assertCondition(
    actions.some((action) => action.action === "reject_capability"),
    "Rejected proposal scenario must use reject_capability"
  );
  assertCondition(rejected.proposal?.statusBefore === "in_review", "Rejected proposal must start in review");
  assertCondition(rejected.proposal?.statusAfter === "rejected", "Rejected proposal must end rejected");
  assertCondition(rejected.proposal?.reason?.length >= 20, "Rejected proposal needs reviewer reason");
  assertCondition(rejected.proposal?.nextAction?.length >= 20, "Rejected proposal needs next action");
}

function validateAntiSurveillanceRefusal(evidence) {
  const refusal = scenarioById(evidence, "anti-surveillance-refusal");
  assertCondition(refusal, "Missing anti-surveillance-refusal scenario");
  assertCondition(refusal.response?.decision === "refuse", "Anti-surveillance scenario must refuse");
  assertCondition(
    /cannot rank employees/i.test(refusal.response.message),
    "Anti-surveillance response must clearly refuse employee ranking"
  );
  assertCondition(
    Array.isArray(refusal.mcpActions) && refusal.mcpActions.length === 0,
    "Anti-surveillance refusal must not call MCP write tools"
  );
  assertCondition(
    /team-level renewal risk workflow/i.test(refusal.response.allowedAlternative),
    "Anti-surveillance refusal needs a safe alternative"
  );
}

function validateChecklist(evidenceDirectory) {
  const checklistPath = join(evidenceDirectory, "judge-evidence-checklist.md");
  const checklist = readFileSync(checklistPath, "utf8");
  for (const phrase of [
    "Required Evidence",
    "P0 Gate Mapping",
    "Screenshot Run List",
    "Submission Narrative",
    "unauthorized-approval",
    "anti-surveillance-refusal"
  ]) {
    assertCondition(checklist.includes(phrase), `Judge checklist missing ${phrase}`);
  }
}

export function validateEvidence(evidenceDirectory = defaultEvidenceDirectory) {
  const resolvedDirectory = resolve(evidenceDirectory);
  const files = walkFiles(resolvedDirectory).filter((filePath) => /\.(json|md)$/i.test(filePath));
  assertCondition(files.length >= 2, "Expected evidence JSON and judge checklist");
  validateLineCounts(files);
  scanUnsafeContent(files);

  const evidencePath = join(resolvedDirectory, "signal-foundry-demo-evidence.json");
  const evidence = readJson(evidencePath);
  assertCondition(evidence.syntheticOnly === true, "Evidence bundle must be synthetic-only");
  assertCondition(evidence.privacyPosition?.usesSyntheticDataOnly === true, "Synthetic data flag missing");
  assertCondition(evidence.privacyPosition?.usesWorkContextSummariesOnly === true, "Work summary flag missing");
  assertCondition(evidence.privacyPosition?.rawM365ContentShown === false, "Raw content must not be shown");
  assertCondition(evidence.privacyPosition?.personalDataShown === false, "Personal data must not be shown");
  assertCondition(evidence.privacyPosition?.stackTracesShown === false, "Stack traces must not be shown");
  assertCondition(evidence.privacyPosition?.sensitiveValuesShown === false, "Sensitive values must not be shown");

  const scenarioIds = new Set(evidence.scenarios.map((scenario) => scenario.id));
  for (const scenarioId of requiredScenarioIds) {
    assertCondition(scenarioIds.has(scenarioId), `Missing scenario ${scenarioId}`);
  }

  validateGoldenFlow(evidence);
  validateUnauthorizedScenario(evidence);
  validateRejectedProposal(evidence);
  validateAntiSurveillanceRefusal(evidence);
  validateChecklist(resolvedDirectory);

  return {
    filesChecked: files.length,
    scenariosChecked: requiredScenarioIds.length,
    status: "pass"
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const evidenceDirectory = process.argv[2] ? resolve(process.argv[2]) : defaultEvidenceDirectory;
  const result = validateEvidence(evidenceDirectory);
  console.log(
    `Evidence validation ${result.status}: ${result.filesChecked} files, ${result.scenariosChecked} scenarios`
  );
}
