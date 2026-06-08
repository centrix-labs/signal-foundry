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
