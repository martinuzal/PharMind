# Script para probar el endpoint de sincronización actualizado
# Requiere PowerShell 7+

$baseUrl = "http://localhost:5209/api"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "TEST SYNC ENDPOINT - PHARMIND API" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login para obtener token
Write-Host "[1/2] Probando login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@pharmind.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token

    if ($token) {
        Write-Host "  ✓ Login exitoso - Token obtenido" -ForegroundColor Green
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
    } else {
        Write-Host "  ✗ Error: No se recibió token" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Sync endpoint
Write-Host "[2/2] GET /api/mobile/sync - Sincronización completa..." -ForegroundColor Yellow
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"  # From seed data
    $syncResponse = Invoke-RestMethod -Uri "$baseUrl/mobile/sync?agenteId=$agenteId" -Method GET -Headers $headers

    Write-Host ""
    Write-Host "  ✓ Sincronización exitosa" -ForegroundColor Green
    Write-Host ""
    Write-Host "  === DATOS ANTIGUOS ===" -ForegroundColor White
    Write-Host "  - Relaciones: $($syncResponse.totalRelaciones)" -ForegroundColor Gray
    Write-Host "  - Interacciones: $($syncResponse.totalInteracciones)" -ForegroundColor Gray
    Write-Host "  - Clientes: $($syncResponse.totalClientes)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  === NUEVOS MÓDULOS ===" -ForegroundColor White
    Write-Host "  - Productos: $($syncResponse.totalProductos)" -ForegroundColor Yellow
    Write-Host "  - Inventarios: $($syncResponse.totalInventarios)" -ForegroundColor Yellow
    Write-Host "  - Citas: $($syncResponse.totalCitas)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Fecha sincronización: $($syncResponse.fechaSincronizacion)" -ForegroundColor Gray

    # Mostrar ejemplos
    if ($syncResponse.productos -and $syncResponse.productos.Count -gt 0) {
        Write-Host ""
        Write-Host "  Ejemplo de Producto:" -ForegroundColor Cyan
        Write-Host "    - $($syncResponse.productos[0].nombre) ($($syncResponse.productos[0].categoria))" -ForegroundColor Gray
    }

    if ($syncResponse.inventarios -and $syncResponse.inventarios.Count -gt 0) {
        Write-Host ""
        Write-Host "  Ejemplo de Inventario:" -ForegroundColor Cyan
        $inv = $syncResponse.inventarios[0]
        Write-Host "    - $($inv.producto.nombre): $($inv.cantidadDisponible) disponibles" -ForegroundColor Gray
    }

    if ($syncResponse.citas -and $syncResponse.citas.Count -gt 0) {
        Write-Host ""
        Write-Host "  Ejemplo de Cita:" -ForegroundColor Cyan
        Write-Host "    - $($syncResponse.citas[0].titulo) - $($syncResponse.citas[0].estado)" -ForegroundColor Gray
    }

} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Detalle: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
