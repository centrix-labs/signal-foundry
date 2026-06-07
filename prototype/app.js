const versions = {
  copilot: {
    title: "Copilot Native Flow",
    screens: [renderCopilotAsk, renderCopilotAnalyze, renderCopilotConfirm, renderCopilotGovern],
  },
  command: {
    title: "Executive Command Center",
    screens: [renderCommandAsk, renderCommandAnalyze, renderCommandConfirm, renderCommandGovern],
  },
  widget: {
    title: "MCP App Widget Flow",
    screens: [renderWidgetAsk, renderWidgetAnalyze, renderWidgetConfirm, renderWidgetGovern],
  },
};

let state = {
  version: new URLSearchParams(window.location.search).get("version") || "copilot",
  step: Number(new URLSearchParams(window.location.search).get("step") || 0),
};

const screen = document.querySelector("#screen");
const title = document.querySelector("#version-title");
const versionButtons = [...document.querySelectorAll(".version-button")];
const flowSteps = [...document.querySelectorAll(".flow-step")];

document.querySelector("#advance-flow").addEventListener("click", () => {
  state.step = Math.min(3, state.step + 1);
  render();
});

document.querySelector("#reset-flow").addEventListener("click", () => {
  state.step = 0;
  render();
});

versionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.version = button.dataset.version;
    state.step = 0;
    render();
  });
});

flowSteps.forEach((button) => {
  button.addEventListener("click", () => {
    state.step = Number(button.dataset.step);
    render();
  });
});

function render() {
  const version = versions[state.version] || versions.copilot;
  title.textContent = version.title;
  screen.innerHTML = version.screens[state.step]();
  versionButtons.forEach((button) => button.classList.toggle("active", button.dataset.version === state.version));
  flowSteps.forEach((button) => button.classList.toggle("active", Number(button.dataset.step) === state.step));
  const url = new URL(window.location);
  url.searchParams.set("version", state.version);
  url.searchParams.set("step", state.step);
  window.history.replaceState({}, "", url);
}

function copilotShell(messages, inspector) {
  return `
    <div class="real-copilot-frame">
      <aside class="real-left-nav" aria-label="Microsoft 365 Copilot navigation">
        <div class="m365-logo"><span class="m365-glyph"></span><span>Microsoft 365</span></div>
        <div class="m365-nav-list">
          <div class="m365-nav-item active"><span class="nav-icon">+</span>New chat</div>
          <div class="m365-nav-item"><span class="nav-icon">⌕</span>Search</div>
          <div class="m365-nav-item"><span class="nav-icon">▤</span>Library</div>
          <div class="m365-nav-item"><span class="nav-icon">✦</span>Create</div>
          <div class="m365-nav-item"><span class="nav-icon">◈</span>Agents</div>
          <div class="m365-nav-item"><span class="nav-icon">▧</span>Notebooks</div>
        </div>
      </aside>
      <section class="real-chat-stage">
        <div class="m365-topbar">
          <span class="m365-wordmark">Microsoft 365 Copilot</span>
          <div class="m365-search">Search</div>
          <button class="real-new-chat">New chat</button>
          <span class="avatar">MG</span>
        </div>
        <div class="real-chat-body">
          <div class="agent-hero">
            <span class="copilot-mark" aria-hidden="true"></span>
            <div>
              <h2>Decision & Alignment Agent</h2>
              <p class="small-text">Permission-aware enterprise agent for decisions, commitments, and organizational drift</p>
            </div>
            <div class="mode-toggle" aria-label="Copilot mode">
              <span class="active">Work</span>
              <span>Web</span>
            </div>
          </div>
          ${messages}
        </div>
        <div class="real-composer">
          <div class="real-composer-box">
            <span class="composer-icon">+</span>
            <span>Ask about decisions, risks, or evidence</span>
            <span class="composer-icon">⚙</span>
            <span class="composer-icon">♪</span>
            <button class="primary-button">Send</button>
          </div>
        </div>
      </section>
      <aside class="agent-side-pane">${inspector}</aside>
    </div>
  `;
}

function agentLabel() {
  return `<div class="agent-name"><span class="agent-badge">DA</span>Decision & Alignment Agent</div>`;
}

function userMessage(text) {
  return `<div class="real-message-row user"><div class="real-bubble">${text}</div></div>`;
}

function agentMessage(content) {
  return `<div class="real-message-row">${agentLabel()}<div class="real-bubble">${content}</div></div>`;
}

function renderCopilotAsk() {
  return copilotShell(
    userMessage("Find unresolved launch decisions and alignment risks for Project Meridian from the last two weeks. Focus on customer commitments, launch date, and approval owners.") +
      agentMessage("I can analyze your accessible meetings, Teams threads, emails, and project documents. I will not write to the Decision Registry until you confirm the proposed records.") +
      `<div class="prompt-cards">
        <div class="prompt-card"><strong>Find drift</strong><span class="small-text">Compare launch claims across meetings, decks, and email.</span></div>
        <div class="prompt-card"><strong>Create evidence</strong><span class="small-text">Package summaries, confidence, owner, and audit status.</span></div>
        <div class="prompt-card"><strong>Map alignment</strong><span class="small-text">Show decisions, risks, teams, and commitments.</span></div>
      </div>`,
    inspectorMetrics("Pre-write", "0", "No registry changes", "Work IQ scan ready")
  );
}

function renderCopilotAnalyze() {
  return copilotShell(
    userMessage("Run the scan.") +
      agentMessage(`
        I found three signals worth review:
        <br><br>
        <strong>1. Launch date conflict</strong><br>
        Product roadmap says July 18. Sales deck promises July 11 to Northwind. Confidence: high.
        <br><br>
        <strong>2. Security approval stale</strong><br>
        Approval owner changed after the last review, but the launch checklist still names the former owner. Confidence: medium.
        <br><br>
        <strong>3. Customer commitment not in registry</strong><br>
        A Teams thread references a migration support promise for Contoso. Confidence: medium.
        <div class="source-row">
          <span class="source-chip">Teams thread</span>
          <span class="source-chip">Roadmap doc</span>
          <span class="source-chip">Customer email</span>
          <span class="source-chip">Approval checklist</span>
        </div>
      `),
    inspectorAnalysis()
  );
}

function renderCopilotConfirm() {
  return copilotShell(
    agentMessage(`
      Proposed MCP writes:
      <div class="action-card">
        <strong>Create 1 decision record and 2 alignment risk records?</strong>
        <p class="small-text">The registry will store summaries, source references, confidence, owner, status, and audit metadata only.</p>
        <div class="choice-row">
          <button class="choice primary">Confirm writes</button>
          <button class="choice">Send to review queue</button>
          <button class="choice">Cancel</button>
        </div>
      </div>
    `),
    inspectorConfirm()
  );
}

function renderCopilotGovern() {
  return copilotShell(
    agentMessage(`
      Confirmed. I created the records through the external MCP server.
      <br><br>
      <span class="pill green">Decision DEC-1042 created</span>
      <span class="pill amber">Risk RISK-2207 created</span>
      <span class="pill red">Risk RISK-2208 created</span>
      <br><br>
      Correlation ID: <strong>corr-7f4a-meridian</strong>
    `),
    inspectorGovern()
  );
}

function inspectorMetrics(label, number, caption, foot) {
  return `
    <div class="agent-profile-card">
      <p class="eyebrow">${label}</p>
      <h2>Governed action preview</h2>
      <p class="small-text">Agent is available in Microsoft 365 Copilot Chat and writes only after confirmation.</p>
    </div>
    <div class="metric-row">
      <div class="metric"><strong>${number}</strong><span>writes</span></div>
      <div class="metric"><strong>3</strong><span>signals</span></div>
      <div class="metric"><strong>0</strong><span>raw docs stored</span></div>
    </div>
    <div class="agent-action-panel">
      <strong>${caption}</strong>
      <span class="small-text">${foot}</span>
    </div>
  `;
}

function inspectorAnalysis() {
  return `
    <div><p class="eyebrow">Evidence ledger</p><h2>Signals found</h2></div>
    <div class="registry-list">
      <div class="registry-item"><div class="status-line"><strong>Launch date conflict</strong><span class="pill red">High</span></div><span class="small-text">Roadmap, sales deck, customer email</span></div>
      <div class="registry-item"><div class="status-line"><strong>Security approval stale</strong><span class="pill amber">Medium</span></div><span class="small-text">Checklist, approval thread</span></div>
      <div class="registry-item"><div class="status-line"><strong>Commitment missing</strong><span class="pill amber">Medium</span></div><span class="small-text">Teams thread, account note</span></div>
    </div>
  `;
}

function inspectorConfirm() {
  return `
    <div><p class="eyebrow">Human confirmation</p><h2>Mutation guard</h2></div>
    <div class="registry-item"><strong>Pending write</strong><span class="small-text">No MCP mutation happens until the user confirms in Copilot Chat.</span></div>
    <div class="registry-item"><strong>Data boundary</strong><span class="small-text">Only summaries, metadata, confidence, and source references are stored.</span></div>
  `;
}

function inspectorGovern() {
  return `
    <div><p class="eyebrow">MCP registry</p><h2>Write complete</h2></div>
    <div class="metric-row">
      <div class="metric"><strong>3</strong><span>writes</span></div>
      <div class="metric"><strong>1</strong><span>review item</span></div>
      <div class="metric"><strong>100%</strong><span>audited</span></div>
    </div>
    <div class="registry-list">
      <div class="registry-item"><div class="status-line"><strong>DEC-1042</strong><span class="pill green">Created</span></div><span class="small-text">Launch date decision owner assigned to Priya Shah.</span></div>
      <div class="registry-item"><div class="status-line"><strong>RISK-2207</strong><span class="pill red">Open</span></div><span class="small-text">Sales commitment conflicts with roadmap.</span></div>
    </div>
  `;
}

function commandShell(main, drawer) {
  return `
    <div class="command-frame atlas-mode">
      <aside class="console-nav">
        <div><p class="eyebrow">Enterprise console</p><h2>Meridian</h2></div>
        <div class="nav-stack">
          <div class="nav-item active">Alignment Map</div>
          <div class="nav-item">Decision Registry</div>
          <div class="nav-item">Evidence Packets</div>
          <div class="nav-item">Review Queue</div>
          <div class="nav-item">Executive Brief</div>
        </div>
      </aside>
      <section class="workspace">${main}</section>
      <aside class="drawer">${drawer}</aside>
    </div>
  `;
}

function mapSurface(step = 0) {
  const nodes = [
    ["Product roadmap", "Q3 plan", "8%", "18%", ""],
    ["Sales promise", "Northwind", "58%", "16%", "node-risk"],
    ["Launch decision", "DEC-1042", "38%", "43%", "node-owner"],
    ["Security approval", "stale owner", "12%", "70%", "node-risk"],
    ["Priya Shah", "decision owner", "61%", "66%", "node-owner"],
  ];
  const visible = nodes.slice(0, step < 1 ? 2 : step < 3 ? 4 : 5);
  return `
    <div class="signal-atlas">
      <span class="atlas-axis"></span>
      <span class="atlas-axis"></span>
      <span class="atlas-axis"></span>
      <div class="atlas-vector risk" style="left:27%;top:32%;width:40%;transform:rotate(-2deg)"></div>
      <div class="atlas-vector safe" style="left:39%;top:55%;width:28%;transform:rotate(28deg)"></div>
      <div class="atlas-vector risk" style="left:29%;top:74%;width:32%;transform:rotate(-30deg)"></div>
      ${visible.map(([title, meta, left, top, klass]) => `
        <div class="atlas-node ${klass.replace("node-", "")}" style="left:${left};top:${top}">
          <strong>${title}</strong>
          <span>${meta}</span>
        </div>
      `).join("")}
      <div class="confidence-stack">
        <div class="confidence-row"><span>Conflict</span><div class="bar red"><span style="width:92%"></span></div><span>92</span></div>
        <div class="confidence-row"><span>Evidence</span><div class="bar"><span style="width:84%"></span></div><span>84</span></div>
        <div class="confidence-row"><span>Review</span><div class="bar teal"><span style="width:61%"></span></div><span>61</span></div>
      </div>
      <div class="drift-river">
        <div class="river-labels"><span>Meeting</span><span>Deck</span><span>Email</span><span>Registry</span></div>
        <div class="river-track"></div>
      </div>
    </div>
  `;
}

function renderCommandAsk() {
  return commandShell(
    `<div class="workspace-header"><div><p class="eyebrow">Scenario</p><h2>Before the Copilot scan</h2></div><span class="pill">Fixture mode</span></div>${mapSurface(0)}`,
    `<p class="eyebrow">Selected view</p><h2>Waiting for signal</h2><p class="small-text">The console starts clean. The judge sees records appear only after the Copilot flow confirms writes.</p>`
  );
}

function renderCommandAnalyze() {
  return commandShell(
    `<div class="workspace-header"><div><p class="eyebrow">Alignment analysis</p><h2>Three conflicting signals found</h2></div><span class="pill amber">Confidence mixed</span></div>${mapSurface(2)}`,
    evidenceDrawer("Launch date conflict", "High", "Roadmap says July 18. Sales deck promises July 11. Customer email references July 11 migration window.")
  );
}

function renderCommandConfirm() {
  return commandShell(
    `<div class="workspace-header"><div><p class="eyebrow">Review queue</p><h2>Human confirmation required</h2></div><span class="pill amber">Pending</span></div>${registryAndTimeline(false)}`,
    `<p class="eyebrow">Proposed action</p><h2>Create governed records</h2><p class="small-text">Mutation remains pending until confirmed in Copilot Chat.</p><div class="choice-row"><button class="choice primary">Confirm</button><button class="choice">Reject</button></div>`
  );
}

function renderCommandGovern() {
  return commandShell(
    `<div class="workspace-header"><div><p class="eyebrow">Alignment map</p><h2>Governed state after MCP write</h2></div><span class="pill green">Audited</span></div>${mapSurface(4)}`,
    evidenceDrawer("RISK-2207", "High", "Created through MCP. Owner assigned. Audit event corr-7f4a-meridian recorded without raw content.")
  );
}

function evidenceDrawer(title, confidence, summary) {
  return `
    <p class="eyebrow">Evidence packet</p>
    <h2>${title}</h2>
    <div class="metric-row">
      <div class="metric"><strong>${confidence}</strong><span>confidence</span></div>
      <div class="metric"><strong>3</strong><span>sources</span></div>
      <div class="metric"><strong>0</strong><span>raw docs</span></div>
    </div>
    <div class="evidence-stack">
      <div class="evidence"><strong>Summary</strong><span class="small-text">${summary}</span></div>
      <div class="evidence"><strong>Recommended action</strong><span class="small-text">Assign launch-date owner and reconcile external customer promise.</span></div>
      <div class="evidence"><strong>Audit</strong><span class="small-text">corr-7f4a-meridian</span></div>
    </div>
  `;
}

function registryAndTimeline(done) {
  return `
    <div class="grid-two">
      <section class="registry-panel">
        <h2>Registry writes</h2>
        <div class="table">
          <div class="table-row header"><span>Record</span><span>Owner</span><span>Severity</span><span>Status</span></div>
          <div class="table-row"><strong>Launch date decision</strong><span>Priya</span><span>High</span><span class="pill ${done ? "green" : "amber"}">${done ? "Created" : "Pending"}</span></div>
          <div class="table-row"><strong>Sales promise conflict</strong><span>Marcus</span><span>High</span><span class="pill ${done ? "red" : "amber"}">${done ? "Open" : "Pending"}</span></div>
        </div>
      </section>
      <section class="timeline-panel">
        <h2>MCP activity</h2>
        <div class="timeline">
          <div class="timeline-event"><span class="event-dot">1</span><p>Copilot proposes mutation.</p></div>
          <div class="timeline-event"><span class="event-dot">2</span><p>User confirmation required.</p></div>
          <div class="timeline-event"><span class="event-dot">3</span><p>${done ? "Registry write audited." : "Waiting for confirmation."}</p></div>
        </div>
      </section>
    </div>
  `;
}

function widgetShell(messages, widget, drawer) {
  return `
    <div class="widget-frame">
      <section class="copilot-widget">
        <div class="copilot-topbar"><strong>Microsoft 365 Copilot</strong><span class="presence">DA Agent</span></div>
        <div class="widget-chat">${messages}</div>
        <div class="composer"><div class="composer-box"><span>Message Decision & Alignment Agent</span><button class="mini-button">Send</button></div></div>
      </section>
      <section class="widget-card">${widget}</section>
      <aside class="drawer">${drawer}</aside>
    </div>
  `;
}

function renderWidgetAsk() {
  return widgetShell(
    userMessage("Show me the live Alignment Map for Meridian and explain what changed after the last leadership sync."),
    widgetCard("Interactive Alignment Map", mapSurface(1)),
    `<p class="eyebrow">MCP app</p><h2>Embedded widget</h2><p class="small-text">This version shows the memorable artifact inside the Copilot-adjacent experience.</p>`
  );
}

function renderWidgetAnalyze() {
  return widgetShell(
    agentMessage("The map shows a high-confidence conflict between the roadmap and the customer-facing sales promise."),
    widgetCard("Conflict detected", mapSurface(2)),
    evidenceDrawer("Map edge: roadmap vs promise", "High", "Two accessible source summaries disagree on launch timing.")
  );
}

function renderWidgetConfirm() {
  return widgetShell(
    agentMessage("I can create an alignment risk and send the stale approval to human review. Confirm?"),
    widgetCard("Pending governed action", registryAndTimeline(false)),
    `<p class="eyebrow">Confirmation</p><h2>Two actions pending</h2><div class="choice-row"><button class="choice primary">Create records</button><button class="choice">Review first</button></div>`
  );
}

function renderWidgetGovern() {
  return widgetShell(
    agentMessage("Done. The map and registry are updated. The high-impact item remains open until the owner resolves it."),
    widgetCard("Updated Alignment Map", mapSurface(4)),
    evidenceDrawer("Decision package ready", "High", "Decision record, alignment risk, evidence packet, review queue item, and audit event created.")
  );
}

function widgetCard(titleText, content) {
  return `<div class="widget-card-head"><strong>${titleText}</strong><span class="pill green">Live</span></div>${content}`;
}

render();
