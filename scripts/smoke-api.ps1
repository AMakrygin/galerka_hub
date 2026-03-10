param(
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Assert-Ok($Name, $Condition, $Details) {
  if ($Condition) {
    Write-Host "[PASS] $Name" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] $Name :: $Details" -ForegroundColor Red
    throw "$Name failed"
  }
}

function Get-Json([string]$Path) {
  return Invoke-RestMethod "$BaseUrl$Path" -Method GET -TimeoutSec 15
}

function Post-Json([string]$Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 10
  return Invoke-RestMethod "$BaseUrl$Path" -Method POST -ContentType "application/json" -Body $json -TimeoutSec 15
}

function Patch-Json([string]$Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 10
  return Invoke-RestMethod "$BaseUrl$Path" -Method PATCH -ContentType "application/json" -Body $json -TimeoutSec 15
}

Write-Host "=== Smoke API started: $BaseUrl ===" -ForegroundColor Cyan

$readEndpoints = @(
  "/api/props?status=available",
  "/api/props?status=IN_STORAGE",
  "/api/containers",
  "/api/actors",
  "/api/assignments",
  "/api/write-offs",
  "/api/activities?limit=5",
  "/api/dashboard/summary",
  "/api/dashboard/prop-usage",
  "/api/dashboard/utilization",
  "/api/dashboard/monthly-activity"
)

foreach ($ep in $readEndpoints) {
  try {
    $resp = Get-Json $ep
    Assert-Ok "GET $ep" ($resp.ok -eq $true) "ok != true"
  } catch {
    Write-Host "[FAIL] GET $ep :: $($_.Exception.Message)" -ForegroundColor Red
    throw
  }
}

$containersResp = Get-Json "/api/containers"
$container = $containersResp.data.containers | Select-Object -First 1
Assert-Ok "Container exists" ($null -ne $container) "No containers in DB"

$actorsResp = Get-Json "/api/actors"
$actor = $actorsResp.data.actors | Select-Object -First 1
Assert-Ok "Actor exists" ($null -ne $actor) "No actors in DB"

$stamp = [DateTime]::UtcNow.ToString("yyyyMMddHHmmss")

$createdProp = (Post-Json "/api/props" @{
  name = "Smoke Prop $stamp"
  category = "Тест"
  description = "smoke-create"
  containerId = $container.id
  qrCode = "SMOKE-$stamp"
}).data.prop

Assert-Ok "POST /api/props" ($null -ne $createdProp.id) "Prop id is missing"

$patchedProp = (Patch-Json "/api/props/$($createdProp.id)" @{
  status = "damaged"
  description = "smoke-patched"
}).data.prop

Assert-Ok "PATCH /api/props/:id" ($patchedProp.status -eq "damaged") "Status is not damaged"

$null = Invoke-WebRequest "$BaseUrl/api/props/$($createdProp.id)" -Method DELETE -TimeoutSec 15 -UseBasicParsing
Write-Host "[PASS] DELETE /api/props/:id" -ForegroundColor Green

$assignProp = (Post-Json "/api/props" @{
  name = "Assign Prop $stamp"
  category = "Тест"
  description = "smoke-assignment"
  containerId = $container.id
  qrCode = "ASGN-$stamp"
}).data.prop

Assert-Ok "POST /api/props (assignment item)" ($null -ne $assignProp.id) "Assignment prop id is missing"

$assignment = (Post-Json "/api/assignments" @{
  propId = $assignProp.id
  actorId = $actor.id
  performance = "Smoke Performance"
  expectedReturn = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
}).data.assignment

Assert-Ok "POST /api/assignments" ($assignment.status -eq "issued") "Assignment status is not issued"

$remind = (Invoke-RestMethod "$BaseUrl/api/assignments/$($assignment.id)/remind" -Method POST -TimeoutSec 15).data.reminded
Assert-Ok "POST /api/assignments/:id/remind" ($remind -eq $true) "reminded != true"

$returned = (Post-Json "/api/assignments/$($assignment.id)/return" @{ containerId = $container.id }).data.assignment
Assert-Ok "POST /api/assignments/:id/return" ($returned.status -eq "returned") "Assignment status is not returned"

Write-Host "=== Smoke API finished successfully ===" -ForegroundColor Cyan
