import React from "react";
import ReactDOM from "react-dom/client";
import { demoRegistry } from "@signal-foundry/shared";
import "./styles.css";

function App() {
  return (
    <main className="app-shell">
      <section>
        <p className="eyebrow">Signal Foundry</p>
        <h1>Raw Signals | Forged with Intelligence | Approved Workflows</h1>
        <p>
          Scaffold ready with {demoRegistry.capabilities.length} synthetic capabilities. The full
          Foundry Floor command center is built in Checkpoint D.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
