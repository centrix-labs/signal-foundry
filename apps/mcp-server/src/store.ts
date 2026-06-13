import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { demoRegistry, demoScope, type SignalFoundryRegistry } from "@signal-foundry/shared";
import { createTableStorageAdapterFromEnv, type TableStorageRegistryAdapter } from "./tableStorageAdapter";

const defaultPath = fileURLToPath(new URL("../../../data/signal-foundry-seed.json", import.meta.url));

export class RegistryStore {
  private registry: SignalFoundryRegistry;
  private readonly tableAdapter: TableStorageRegistryAdapter | undefined;
  private pendingMirror: Promise<void> = Promise.resolve();

  constructor(private readonly registryPath = process.env["SIGNAL_FOUNDRY_REGISTRY_PATH"] ?? defaultPath) {
    this.tableAdapter = createTableStorageAdapterFromEnv();
    this.registry = this.load();
    this.queueAzureMirror();
  }

  read() {
    return this.registry;
  }

  write(mutator: (registry: SignalFoundryRegistry) => void) {
    mutator(this.registry);
    this.persist();
    this.queueAzureMirror();
    return this.registry;
  }

  reset() {
    this.registry = structuredClone(demoRegistry);
    this.persist();
    this.queueAzureMirror();
    return this.registry;
  }

  async flushAzureMirror() {
    await this.pendingMirror;
  }

  // Container disk is ephemeral; the Table mirror is the durable copy. On boot,
  // restore from the mirror so deploys never erase live demo evidence.
  async hydrateFromAzure(tenantId: string, projectId: string) {
    if (!this.tableAdapter) {
      return false;
    }
    try {
      const loaded = await this.tableAdapter.loadRegistry(tenantId, projectId);
      if (!loaded) {
        return false;
      }
      this.registry = { ...this.registry, ...loaded };
      this.persist();
      console.log(JSON.stringify({
        event: "registry_hydrated",
        proposals: this.registry.proposals.length,
        activity: this.registry.mcpActivity.length,
        checkpoints: this.registry.copilotCheckpoints.length
      }));
      return true;
    } catch (error) {
      console.log(JSON.stringify({ event: "registry_hydrate_failed", code: String(error).slice(0, 80) }));
      return false;
    }
  }

  private load() {
    if (!existsSync(this.registryPath)) {
      mkdirSync(dirname(this.registryPath), { recursive: true });
      writeFileSync(this.registryPath, `${JSON.stringify(demoRegistry, null, 2)}\n`);
    }
    const registry = JSON.parse(readFileSync(this.registryPath, "utf8")) as SignalFoundryRegistry;
    registry.copilotCheckpoints ??= [];
    return registry;
  }

  private persist() {
    mkdirSync(dirname(this.registryPath), { recursive: true });
    writeFileSync(this.registryPath, `${JSON.stringify(this.registry, null, 2)}\n`);
  }

  private queueAzureMirror() {
    if (!this.tableAdapter) {
      return;
    }
    const snapshot = structuredClone(this.registry);
    const tenantId = process.env["SIGNAL_FOUNDRY_TENANT_ID"] ?? demoScope.tenantId;
    const projectId = process.env["SIGNAL_FOUNDRY_PROJECT_ID"] ?? demoScope.projectId;
    this.pendingMirror = this.pendingMirror
      .then(async () => {
        await this.tableAdapter?.ensureTables();
        await this.tableAdapter?.upsertRegistry(snapshot, tenantId, projectId);
      })
      .catch((error: unknown) => {
        console.error(JSON.stringify({
          event: "signal_foundry_table_mirror_failed",
          message: "Azure Table registry mirror failed.",
          errorType: error instanceof Error ? error.name : "UnknownError"
        }));
      });
  }
}
