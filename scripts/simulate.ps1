# HexaNode - Reproducible simulation script
# Prereqs: Provider running (bun run provider/start), .env with CRE_ETH_PRIVATE_KEY and DEEPSEEK_API_KEY

$ErrorActionPreference = "Stop"

Write-Host "HexaNode Simulation" -ForegroundColor Cyan
Write-Host ""

# Check .env
if (-not (Test-Path ".env")) {
    Write-Host "Missing .env - copy .env.example and add CRE_ETH_PRIVATE_KEY, DEEPSEEK_API_KEY" -ForegroundColor Red
    exit 1
}

# Optional: start provider in background if not running
$providerUrl = "http://localhost:3456"
try {
    $null = Invoke-WebRequest -Uri "$providerUrl/supply/milk" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
} catch {
    Write-Host "Provider may not be running. Start it with: cd provider && bun run start" -ForegroundColor Yellow
    Write-Host "Continuing anyway - simulation may fail at payment step..." -ForegroundColor Yellow
}

Write-Host "Running CRE workflow simulate..." -ForegroundColor Green
cre workflow simulate hexanode-workflow --target staging-settings
