const concepts = {
  floor: { title: "Foundry Floor", render: renderFloor },
  atlas: { title: "Signal Atlas", render: renderAtlas },
  review: { title: "Review Queue", render: renderReview },
  copilot: { title: "Copilot Mirror", render: renderCopilot },
  light: { title: "Light Executive", render: renderLight },
};

const stages = ["Ingest", "Process", "Enrich", "Risk Gate", "Approve", "Release", "Monitor"];
const queue = [
  ["Renewal Risk Summarizer", "Customer Success", "Low", "6m ago"],
  ["Invoice Exception Investigator", "Finance Ops", "Medium", "18m ago"],
  ["Supplier Onboarding Copilot", "Procurement", "High", "41m ago"],
  ["Escalation Draft Assistant", "Support", "Low", "1h ago"],
  ["Contract Risk Review", "Legal", "Medium", "2h ago"],
];
const mcp = [
  ["09:41:02", "Graph Connector", "312 files scanned", "Success"],
  ["09:41:04", "ServiceNow Connector", "85 records retrieved", "Success"],
  ["09:41:06", "Teams Connector", "523 messages summarized", "Success"],
  ["09:41:08", "Risk Engine", "18 checks evaluated", "Warning"],
  ["09:41:10", "Release Registry", "Packet v0.8.0 staged", "Success"],
];

let commandState = {
  concept: new URLSearchParams(location.search).get("concept") || "floor",
  step: Number(new URLSearchParams(location.search).get("step") || 0),
};

const screen = document.querySelector("#concept-screen");
const heading = document.querySelector("#concept-title");
const conceptButtons = [...document.querySelectorAll(".screen-button")];
const storyButtons = [...document.querySelectorAll(".story-step")];

document.querySelector("#advance-step").addEventListener("click", () => {
  commandState.step = Math.min(3, commandState.step + 1);
  render();
});

document.querySelector("#reset-step").addEventListener("click", () => {
  commandState.step = 0;
  render();
});

conceptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    commandState.concept = button.dataset.concept;
    commandState.step = Math.min(commandState.step, 3);
    render();
  });
});

storyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    commandState.step = Number(button.dataset.step);
    render();
  });
});

function render() {
  const concept = concepts[commandState.concept] || concepts.floor;
  heading.textContent = concept.title;
  screen.innerHTML = concept.render(commandState.step);
  conceptButtons.forEach((button) => button.classList.toggle("active", button.dataset.concept === commandState.concept));
  storyButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.step) === commandState.step));
  const url = new URL(location);
  url.searchParams.set("concept", commandState.concept);
  url.searchParams.set("step", commandState.step);
  history.replaceState({}, "", url);
}

function renderFloor(step) {
  return `
    <div class="ops-grid">
      <section class="pipeline-board">
        <div class="section-head"><div><p class="eyebrow">Release pipeline</p><h2>End-to-end visibility from signal to production</h2></div><span class="live">Live</span></div>
        <div class="kanban">${stages.map((stage, i) => lane(stage, i, step)).join("")}</div>
        <div class="trace-line">${dotRow(24, step)}</div>
      </section>
      <aside class="activity-rail">${activityRail()}</aside>
      <section class="atlas-card">${atlasMap(step, true)}</section>
      <section class="risk-console">${riskConsole(step)}</section>
      <section class="release-pack">${releasePack()}</section>
    </div>`;
}

function renderAtlas(step) {
  return `
    <div class="atlas-screen">
      <section class="atlas-main">${atlasMap(step, false)}</section>
      <aside class="atlas-side">${riskGauge()}${releasePack()}${activityRail()}</aside>
      <footer class="release-progress">${stageRail(step)}</footer>
    </div>`;
}

function renderReview(step) {
  return `
    <div class="review-screen">
      <section class="review-list"><div class="section-head"><div><p class="eyebrow">Review queue</p><h2>Approve AI workflows with confidence</h2></div><span class="pill amber">12 waiting</span></div>${queue.map((item, i) => queueCard(item, i)).join("")}</section>
      <section class="review-detail">${riskChecklist()}${releaseSummary()}</section>
      <aside class="activity-rail">${activityRail()}</aside>
      <footer class="approval-bar"><button>Request Changes</button><button>Save for Later</button><button class="approve">Approve & Release</button></footer>
    </div>`;
}

function renderCopilot(step) {
  return `
    <div class="copilot-screen">
      <section class="chat-pane">
        <div class="copilot-head">Copilot <span>Enterprise mode</span></div>
        ${bubble("user", "Review the renewal escalation workflow and show the proposed process with risk and compliance checks.")}
        ${bubble("ai", "I analyzed 1,246 signals across email, Teams, ServiceNow, SharePoint, and CRM. Here is the proposed workflow with risk gates and evidence packet.")}
        <div class="workflow-card">${workflowLine()}</div>
        ${bubble("user", "Looks good. What are the high-risk items?")}
        ${bubble("ai", "Three risk signals need review: external sharing, incomplete DPA evidence, and role-based approval coverage.")}
        <div class="prompt-box">Message Copilot</div>
      </section>
      <section class="mirror-pane">
        <div class="mirror-tabs"><strong>Signal Foundry</strong><span>Mirror</span><span>Workflows</span><span>MCP trace</span><span>Releases</span></div>
        <div class="mirror-grid">${metric("1,246", "signals analyzed")}${metric("92%", "workflow confidence")}${metric("3.2 days", "est. time to value")}</div>
        <div class="proposed">${workflowLine()}</div>
        <div class="two-col">${activityRail()}${riskConsole(step)}</div>
        <div class="evidence-row">${["Policy checks 12/12", "Data lineage 8/8", "Access review 5/5", "Test results 24/24"].map((x) => `<span>${x}</span>`).join("")}</div>
      </section>
    </div>`;
}

function renderLight(step) {
  return `
    <div class="light-screen">
      <section class="light-atlas">${atlasMap(step, true)}</section>
      <section class="light-stack">${stageRail(step)}${riskConsole(step)}${releasePack()}</section>
      <section class="light-table"><div class="section-head"><div><p class="eyebrow">MCP activity rail</p><h2>Audit-safe record of model, connector, and policy activity</h2></div><span class="live">Live</span></div>${activityTable()}</section>
    </div>`;
}

function lane(stage, i, step) {
  const active = i <= step + 2 ? "active" : "";
  const risk = stage === "Risk Gate" ? "risk" : "";
  const cards = ["Email signals", "CRM renewal data", "Support tickets"].slice(0, Math.min(2, i % 3 + 1));
  return `<article class="lane ${active} ${risk}"><h3>${String(i + 1).padStart(2, "0")} ${stage}</h3>${cards.map((c) => `<div class="lane-card"><strong>${c}</strong><span>${i * 327 + 842} items</span></div>`).join("")}</article>`;
}

function atlasMap(step, compact) {
  const streams = [["Meetings", "1.2M /day"], ["Email", "3.8M /day"], ["Chat", "2.4M /day"], ["Documents", "6.7M /day"], ["Tickets", "1.1M /day"], ["CRM", "980K /day"], ["Code", "620K /day"], ["Finance", "380K /day"]];
  const roles = [
    ["Account Manager", "4,847 signals", 29, 22],
    ["Solutions Architect", "3,976 signals", 38, 31],
    ["Support Agent", "2,118 signals", 55, 24],
    ["Product Manager", "5,210 signals", 28, 49],
    ["QA Engineer", "2,777 signals", 36, 63],
    ["Dev Engineer", "4,105 signals", 49, 49],
    ["Finance Analyst", "1,105 signals", 61, 70],
    ["HR Partner", "543 signals", 67, 79],
  ];
  const workflows = ["Customer Insight Brief", "Incident Triage Copilot", "Contract Risk Review", "Code Change Advisor", "Budget Variance Analyst", "New Hire Onboarding"];
  const visibleRoles = roles.slice(0, compact ? 5 : roles.length);
  const visibleWorkflows = workflows.slice(0, compact ? 4 : workflows.length);
  return `<div class="atlas-map ${compact ? "compact" : ""}">
    <div class="section-head atlas-head"><div><p class="eyebrow">Signal Atlas</p><h2>Live map of work signals and forged AI workflows</h2></div><span class="pill">92 healthy</span></div>
    <div class="atlas-toolbar"><span>Live</span><span>All Domains</span><span>All Risk Levels</span><span>Reset View</span></div>
    <div class="signal-streams"><p class="eyebrow">Signal streams</p>${streams.map(([name, count]) => `<div><span>${name}</span><strong>${count}</strong></div>`).join("")}</div>
    <div class="mesh-field">${dotRow(84, step)}</div>
    <svg class="atlas-svg" viewBox="0 0 1120 520" role="img" aria-label="Animated Signal Foundry relationship map">
      <defs>
        <filter id="atlasGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="tealDot" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5"><circle cx="2.5" cy="2.5" r="2.5" fill="#00d1c2"/></marker>
      </defs>
      ${visibleRoles.map((_, i) => path(i, false)).join("")}
      ${visibleWorkflows.map((_, i) => path(i, true)).join("")}
      ${visibleWorkflows.map((_, i) => riskGate(i)).join("")}
      <polygon points="565,184 636,225 636,306 565,347 494,306 494,225" class="core" filter="url(#atlasGlow)"></polygon>
      <text x="565" y="274" text-anchor="middle" class="core-text">SF</text>
    </svg>
    ${visibleRoles.map(([name, count, left, top], i) => node(name, count, left, top, i)).join("")}
    <div class="forge-caption"><strong>Signal Foundry</strong><span>Forge. Verify. Release.</span></div>
    <div class="domain-label product">Product & Engineering</div><div class="domain-label customer">Customer Engagement</div><div class="domain-label ops">Operations</div><div class="domain-label corp">Corporate Services</div>
    <div class="workflow-stack"><p class="eyebrow">Approved workflows</p>${visibleWorkflows.map((name, i) => approvedCard(name, i)).join("")}</div>
    <div class="atlas-legend"><span>Signal Flow</span><span>Approval Path</span><span>Risk Gate</span><span>Role / Capability</span><span>External System</span></div>
  </div>`;
}

function path(i, approved) {
  if (approved) {
    const y = 124 + i * 62;
    return `<path class="approval flow-line d${i}" d="M636 266 C720 ${220 + i * 14}, 760 ${y}, 862 ${y}"></path>`;
  }
  const starts = [[335, 126], [420, 170], [470, 130], [330, 278], [405, 345], [493, 284], [585, 382], [650, 430]];
  const [x, y] = starts[i];
  return `<path class="signal flow-line d${i}" d="M${x} ${y} C430 ${y - 8}, 454 258, 494 266"></path>`;
}

function node(name, count, left, top, i) {
  return `<article class="role-node n${i}" style="left:${left}%;top:${top}%"><strong>${name}</strong><span>${count}</span></article>`;
}

function riskGate(i) {
  const y = 124 + i * 62;
  return `<g class="risk-gate rg${i}"><circle cx="800" cy="${y}" r="14"></circle><text x="800" y="${y + 5}" text-anchor="middle">!</text></g>`;
}

function approvedCard(name, i) {
  return `<article class="approved-card"><span>${String(i + 1).padStart(2, "0")}</span><div><strong>${name}</strong><em>v${i + 1}.0.${i + 3} / Production</em></div><b></b></article>`;
}

function riskConsole(step) {
  const rows = [["PII exposure", "Review"], ["Prompt injection", step > 1 ? "Pass" : "Review"], ["Data residency", "Pass"], ["Human approval", "Pass"]];
  return `<div class="panel"><div class="section-head"><div><p class="eyebrow">Risk gate console</p><h2>${step > 1 ? "16 passed, 2 warning" : "3 require attention"}</h2></div><span class="pill amber">Policy set</span></div>${rows.map(([a, b]) => `<div class="risk-row"><span>${a}</span><strong>${b}</strong></div>`).join("")}</div>`;
}

function activityRail() {
  return `<div class="panel activity"><div class="section-head"><div><p class="eyebrow">MCP activity</p><h2>Live trace</h2></div><span class="live">Live</span></div>${mcp.map(([t, tool, action, status]) => `<div class="activity-row"><time>${t}</time><div><strong>${tool}</strong><span>${action}</span></div><em class="${status.toLowerCase()}">${status}</em></div>`).join("")}</div>`;
}

function releasePack() {
  return `<div class="panel"><p class="eyebrow">Release packet</p><h2>Renewal Productivity Pack</h2>${["Workflow spec", "Risk assessment", "Test plan", "Data flow diagram", "Runbook"].map((x) => `<div class="artifact"><span>${x}</span><strong>Ready</strong></div>`).join("")}</div>`;
}

function riskChecklist() {
  return `<div class="panel"><div class="section-head"><div><p class="eyebrow">Risk gate checklist</p><h2>8 of 8 required controls</h2></div><span class="pill">8/8</span></div>${["Data classification verified", "PII handling compliant", "Access controls validated", "Prompt injection tested", "Grounding sources verified", "Policy aligned", "Human review confirmed", "Abuse monitoring enabled"].map((x) => `<div class="check-row"><span></span>${x}<a>View</a></div>`).join("")}</div>`;
}

function releaseSummary() {
  return `<div class="panel summary"><p class="eyebrow">Release packet summary</p><h2>Supplier Onboarding Copilot</h2><dl><dt>Owner</dt><dd>Maya Kapoor</dd><dt>Business unit</dt><dd>Procurement</dd><dt>Artifacts</dt><dd>12</dd><dt>Change summary</dt><dd>Improved supplier matching and exception routing.</dd></dl></div>`;
}

function queueCard([name, team, risk, time], i) {
  return `<article class="queue-card ${i === 0 ? "selected" : ""}"><div class="icon">${i + 1}</div><div><strong>${name}</strong><span>${team} / ${risk} Risk</span></div><time>${time}</time></article>`;
}

function stageRail(step) {
  return `<div class="stage-rail">${stages.slice(0, 6).map((s, i) => `<div class="${i <= step + 1 ? "done" : ""}"><span>${i + 1}</span><strong>${s}</strong></div>`).join("")}</div>`;
}

function workflowLine() {
  return `<div class="workflow-line">${["Intake", "Screen", "Assess", "Approve", "Onboard"].map((x, i) => `<span class="${i === 2 ? "risk" : ""}">${x}</span>`).join("")}</div>`;
}

function bubble(type, text) {
  return `<div class="bubble ${type}">${text}</div>`;
}

function metric(value, label) {
  return `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`;
}

function dotRow(count, step) {
  return Array.from({ length: count }, (_, i) => `<span class="${i % 7 === step + 2 ? "hot" : ""}"></span>`).join("");
}

function riskGauge() {
  return `<div class="panel gauge"><strong>92</strong><span>System health</span><small>Pass 92% / Review 6% / Fail 2%</small></div>`;
}

function activityTable() {
  return `<table><tbody>${mcp.map(([t, tool, action, status]) => `<tr><td>${t}</td><td>${tool}</td><td>${action}</td><td>${status}</td><td>corr-${t.replaceAll(":", "")}</td></tr>`).join("")}</tbody></table>`;
}

render();
