targetScope = 'resourceGroup'

@description('Expected Signal Foundry subscription.')
param expectedSubscriptionId string

@description('Azure region for the resource group resources.')
param location string

@description('Container Apps environment name.')
param containerAppEnvironmentName string

@description('MCP Container App name.')
param containerAppName string

@description('Container image for the MCP app.')
param containerImage string

@description('MCP container port.')
param containerPort int

@description('Maximum Container Apps replicas.')
param containerMaxReplicas int

@description('Container Registry name.')
param containerRegistryName string

@description('Static Web Apps name.')
param staticWebAppName string

@description('Storage account name.')
param storageAccountName string

@description('Key Vault name.')
param keyVaultName string

@description('Log Analytics workspace name.')
param logAnalyticsName string

@description('Application Insights component name.')
param applicationInsightsName string

@description('Create the Azure AI Foundry / Azure OpenAI advisory resource and model deployment.')
param enableFoundryAdvisory bool

@description('Azure AI Foundry / Azure OpenAI account name.')
param foundryAccountName string

@description('Azure AI Foundry / Azure OpenAI advisory deployment name used by the MCP server.')
param foundryDeploymentName string

@description('Azure AI Foundry / Azure OpenAI advisory model name.')
param foundryModelName string

@description('Azure AI Foundry / Azure OpenAI advisory model version.')
param foundryModelVersion string

@description('Azure AI Foundry / Azure OpenAI deployment SKU.')
param foundryDeploymentSkuName string

@description('Azure AI Foundry / Azure OpenAI deployment capacity.')
param foundryDeploymentCapacity int

@description('Azure OpenAI-compatible API version used by the MCP advisory client.')
param foundryApiVersion string

@description('Log Analytics retention in days.')
param logRetentionDays int

@description('Static Web Apps SKU name.')
param staticWebAppSkuName string

@description('Static Web Apps SKU tier.')
param staticWebAppSkuTier string

@description('Deployment tags.')
param tags object

var registryTables = [
  'Actors'
  'Capabilities'
  'CapabilityProposals'
  'RiskReviews'
  'ReviewItems'
  'ReleasePackets'
  'McpActivity'
  'AuditEvents'
]

var guardedTags = union(tags, {
  checkpoint: 'F'
  costPosture: 'consumption-scale-to-zero'
  expectedSubscription: expectedSubscriptionId
})

var foundryEndpoint = 'https://${foundryAccountName}.openai.azure.com'
var foundryEnv = enableFoundryAdvisory ? [
  {
    name: 'SIGNAL_FOUNDRY_ADVISORY_MODE'
    value: 'foundry'
  }
  {
    name: 'SIGNAL_FOUNDRY_FOUNDRY_ENDPOINT'
    value: foundryEndpoint
  }
  {
    name: 'SIGNAL_FOUNDRY_FOUNDRY_DEPLOYMENT'
    value: foundryDeploymentName
  }
  {
    name: 'SIGNAL_FOUNDRY_FOUNDRY_API_VERSION'
    value: foundryApiVersion
  }
] : [
  {
    name: 'SIGNAL_FOUNDRY_ADVISORY_MODE'
    value: 'off'
  }
]

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: guardedTags
  properties: {
    retentionInDays: logRetentionDays
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  tags: guardedTags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    IngestionMode: 'LogAnalytics'
    Request_Source: 'rest'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  tags: guardedTags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    dataEndpointEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: guardedTags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowCrossTenantReplication: false
    defaultToOAuthAuthentication: true
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    supportsHttpsTrafficOnly: true
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource tables 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = [for tableName in registryTables: {
  parent: tableService
  name: tableName
}]

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: guardedTags
  properties: {
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
    sku: {
      family: 'A'
      name: 'standard'
    }
    softDeleteRetentionInDays: 7
    tenantId: subscription().tenantId
  }
}

resource foundryAccount 'Microsoft.CognitiveServices/accounts@2024-10-01' = if (enableFoundryAdvisory) {
  name: foundryAccountName
  location: location
  tags: union(guardedTags, {
    service: 'foundry-advisory'
    costGuard: 'pay-per-token-low-capacity'
  })
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: foundryAccountName
    disableLocalAuth: true
    publicNetworkAccess: 'Enabled'
  }
}

resource foundryDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = if (enableFoundryAdvisory) {
  parent: foundryAccount
  name: foundryDeploymentName
  sku: {
    name: foundryDeploymentSkuName
    capacity: foundryDeploymentCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: foundryModelName
      version: foundryModelVersion
    }
    raiPolicyName: 'Microsoft.Default'
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
  }
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvironmentName
  location: location
  tags: guardedTags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    zoneRedundant: false
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: guardedTags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        allowInsecure: false
        external: true
        targetPort: containerPort
        transport: 'http'
      }
    }
    managedEnvironmentId: managedEnvironment.id
    template: {
      containers: [
        {
          name: 'mcp'
          image: containerImage
          env: concat([
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
            {
              name: 'PORT'
              value: string(containerPort)
            }
            {
              name: 'SIGNAL_FOUNDRY_AUTH_MODE'
              value: 'demo'
            }
            {
              name: 'SIGNAL_FOUNDRY_COMPANY_NAME'
              value: 'Asteria Dynamics'
            }
            {
              name: 'SIGNAL_FOUNDRY_TENANT_ID'
              value: 'tenant-asteria-dynamics'
            }
            {
              name: 'SIGNAL_FOUNDRY_PROJECT_ID'
              value: 'revenue-ops-launchpad'
            }
            {
              name: 'SIGNAL_FOUNDRY_REGISTRY_MODE'
              value: 'azure-table'
            }
            {
              name: 'SIGNAL_FOUNDRY_STORAGE_ACCOUNT'
              value: storage.name
            }
            {
              name: 'SIGNAL_FOUNDRY_TELEMETRY_MODE'
              value: 'audit-safe-compact'
            }
          ], foundryEnv)
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        maxReplicas: containerMaxReplicas
        minReplicas: 0
      }
    }
  }
}

resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, containerApp.id, 'AcrPull')
  scope: acr
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  }
}

resource tableDataRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, containerApp.id, 'StorageTableDataContributor')
  scope: storage
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3')
  }
}

resource foundryOpenAiUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (enableFoundryAdvisory) {
  name: guid(foundryAccount.id, containerApp.id, 'CognitiveServicesOpenAIUser')
  scope: foundryAccount
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd')
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: guardedTags
  sku: {
    name: staticWebAppSkuName
    tier: staticWebAppSkuTier
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
}

output acrLoginServer string = acr.properties.loginServer
output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output foundryAdvisoryMode string = enableFoundryAdvisory ? 'foundry' : 'off'
output foundryEndpoint string = enableFoundryAdvisory ? foundryEndpoint : ''
output foundryDeployment string = enableFoundryAdvisory ? foundryDeploymentName : ''
output staticWebAppHostname string = staticWebApp.properties.defaultHostname
output storageAccount string = storage.name
output storageTables array = registryTables
output subscriptionGuard string = subscription().subscriptionId == expectedSubscriptionId ? 'expected-subscription' : 'review-subscription-before-apply'
