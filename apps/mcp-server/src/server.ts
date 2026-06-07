import cors from "cors";
import express from "express";
import type { ToolName } from "@signal-foundry/shared";
import { actorIdFromBearer, resolveActor } from "./auth";
import { RegistryStore } from "./store";
import { executeTool, toolNames } from "./tools";

const mcpToolDescriptions: Record<ToolName, string> = {
  search_capabilities: "Search approved or proposed Signal Foundry capabilities.",
  recommend_capabilities_for_role: "Recommend governed Copilot capabilities for a role.",
  create_capability_proposal: "Create a governed capability proposal.",
  score_capability_risk: "Score deterministic capability risk.",
  submit_capability_review: "Submit a proposal for human review.",
  approve_capability: "Approve a reviewed capability.",
  reject_capability: "Reject a proposal with a reason.",
  release_capability: "Release an approved capability.",
  generate_release_packet: "Generate an audit-safe release packet.",
  generate_capability_map: "Generate Signal Atlas graph data.",
  list_mcp_activity: "List audit-safe MCP activity."
};

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

  app.get("/openapi.json", (request, response) => {
    const forwardedProto = request.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const origin = `${forwardedProto || request.protocol}://${request.get("host")}`;
    response.json({
      openapi: "3.1.0",
      info: {
        title: "Signal Foundry MCP Tool API",
        version: "0.1.0",
        description: "Audit-safe REST wrapper for Signal Foundry MCP tools."
      },
      servers: [{ url: origin }],
      paths: Object.fromEntries(
        toolNames.map((name) => [
          `/tools/${name}`,
          {
            post: {
              operationId: name,
              summary: mcpToolDescriptions[name],
              "x-openai-isConsequential": !["search_capabilities", "recommend_capabilities_for_role", "generate_release_packet", "generate_capability_map", "list_mcp_activity"].includes(name),
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: { type: "object", additionalProperties: true }
                  }
                }
              },
              responses: {
                "200": {
                  description: "Signal Foundry tool response",
                  content: {
                    "application/json": {
                      schema: { type: "object", additionalProperties: true }
                    }
                  }
                }
              }
            }
          }
        ])
      )
    });
  });

  app.post("/mcp", (request, response) => {
    const { id, method, params } = request.body ?? {};
    const actorId = request.header("x-sf-actor-id") ?? actorIdFromBearer(request.header("authorization"));
    const actor = resolveActor(store.read(), actorId);

    if (method === "initialize") {
      response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "signal-foundry-mcp", version: "0.1.0" }
        }
      });
      return;
    }

    if (method === "tools/list") {
      response.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: toolNames.map((name) => ({
            name,
            description: mcpToolDescriptions[name],
            inputSchema: { type: "object", additionalProperties: true }
          }))
        }
      });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name as ToolName;
      if (!toolNames.includes(toolName)) {
        response.status(404).json(mcpError(id, "Unknown tool."));
        return;
      }
      const result = executeTool(store, toolName, params?.arguments ?? {}, actor);
      response.status(result.status >= 500 ? 500 : 200).json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result.body) }],
          isError: result.status >= 400
        }
      });
      return;
    }

    response.status(400).json(mcpError(id, "Unsupported MCP method."));
  });

  app.post("/tools/:toolName", (request, response) => {
    const toolName = request.params["toolName"] as ToolName;
    if (!toolNames.includes(toolName)) {
      response.status(404).json({ ok: false, error: { message: "Unknown tool." } });
      return;
    }
    const actorId = request.header("x-sf-actor-id") ?? actorIdFromBearer(request.header("authorization"));
    const actor = resolveActor(store.read(), actorId);
    const result = executeTool(store, toolName, request.body, actor);
    response.status(result.status).json(result.body);
  });

  app.post("/admin/reset", (request, response) => {
    const actorId = request.header("x-sf-actor-id") ?? actorIdFromBearer(request.header("authorization"));
    const actor = resolveActor(store.read(), actorId);
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

function mcpError(id: unknown, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32000, message }
  };
}
