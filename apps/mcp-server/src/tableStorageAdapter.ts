import { TableClient } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";
import type { SignalFoundryRegistry } from "@signal-foundry/shared";

const tableNames = {
  actors: "Actors",
  capabilities: "Capabilities",
  proposals: "CapabilityProposals",
  riskReviews: "RiskReviews",
  reviewItems: "ReviewItems",
  releasePackets: "ReleasePackets",
  mcpActivity: "McpActivity",
  copilotCheckpoints: "CopilotCheckpoints",
  auditEvents: "AuditEvents"
} as const;

type RegistryCollection = keyof typeof tableNames;

export class TableStorageRegistryAdapter {
  constructor(private readonly tableClientFor: (tableName: string) => TableClient) {}

  static fromConnectionString(connectionString: string) {
    return new TableStorageRegistryAdapter((tableName) => TableClient.fromConnectionString(connectionString, tableName));
  }

  static fromAccountName(accountName: string) {
    const credential = new DefaultAzureCredential();
    const endpoint = `https://${accountName}.table.core.windows.net`;
    return new TableStorageRegistryAdapter((tableName) => new TableClient(endpoint, tableName, credential));
  }

  async ensureTables() {
    await Promise.all(
      Object.values(tableNames).map((tableName) =>
        this.tableClientFor(tableName).createTable()
          .catch((error: unknown) => {
            if (String(error).includes("TableAlreadyExists") || getErrorCode(error) === "TableAlreadyExists") {
              return undefined;
            }
            throw error;
          })
      )
    );
  }

  async loadRegistry(tenantId: string, projectId: string): Promise<Partial<SignalFoundryRegistry> | undefined> {
    const partition = `${tenantId}:${projectId}`;
    const loaded: Record<string, unknown[]> = {};
    let recordCount = 0;
    for (const [collection, tableName] of Object.entries(tableNames) as Array<[RegistryCollection, string]>) {
      const client = this.tableClientFor(tableName);
      const records: unknown[] = [];
      try {
        const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq '${partition}'` } });
        for await (const entity of entities) {
          const payload = (entity as { payload?: string }).payload;
          if (typeof payload === "string") {
            records.push(JSON.parse(payload));
          }
        }
      } catch (error) {
        console.log(JSON.stringify({ event: "table_hydrate_skip", table: tableName, code: getErrorCode(error) ?? "unknown" }));
        return undefined;
      }
      loaded[collection] = records;
      recordCount += records.length;
    }
    if (recordCount === 0) {
      return undefined;
    }
    const byTimeDesc = (key: string) => (a: unknown, b: unknown) =>
      String((b as Record<string, string>)[key] ?? "").localeCompare(String((a as Record<string, string>)[key] ?? ""));
    (loaded["mcpActivity"] as unknown[]).sort(byTimeDesc("timestamp"));
    (loaded["copilotCheckpoints"] as unknown[]).sort(byTimeDesc("createdAt"));
    return loaded as Partial<SignalFoundryRegistry>;
  }

  async upsertRegistry(registry: SignalFoundryRegistry, tenantId: string, projectId: string) {
    for (const [collection, tableName] of Object.entries(tableNames) as Array<[RegistryCollection, string]>) {
      const client = this.tableClientFor(tableName);
      for (const record of registry[collection]) {
        await client.upsertEntity({
          partitionKey: `${tenantId}:${projectId}`,
          rowKey: record.id,
          payload: JSON.stringify(record)
        });
      }
    }
  }
}

export function createTableStorageAdapterFromEnv() {
  if (process.env["SIGNAL_FOUNDRY_REGISTRY_MODE"] !== "azure-table") {
    return undefined;
  }
  const connectionString = process.env["SIGNAL_FOUNDRY_STORAGE_CONNECTION_STRING"];
  if (connectionString) {
    return TableStorageRegistryAdapter.fromConnectionString(connectionString);
  }
  const accountName = process.env["SIGNAL_FOUNDRY_STORAGE_ACCOUNT"];
  if (!accountName) {
    return undefined;
  }
  return TableStorageRegistryAdapter.fromAccountName(accountName);
}

function getErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return undefined;
}
