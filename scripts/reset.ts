import { demoRegistry } from "@signal-foundry/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const registryPath = fileURLToPath(new URL("../data/signal-foundry-seed.json", import.meta.url));
mkdirSync(dirname(registryPath), { recursive: true });
writeFileSync(registryPath, `${JSON.stringify(demoRegistry, null, 2)}\n`);
console.log("Reset Signal Foundry demo registry to deterministic synthetic state.");
