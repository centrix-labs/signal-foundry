import { TableClient } from "@azure/data-tables";
import type { SignalFoundryRegistry } from "@signal-foundry/shared";

const tableNames = {
  capabilities: "Capabilities",
  proposals: "CapabilityProposals",
  riskReviews: "RiskReviews",
  reviewItems: "ReviewItems",
  releasePackets: "ReleasePackets",
  mcpActivity: "McpActivity",
  auditEvents: "AuditEvents"
} as const;

type RegistryCollection = Exclude<keyof SignalFoundryRegistry, "actors">;

export class TableStorageRegistryAdapter {
  constructor(private readonly connectionString: string) {}

  async ensureTables() {
    await Promise.all(
      Object.values(tableNames).map((tableName) =>
        TableClient.fromConnectionString(this.connectionString, tableName).createTable()
          .catch((error: unknown) => {
            if (String(error).includes("TableAlreadyExists")) {
              return undefined;
            }
            throw error;
          })
      )
    );
  }

  async upsertRegistry(registry: SignalFoundryRegistry, tenantId: string, projectId: string) {
    for (const [collection, tableName] of Object.entries(tableNames) as Array<[RegistryCollection, string]>) {
      const client = TableClient.fromConnectionString(this.connectionString, tableName);
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
  const connectionString = process.env["SIGNAL_FOUNDRY_STORAGE_CONNECTION_STRING"];
  if (!connectionString) {
    return undefined;
  }
  return new TableStorageRegistryAdapter(connectionString);
}
