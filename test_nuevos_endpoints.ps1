# Script simple para probar los 3 nuevos endpoints
$baseUrl = "http://localhost:5209/api"

Write-Host "=== PROBANDO NUEVOS ENDPOINTS ===" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "[1] Login..." -ForegroundColor Yellow
$loginBody = @{ email = "admin@pharmind.com"; password = "Admin123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Write-Host "  Token OK" -ForegroundColor Green
Write-Host ""

# Test Productos
Write-Host "[2] GET /api/productos..." -ForegroundColor Yellow
try {
    $productos = Invoke-RestMethod -Uri "$baseUrl/productos" -Method GET -Headers $headers
    Write-Host "  OK - Total: $($productos.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Inventarios
Write-Host "[3] GET /api/inventarios/agente/{id}..." -ForegroundColor Yellow
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"
    $inventarios = Invoke-RestMethod -Uri "$baseUrl/inventarios/agente/$agenteId" -Method GET -Headers $headers
    Write-Host "  OK - Total: $($inventarios.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Citas
Write-Host "[4] GET /api/citas?agenteId={id}..." -ForegroundColor Yellow
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"
    $citas = Invoke-RestMethod -Uri "$baseUrl/citas?agenteId=$agenteId" -Method GET -Headers $headers
    Write-Host "  OK - Total: $($citas.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""
Write-Host "=== PRUEBAS COMPLETADAS ===" -ForegroundColor Cyan
