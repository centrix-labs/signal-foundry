import cors from "cors";
import express from "express";
import type { ToolName } from "@signal-foundry/shared";
import { resolveActor } from "./auth";
import { RegistryStore } from "./store";
import { executeTool, toolNames } from "./tools";

export function createServer(store = new RegistryStore()) {
  const app = express();
  app.use(cors({ origin: parseOrigins(process.env["SIGNAL_FOUNDRY_ALLOWED_ORIGINS"]) }));
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "signal-foundry-mcp", status: "healthy" });
  });

  app.get("/tools", (_request, response) => {
    response.json({ ok: true, tools: toolNames });
  });

  app.post("/tools/:toolName", (request, response) => {
    const toolName = request.params["toolName"] as ToolName;
    if (!toolNames.includes(toolName)) {
      response.status(404).json({ ok: false, error: { message: "Unknown tool." } });
      return;
    }
    const actor = resolveActor(store.read(), request.header("x-sf-actor-id"));
    const result = executeTool(store, toolName, request.body, actor);
    response.status(result.status).json(result.body);
  });

  app.post("/admin/reset", (request, response) => {
    const actor = resolveActor(store.read(), request.header("x-sf-actor-id"));
    if (actor?.role !== "admin") {
      response.status(403).json({ ok: false, error: { message: "Admin role required." } });
      return;
    }
    response.json({ ok: true, registry: store.reset() });
  });

  return app;
}

function parseOrigins(value?: string) {
  if (!value) {
    return true;
  }
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}
