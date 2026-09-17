# ==============================================================================
# E-Commerce Microservices Orchestrator — Native (No Docker) Start Script
# ==============================================================================
param(
    [ValidateSet("jar", "maven")]
    [string]$Mode = "jar",
    [switch]$KeepAlive = $false
)

$ErrorActionPreference = "Continue"
$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$logsDir = Join-Path $backendDir "logs"

if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$env:JWT_SECRET = "change-me-dev-secret-min-32-chars-long"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Starting E-Commerce Microservices (Native / No-Docker)" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# 1. MongoDB Check
Write-Host "[1/3] Checking native MongoDB (port 27017)..." -NoNewline
$mongoConn = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -WarningAction SilentlyContinue
if (-not $mongoConn.TcpTestSucceeded) {
    Write-Host " NOT RUNNING. Starting mongod..." -ForegroundColor Yellow
    $mongodPath = "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe"
    $mongodCfg = "C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"
    if (Test-Path $mongodPath) {
        Start-Process -FilePath $mongodPath -ArgumentList "--config `"$mongodCfg`"" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    } else {
        Write-Warning "Could not find mongod at standard path. Please start MongoDB manually."
    }
} else {
    Write-Host " RUNNING" -ForegroundColor Green
}

# 2. Services Configuration
$services = @(
    @{ Name = "eureka-server";         Port = 8761; Jar = "eureka-server\target\eureka-server.jar" },
    @{ Name = "api-gateway";           Port = 8080; Jar = "api-gateway\target\api-gateway.jar" },
    @{ Name = "user-service";          Port = 8081; Jar = "user-service\target\user-service.jar" },
    @{ Name = "product-service";       Port = 8082; Jar = "product-service\target\product-service.jar" },
    @{ Name = "search-service";        Port = 8083; Jar = "search-service\target\search-service.jar" },
    @{ Name = "recommendation-service"; Port = 8084; Jar = "recommendation-service\target\recommendation-service.jar" },
    @{ Name = "cart-service";          Port = 8085; Jar = "cart-service\target\cart-service.jar" },
    @{ Name = "order-service";         Port = 8086; Jar = "order-service\target\order-service.jar" },
    @{ Name = "return-reward-service"; Port = 8087; Jar = "return-reward-service\target\return-reward-service.jar" }
)

Write-Host "`n[2/3] Launching backend microservices (Logs in backend/logs/)..." -ForegroundColor Cyan

foreach ($svc in $services) {
    $port = $svc.Port
    $name = $svc.Name
    $logFile = Join-Path $logsDir "$name.log"
    $logErr = Join-Path $logsDir "$name.err.log"

    # Check if already listening
    $active = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
    if ($active.TcpTestSucceeded) {
        Write-Host ("  [ALREADY RUNNING] {0,-25} on port {1}" -f $name, $port) -ForegroundColor Green
        continue
    }

    $jarRelative = $svc.Jar
    $jarFull = Join-Path $backendDir $jarRelative

    if ($Mode -eq "jar" -and (Test-Path $jarFull)) {
        Write-Host ("  [STARTING JAR]    {0,-25} (port {1})..." -f $name, $port)
        $cmdArgs = "/c start /b `"`" java -Xmx256m -jar `"$jarFull`" > `"$logFile`" 2>&1"
        Start-Process -FilePath "cmd.exe" -ArgumentList $cmdArgs -WorkingDirectory (Split-Path $jarFull) -WindowStyle Hidden
    } else {
        Write-Host ("  [STARTING MAVEN]  {0,-25} (port {1})..." -f $name, $port)
        $cmdArgs = "/c start /b `"`" mvn -q -pl $name spring-boot:run > `"$logFile`" 2>&1"
        Start-Process -FilePath "cmd.exe" -ArgumentList $cmdArgs -WorkingDirectory $backendDir -WindowStyle Hidden
    }

    # Small pause between starting gateway/core to let discovery register smoothly
    if ($name -eq "eureka-server") { Start-Sleep -Seconds 5 }
    else { Start-Sleep -Seconds 1 }
}

Write-Host "`n[3/3] Waiting for services to initialize..." -ForegroundColor Cyan
$maxWaitSec = 120
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

while ($stopwatch.Elapsed.TotalSeconds -lt $maxWaitSec) {
    $allUp = $true
    foreach ($svc in $services) {
        $check = Test-NetConnection -ComputerName 127.0.0.1 -Port $svc.Port -WarningAction SilentlyContinue
        if (-not $check.TcpTestSucceeded) {
            $allUp = $false
        }
    }
    if ($allUp) { break }
    Start-Sleep -Seconds 3
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Status Check" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
foreach ($svc in $services) {
    $t = Test-NetConnection -ComputerName 127.0.0.1 -Port $svc.Port -WarningAction SilentlyContinue
    $statusText = if ($t.TcpTestSucceeded) { "ONLINE" } else { "STARTING (check logs/$($svc.Name).log)" }
    $color = if ($t.TcpTestSucceeded) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-26} : Port {1,-5} : {2}" -f $svc.Name, $svc.Port, $statusText) -ForegroundColor $color
}

Write-Host "`nFrontend is available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Eureka dashboard at:      http://localhost:8761" -ForegroundColor Green
Write-Host "API Gateway at:           http://localhost:8080" -ForegroundColor Green
Write-Host "To stop all services:     .\stop-backend.ps1`n" -ForegroundColor Yellow

if ($KeepAlive) {
    Write-Host "Services running as daemon. Press Ctrl+C to terminate." -ForegroundColor Cyan
    while ($true) { Start-Sleep -Seconds 60 }
}
