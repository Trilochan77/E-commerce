# ==============================================================================
# E-Commerce Microservices Orchestrator — Native (No Docker) Stop Script
# ==============================================================================
param(
    [switch]$IncludeEureka = $false
)

$backendPorts = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)
if ($IncludeEureka) {
    $backendPorts += 8761
}

Write-Host "`nStopping native backend services on ports: $($backendPorts -join ', ')..." -ForegroundColor Cyan

$conns = Get-NetTCPConnection -LocalPort $backendPorts -State Listen -ErrorAction SilentlyContinue

if (-not $conns) {
    Write-Host "No services currently listening on backend ports." -ForegroundColor Yellow
    return
}

$pidsToKill = $conns | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($procId in $pidsToKill) {
    try {
        $p = Get-Process -Id $procId -ErrorAction Stop
        Write-Host "  Stopping process $($p.ProcessName) (PID $procId)..." -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    } catch {
        # Process might already be stopped
    }
}

Write-Host "Done. All specified backend services have been stopped.`n" -ForegroundColor Green
