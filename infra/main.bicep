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

@description('Create the Azure AI Foundry / Azure OpenAI advisory resource and model deployment.')
param enableFoundryAdvisory bool = true

@description('Azure AI Foundry / Azure OpenAI account name. Must be globally unique.')
param foundryAccountName string = 'aif-signal-foundry'

@description('Azure AI Foundry / Azure OpenAI advisory deployment name used by the MCP server.')
param foundryDeploymentName string = 'sf-advisory-gpt41-mini'

@description('Azure AI Foundry / Azure OpenAI advisory model name.')
param foundryModelName string = 'gpt-4.1-mini'

@description('Azure AI Foundry / Azure OpenAI advisory model version.')
param foundryModelVersion string = '2025-04-14'

@description('Azure AI Foundry / Azure OpenAI deployment SKU. Standard uses the regional quota available in eastus2 for hackathon use.')
param foundryDeploymentSkuName string = 'Standard'

@description('Azure AI Foundry / Azure OpenAI deployment capacity. Keep low for hackathon cost control.')
param foundryDeploymentCapacity int = 1

@description('Azure OpenAI-compatible API version used by the MCP advisory client.')
param foundryApiVersion string = '2024-10-21'

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
    enableFoundryAdvisory: enableFoundryAdvisory
    foundryAccountName: foundryAccountName
    foundryApiVersion: foundryApiVersion
    foundryDeploymentCapacity: foundryDeploymentCapacity
    foundryDeploymentName: foundryDeploymentName
    foundryDeploymentSkuName: foundryDeploymentSkuName
    foundryModelName: foundryModelName
    foundryModelVersion: foundryModelVersion
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
output foundryAdvisoryMode string = resources.outputs.foundryAdvisoryMode
output foundryEndpoint string = resources.outputs.foundryEndpoint
output foundryDeployment string = resources.outputs.foundryDeployment
output staticWebAppHostname string = resources.outputs.staticWebAppHostname
output storageTables array = resources.outputs.storageTables
