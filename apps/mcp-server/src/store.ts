import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { demoRegistry, type SignalFoundryRegistry } from "@signal-foundry/shared";

const defaultPath = "/Users/mattgraves/Documents/hackathon-enterprise/data/signal-foundry-seed.json";

export class RegistryStore {
  private registry: SignalFoundryRegistry;

  constructor(private readonly registryPath = process.env["SIGNAL_FOUNDRY_REGISTRY_PATH"] ?? defaultPath) {
    this.registry = this.load();
  }

  read() {
    return this.registry;
  }

  write(mutator: (registry: SignalFoundryRegistry) => void) {
    mutator(this.registry);
    this.persist();
    return this.registry;
  }

  reset() {
    this.registry = structuredClone(demoRegistry);
    this.persist();
    return this.registry;
  }

  private load() {
    if (!existsSync(this.registryPath)) {
      mkdirSync(dirname(this.registryPath), { recursive: true });
      writeFileSync(this.registryPath, `${JSON.stringify(demoRegistry, null, 2)}\n`);
    }
    return JSON.parse(readFileSync(this.registryPath, "utf8")) as SignalFoundryRegistry;
  }

  private persist() {
    mkdirSync(dirname(this.registryPath), { recursive: true });
    writeFileSync(this.registryPath, `${JSON.stringify(this.registry, null, 2)}\n`);
  }
}
