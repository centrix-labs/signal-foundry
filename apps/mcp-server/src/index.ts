import "dotenv/config";
import { demoScope } from "@signal-foundry/shared";
import { createServer } from "./server";
import { RegistryStore } from "./store";

const port = Number(process.env["PORT"] ?? 7071);

async function main() {
  const store = new RegistryStore();
  await store.hydrateFromAzure(
    process.env["SIGNAL_FOUNDRY_TENANT_ID"] ?? demoScope.tenantId,
    process.env["SIGNAL_FOUNDRY_PROJECT_ID"] ?? demoScope.projectId
  );
  createServer(store).listen(port, () => {
    console.log(`Signal Foundry MCP server listening on ${port}`);
  });
}

void main();
