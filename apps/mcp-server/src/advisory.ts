import type { AdvisoryRiskAnalysis, AdvisoryRiskStep, RiskLevel } from "@signal-foundry/shared";

const ADVISORY_TIMEOUT_MS = 6000;
const MAX_OUTPUT_TOKENS = 800;
const MAX_SUMMARY_LENGTH = 600;
const MAX_FIELD_LENGTH = 200;
const MAX_CRITIQUE_LENGTH = 400;
const MAX_STEPS = 5;
const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "blocked"];

const UNSAFE_PATTERNS = [
  /bearer\s+[a-z0-9._~+/=-]{8,}/gi,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  /(api[-_]?key|client[-_]?secret|password|connectionstring)[=:]\S+/gi,
  /eyJ[a-zA-Z0-9._-]{20,}/g
];

export interface AdvisoryProposalSummary {
  title: string;
  description: string;
  role: string;
  department: string;
}

export interface AdvisoryDeterministicResult {
  riskLevel: RiskLevel;
  requiredControls: string[];
}

export interface AdvisoryRiskInput {
  dataSensitivity: RiskLevel;
  externalSharing: RiskLevel;
  automationLevel: string;
  audienceScope: string;
  usesCustomerData: boolean;
  requiresHumanReview: boolean;
}

interface AdvisoryConfig {
  endpoint: string;
  deployment: string;
  apiVersion: string;
  apiKey?: string;
}

export function advisoryEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env["SIGNAL_FOUNDRY_ADVISORY_MODE"] === "foundry";
}

export function selfCritiqueEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env["SIGNAL_FOUNDRY_ADVISORY_SELF_CRITIQUE"] === "on";
}

function loadConfig(env: NodeJS.ProcessEnv): AdvisoryConfig | undefined {
  const endpoint = env["SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT"];
  const deployment = env["SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT"];
  const apiVersion = env["SIGNAL_FOUNDRY_FOUNDRY_API_VERSION"];
  if (!endpoint || !deployment || !apiVersion) {
    return undefined;
  }
  return { endpoint, deployment, apiVersion, apiKey: env["SIGNAL_FOUNDRY_FOUNDRY_API_KEY"] };
}

export function sanitizeAdvisoryText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }
  let text = value.replace(/\s+/g, " ").trim();
  for (const pattern of UNSAFE_PATTERNS) {
    text = text.replace(pattern, "[redacted]");
  }
  return text.slice(0, maxLength);
}

export function computeAgreement(suggested: RiskLevel | undefined, deterministic: RiskLevel): boolean | undefined {
  if (!suggested) {
    return undefined;
  }
  return suggested === deterministic;
}

function parseAdvisoryPayload(raw: string, deterministicLevel: RiskLevel, model: string): AdvisoryRiskAnalysis {
  const parsed = JSON.parse(raw) as {
    summary?: unknown;
    steps?: Array<Record<string, unknown>>;
    suggestedRiskLevel?: unknown;
    critique?: unknown;
  };
  const steps: AdvisoryRiskStep[] = (Array.isArray(parsed.steps) ? parsed.steps : [])
    .slice(0, MAX_STEPS)
    .map((step) => ({
      signal: sanitizeAdvisoryText(step["signal"], MAX_FIELD_LENGTH),
      concern: sanitizeAdvisoryText(step["concern"], MAX_FIELD_LENGTH),
      suggestedControl: sanitizeAdvisoryText(step["suggestedControl"], MAX_FIELD_LENGTH)
    }))
    .filter((step) => step.signal && step.concern);
  const suggested = RISK_LEVELS.includes(parsed.suggestedRiskLevel as RiskLevel)
    ? (parsed.suggestedRiskLevel as RiskLevel)
    : undefined;
  const critique = sanitizeAdvisoryText(parsed.critique, MAX_CRITIQUE_LENGTH);
  return {
    status: "available",
    model,
    summary: sanitizeAdvisoryText(parsed.summary, MAX_SUMMARY_LENGTH),
    steps,
    suggestedRiskLevel: suggested,
    agreesWithGate: computeAgreement(suggested, deterministicLevel),
    ...(critique ? { selfCritique: critique } : {}),
    generatedAt: new Date().toISOString()
  };
}

async function resolveAuthHeader(config: AdvisoryConfig): Promise<Record<string, string>> {
  if (config.apiKey) {
    return { "api-key": config.apiKey };
  }
  const { DefaultAzureCredential } = await import("@azure/identity");
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken("https://cognitiveservices.azure.com/.default");
  return { Authorization: `Bearer ${token.token}` };
}

const SYSTEM_PROMPT = [
  "You are an advisory AI risk analyst for governed Copilot capability proposals.",
  "Your analysis is advisory only; a deterministic risk gate is the source of truth.",
  "Respond with strict JSON: {\"summary\": string, \"steps\": [{\"signal\": string, \"concern\": string, \"suggestedControl\": string}], \"suggestedRiskLevel\": \"low\"|\"medium\"|\"high\"|\"blocked\"}.",
  "At most 5 steps. Be specific about which input signal drives each concern.",
  "Never include personal data, credentials, or content beyond the provided fields."
].join(" ");

const CRITIQUE_SYSTEM_PROMPT = [
  "You are the same advisory AI risk analyst, now critiquing your own draft analysis.",
  "Your analysis remains advisory only; a deterministic risk gate is the source of truth.",
  "Review the draft for a missed input signal, an over- or under-stated concern, or a weak or missing suggested control, then produce a revised analysis.",
  "Respond with strict JSON in the SAME shape plus a \"critique\" field: {\"summary\": string, \"steps\": [{\"signal\": string, \"concern\": string, \"suggestedControl\": string}], \"suggestedRiskLevel\": \"low\"|\"medium\"|\"high\"|\"blocked\", \"critique\": string}.",
  "The \"critique\" field is one sentence describing what you changed and why. At most 5 steps.",
  "Never include personal data, credentials, or content beyond the provided fields."
].join(" ");

interface AdvisoryMessage {
  role: "system" | "user";
  content: string;
}

function buildDraftMessages(
  proposal: AdvisoryProposalSummary,
  riskInput: AdvisoryRiskInput,
  deterministic: AdvisoryDeterministicResult
): AdvisoryMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        proposal,
        riskInputs: riskInput,
        deterministicVerdict: deterministic.riskLevel,
        deterministicControls: deterministic.requiredControls
      })
    }
  ];
}

function buildCritiqueMessages(
  proposal: AdvisoryProposalSummary,
  riskInput: AdvisoryRiskInput,
  deterministic: AdvisoryDeterministicResult,
  draft: AdvisoryRiskAnalysis
): AdvisoryMessage[] {
  return [
    { role: "system", content: CRITIQUE_SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        proposal,
        riskInputs: riskInput,
        deterministicVerdict: deterministic.riskLevel,
        deterministicControls: deterministic.requiredControls,
        draftAnalysis: {
          summary: draft.summary,
          steps: draft.steps,
          suggestedRiskLevel: draft.suggestedRiskLevel
        }
      })
    }
  ];
}

async function callFoundry(
  config: AdvisoryConfig,
  deterministic: AdvisoryDeterministicResult,
  messages: AdvisoryMessage[],
  fetchImpl: typeof fetch
): Promise<AdvisoryRiskAnalysis> {
  const url = `${config.endpoint.replace(/\/$/, "")}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADVISORY_TIMEOUT_MS);
  try {
    const headers = { "Content-Type": "application/json", ...(await resolveAuthHeader(config)) };
    const response = await fetchImpl(url, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        temperature: 0.1,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: "json_object" },
        messages
      })
    });
    if (!response.ok) {
      throw new Error(`advisory upstream status ${response.status}`);
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("advisory upstream returned empty content");
    }
    return parseAdvisoryPayload(content, deterministic.riskLevel, payload.model ?? config.deployment);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAdvisoryRiskAnalysis(
  proposal: AdvisoryProposalSummary,
  riskInput: AdvisoryRiskInput,
  deterministic: AdvisoryDeterministicResult,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch
): Promise<AdvisoryRiskAnalysis> {
  if (!advisoryEnabled(env)) {
    return { status: "unavailable" };
  }
  const config = loadConfig(env);
  if (!config) {
    return { status: "unavailable" };
  }
  // Draft pass: one initial attempt plus at most one retry; failures degrade, never throw.
  let draft: AdvisoryRiskAnalysis | undefined;
  const draftMessages = buildDraftMessages(proposal, riskInput, deterministic);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      draft = await callFoundry(config, deterministic, draftMessages, fetchImpl);
      break;
    } catch {
      // retry once, then degrade
    }
  }
  if (!draft) {
    return { status: "unavailable" };
  }
  if (!selfCritiqueEnabled(env)) {
    return draft;
  }
  // Self-critique pass: a single best-effort revise call. On any failure or
  // malformed payload we fall back to the still-valid draft, never to unavailable.
  try {
    const critiqueMessages = buildCritiqueMessages(proposal, riskInput, deterministic, draft);
    const revised = await callFoundry(config, deterministic, critiqueMessages, fetchImpl);
    return revised;
  } catch {
    return draft;
  }
}
