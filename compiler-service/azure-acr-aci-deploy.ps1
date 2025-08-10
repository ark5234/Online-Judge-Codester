param(
  [string]$ResourceGroup = "codester-rg",
  [string]$Location = "centralindia",
  [string]$AcrName = "codesteracr$(Get-Random -Minimum 1000 -Maximum 9999)",
  [string]$ImageName = "codester-compiler",
  [string]$ImageTag = "latest",
  [string]$ContainerName = "codester-compiler",
  [string]$DnsLabel = "codester-compiler-$(Get-Random -Minimum 1000 -Maximum 9999)"
)

Write-Host "🚀 Deploying compiler-service Docker image to Azure (ACR + ACI)" -ForegroundColor Cyan

# Pre-req checks
function Ensure-Command {
  param([string]$cmd, [string]$install)
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Missing '$cmd'. Please install: $install"
  }
}
Ensure-Command az "https://learn.microsoft.com/cli/azure/install-azure-cli"
Ensure-Command docker "https://docs.docker.com/desktop/install/windows-install/"

# Azure login (no-op if already logged in)
az account show 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Logging into Azure..." -ForegroundColor Yellow
  az login | Out-Null
}

# Resource group
Write-Host "Creating resource group $ResourceGroup in $Location..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location 1>$null

# ACR create or reuse
Write-Host "Creating Azure Container Registry $AcrName..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true 1>$null

$LoginServer = az acr show --name $AcrName --query loginServer -o tsv
$AcrUser = az acr credential show -n $AcrName --query username -o tsv
$AcrPass = az acr credential show -n $AcrName --query passwords[0].value -o tsv

if ($LoginServer) { $LoginServer = $LoginServer.Trim() }
Write-Host "ACR login server: $LoginServer" -ForegroundColor Gray

# Docker build & push (use absolute paths)
$fullImage = "$LoginServer/${ImageName}:${ImageTag}"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DockerfilePath = Join-Path $ScriptDir "Dockerfile"
$BuildContext = $ScriptDir
Write-Host "Building Docker image: $fullImage" -ForegroundColor Yellow
Write-Host "Dockerfile: $DockerfilePath" -ForegroundColor Gray
Write-Host "Context:    $BuildContext" -ForegroundColor Gray
Push-Location $BuildContext
try {
  docker build -t $fullImage -f "$DockerfilePath" "$BuildContext"
  if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

  Write-Host "Logging into ACR..." -ForegroundColor Yellow
  docker login $LoginServer -u $AcrUser -p $AcrPass

  Write-Host "Pushing image to ACR..." -ForegroundColor Yellow
  docker push $fullImage
  if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }
}
finally { Pop-Location }

# Deploy to ACI
Write-Host "Deploying ACI $ContainerName with DNS label $DnsLabel..." -ForegroundColor Yellow
# Delete existing container with same name (optional)
az container delete --resource-group $ResourceGroup --name $ContainerName --yes 1>$null 2>$null

$envs = @("PORT=8000")
az container create `
  --resource-group $ResourceGroup `
  --name $ContainerName `
  --image $fullImage `
  --dns-name-label $DnsLabel `
  --ports 8000 `
  --cpu 1 `
  --memory 2 `
  --os-type Linux `
  --registry-login-server $LoginServer `
  --registry-username $AcrUser `
  --registry-password $AcrPass `
  --environment-variables $envs `
  --restart-policy Always `
  --location $Location 1>$null

if ($LASTEXITCODE -ne 0) { throw "ACI creation failed" }

Write-Host "Waiting for the container to start (polling up to ~3 minutes)..." -ForegroundColor Yellow
$fqdn = ""
$pubip = ""
for ($i=0; $i -lt 12; $i++) {
  $state = az container show --resource-group $ResourceGroup --name $ContainerName --query "instanceView.state" -o tsv
  $fqdn = az container show --resource-group $ResourceGroup --name $ContainerName --query "ipAddress.fqdn" -o tsv
  $pubip = az container show --resource-group $ResourceGroup --name $ContainerName --query "ipAddress.ip" -o tsv
  $state = ($state | Out-String).Trim()
  $fqdn = ($fqdn | Out-String).Trim()
  $pubip = ($pubip | Out-String).Trim()
  $stateOut = if ([string]::IsNullOrWhiteSpace($state)) { "" } else { $state }
  $fqdnOut = if ([string]::IsNullOrWhiteSpace($fqdn)) { "" } else { $fqdn }
  $ipOut = if ([string]::IsNullOrWhiteSpace($pubip)) { "" } else { $pubip }
  Write-Host ("  state={0} fqdn={1} ip={2}" -f $stateOut, $fqdnOut, $ipOut) -ForegroundColor Gray
  if ($fqdn -or $pubip) { break }
  Start-Sleep -Seconds 15
}

if (-not $fqdn -and -not $pubip) {
  Write-Host "⚠️ Still no FQDN/IP; ACI may be provisioning or DNS not ready. You can fetch later with:" -ForegroundColor Yellow
  Write-Host "   az container show --resource-group $ResourceGroup --name $ContainerName --query \"ipAddress\"" -ForegroundColor Yellow
  throw "Failed to obtain ACI endpoint."
}

if ($fqdn) { $serviceUrl = "http://$fqdn:8000" }
else { $serviceUrl = "http://$pubip:8000" }

Write-Host "✅ Compiler Service URL: $serviceUrl" -ForegroundColor Green
"$serviceUrl" | Out-File -FilePath (Join-Path $PSScriptRoot "..\azure-compiler-url.txt") -Encoding UTF8

# Health check
Write-Host "Probing /health..." -ForegroundColor Yellow
try {
  $resp = Invoke-RestMethod -Uri "$serviceUrl/health" -TimeoutSec 15
  Write-Host "Health: $($resp.status)" -ForegroundColor Green
} catch {
  Write-Host "Health check pending; try again in ~30s: $serviceUrl/health" -ForegroundColor Yellow
}

Write-Host "\nNext: set Render backend env COMPILER_SERVICE_URL to $serviceUrl and redeploy." -ForegroundColor Cyan
