import { demoRegistry } from "@signal-foundry/shared";

export function getScaffoldStatus() {
  return {
    service: "signal-foundry-mcp",
    status: "scaffolded",
    capabilities: demoRegistry.capabilities.length
  };
}

if (process.env["SIGNAL_FOUNDRY_PRINT_STATUS"] === "1") {
  console.log(JSON.stringify(getScaffoldStatus()));
}
