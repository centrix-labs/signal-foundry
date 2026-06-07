targetScope = 'subscription'

@description('Resource group for Signal Foundry hackathon resources.')
param resourceGroupName string = 'rg-signal-foundry-hackathon'

@description('Primary Azure region for cost-controlled hackathon resources.')
param location string = 'eastus2'

@description('Container Apps environment name.')
param containerAppEnvironmentName string = 'cae-signal-foundry'

@description('MCP Container App name.')
param containerAppName string = 'ca-signal-foundry-mcp'

@description('Container Registry name. Must be globally unique if the default is taken.')
param containerRegistryName string = 'acrsignalfoundry'

@description('Static Web Apps name.')
param staticWebAppName string = 'swa-signal-foundry'

@description('Storage account name. Must be globally unique if the default is taken.')
param storageAccountName string = 'stsignalfoundry'

@description('Key Vault name. Must be globally unique if the default is taken.')
param keyVaultName string = 'kv-signal-foundry'

@description('Log Analytics workspace name.')
param logAnalyticsName string = 'law-signal-foundry'

@description('Application Insights component name.')
param applicationInsightsName string = 'appi-signal-foundry'

@description('Placeholder or pushed MCP image. Default is public so the first infra deployment is not blocked by ACR content.')
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('MCP container port.')
param containerPort int = 7071

@description('Maximum Container Apps replicas. Keep low for hackathon cost control.')
param containerMaxReplicas int = 1

@description('Log Analytics retention in days. Keep short for hackathon cost control.')
param logRetentionDays int = 30

@description('Static Web Apps SKU name. Free is the default cost guard.')
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSkuName string = 'Free'

@description('Static Web Apps SKU tier. Free is the default cost guard.')
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSkuTier string = 'Free'

@description('Deployment tags for cost attribution and cleanup.')
param tags object = {
  app: 'signal-foundry'
  environment: 'hackathon'
  owner: 'azure-devops-worker'
  costGuard: 'scale-to-zero'
}

var expectedSubscriptionId = 'YOUR-AZURE-SUBSCRIPTION-ID'
var actualSubscriptionId = subscription().subscriptionId

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: union(tags, {
    checkpoint: 'F'
    cleanup: 'delete-resource-group-after-hackathon'
  })
}

module resources './resources.bicep' = {
  name: 'signal-foundry-checkpoint-f'
  scope: rg
  params: {
    applicationInsightsName: applicationInsightsName
    containerAppEnvironmentName: containerAppEnvironmentName
    containerAppName: containerAppName
    containerImage: containerImage
    containerMaxReplicas: containerMaxReplicas
    containerPort: containerPort
    containerRegistryName: containerRegistryName
    expectedSubscriptionId: expectedSubscriptionId
    keyVaultName: keyVaultName
    location: location
    logAnalyticsName: logAnalyticsName
    logRetentionDays: logRetentionDays
    staticWebAppName: staticWebAppName
    staticWebAppSkuName: staticWebAppSkuName
    staticWebAppSkuTier: staticWebAppSkuTier
    storageAccountName: storageAccountName
    tags: tags
  }
}

output resourceGroup string = rg.name
output subscriptionGuard string = actualSubscriptionId == expectedSubscriptionId ? 'expected-subscription' : 'blocked-wrong-subscription'
output containerAppUrl string = resources.outputs.containerAppUrl
output staticWebAppHostname string = resources.outputs.staticWebAppHostname
output storageTables array = resources.outputs.storageTables
