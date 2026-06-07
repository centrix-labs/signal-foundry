import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { demoRegistry, type SignalFoundryRegistry } from "@signal-foundry/shared";
import { createTableStorageAdapterFromEnv, type TableStorageRegistryAdapter } from "./tableStorageAdapter";

const defaultPath = "/Users/mattgraves/Documents/hackathon-enterprise/data/signal-foundry-seed.json";
const defaultTenantId = "tenant-contoso";
const defaultProjectId = "renewals-hackathon";

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

  private queueAzureMirror() {
    if (!this.tableAdapter) {
      return;
    }
    const snapshot = structuredClone(this.registry);
    const tenantId = process.env["SIGNAL_FOUNDRY_TENANT_ID"] ?? defaultTenantId;
    const projectId = process.env["SIGNAL_FOUNDRY_PROJECT_ID"] ?? defaultProjectId;
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
