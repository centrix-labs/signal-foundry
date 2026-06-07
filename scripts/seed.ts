import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { demoRegistry } from "@signal-foundry/shared";

const registryPath = "/Users/mattgraves/Documents/hackathon-enterprise/data/signal-foundry-seed.json";
mkdirSync(dirname(registryPath), { recursive: true });
writeFileSync(registryPath, `${JSON.stringify(demoRegistry, null, 2)}\n`);
console.log(`Seeded synthetic registry at ${registryPath}`);
