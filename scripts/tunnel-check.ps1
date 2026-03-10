param(
  [int]$TunnelPort = 5433,
  [string]$HealthUrl = "http://localhost:3000/api/health/db",
  [switch]$StartIfMissing
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Info([string]$msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Pass([string]$msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-WarnMsg([string]$msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail([string]$msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red }

function Test-Port([int]$port) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  return $null -ne $conn
}

function Start-TunnelBackground {
  $scriptPath = Join-Path $PSScriptRoot "..\tunnel.ps1"
  $fullPath = (Resolve-Path $scriptPath).Path
  Write-Info "Starting tunnel from $fullPath"
  $process = Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$fullPath`""
  ) -WindowStyle Minimized -PassThru
  return $process
}

function Test-Health([string]$url) {
  try {
    $resp = Invoke-RestMethod $url -TimeoutSec 10
    if ($resp.ok -eq $true) {
      Write-Pass "API health endpoint is OK: $url"
      return $true
    }
    Write-WarnMsg "API health returned ok=false"
    return $false
  } catch {
    Write-WarnMsg "API health check failed: $($_.Exception.Message)"
    return $false
  }
}

Write-Info "Checking local tunnel on port $TunnelPort"
$hasTunnel = Test-Port -port $TunnelPort

if ($hasTunnel) {
  Write-Pass "Tunnel is active on 127.0.0.1:$TunnelPort"
} else {
  Write-WarnMsg "Tunnel is not active on 127.0.0.1:$TunnelPort"

  if ($StartIfMissing) {
    $proc = Start-TunnelBackground
    Start-Sleep -Seconds 3

    if (Test-Port -port $TunnelPort) {
      Write-Pass "Tunnel started successfully (PID $($proc.Id))"
    } else {
      Write-Fail "Tunnel did not start. Run .\\tunnel.ps1 manually to inspect errors."
      exit 1
    }
  } else {
    Write-Info "Use -StartIfMissing to auto-start the tunnel"
    exit 1
  }
}

Test-Health -url $HealthUrl | Out-Null

Write-Host ""
Write-Host "Commands:" -ForegroundColor Gray
Write-Host "  Check only:  .\\scripts\\tunnel-check.ps1" -ForegroundColor Gray
Write-Host "  Auto-start:  .\\scripts\\tunnel-check.ps1 -StartIfMissing" -ForegroundColor Gray
