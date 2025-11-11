# Script para probar los nuevos endpoints de Productos y Citas
# Requiere PowerShell 7+

$baseUrl = "http://localhost:5209/api"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE ENDPOINTS - PHARMIND API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login para obtener token
Write-Host "[1/6] Probando login..." -ForegroundColor Yellow
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
    Write-Host "  Intentando sin autenticación..." -ForegroundColor Yellow
    $headers = @{ "Content-Type" = "application/json" }
}

Write-Host ""

# Test 2: GET /api/productos
Write-Host "[2/6] GET /api/productos - Listar productos..." -ForegroundColor Yellow
try {
    $productos = Invoke-RestMethod -Uri "$baseUrl/productos" -Method GET -Headers $headers
    Write-Host "  ✓ Productos obtenidos: $($productos.Count)" -ForegroundColor Green
    if ($productos.Count -gt 0) {
        Write-Host "  - Ejemplo: $($productos[0].nombre) ($($productos[0].codigoProducto))" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: GET /api/productos/buscar?q=para
Write-Host "[3/6] GET /api/productos/buscar?q=para - Buscar productos..." -ForegroundColor Yellow
try {
    $resultados = Invoke-RestMethod -Uri "$baseUrl/productos/buscar?q=para" -Method GET -Headers $headers
    Write-Host "  ✓ Resultados encontrados: $($resultados.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: GET /api/inventarios/agente/{agenteId}
Write-Host "[4/6] GET /api/inventarios/agente/{id} - Inventario de agente..." -ForegroundColor Yellow
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"  # From seed data
    $inventario = Invoke-RestMethod -Uri "$baseUrl/inventarios/agente/$agenteId" -Method GET -Headers $headers
    Write-Host "  ✓ Items en inventario: $($inventario.Count)" -ForegroundColor Green
    if ($inventario.Count -gt 0) {
        Write-Host "  - Ejemplo: $($inventario[0].productoNombre) - Disponible: $($inventario[0].cantidadDisponible)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: GET /api/citas?agenteId={id}
Write-Host "[5/6] GET /api/citas?agenteId={id} - Citas de agente..." -ForegroundColor Yellow
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"  # From seed data
    $citas = Invoke-RestMethod -Uri "$baseUrl/citas?agenteId=$agenteId" -Method GET -Headers $headers
    Write-Host "  ✓ Citas encontradas: $($citas.Count)" -ForegroundColor Green
    if ($citas.Count -gt 0) {
        Write-Host "  - Ejemplo: $($citas[0].titulo) - Estado: $($citas[0].estado)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: GET /api/productos/categorias
Write-Host "[6/6] GET /api/productos/categorias - Listar categorías..." -ForegroundColor Yellow
try {
    $categorias = Invoke-RestMethod -Uri "$baseUrl/productos/categorias" -Method GET -Headers $headers
    Write-Host "  ✓ Categorías encontradas: $($categorias.Count)" -ForegroundColor Green
    Write-Host "  - Categorías: $($categorias -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: GET /api/mobile/sync
Write-Host "[EXTRA] GET /api/mobile/sync - Endpoint de sincronización..." -ForegroundColor Magenta
try {
    $agenteId = "0c085853-9ece-4d5f-959c-63611183d366"
    $syncResponse = Invoke-RestMethod -Uri "$baseUrl/mobile/sync?agenteId=$agenteId" -Method GET -Headers $headers
    Write-Host "  ✓ Sincronización exitosa" -ForegroundColor Green
    Write-Host "  - Relaciones: $($syncResponse.totalRelaciones)" -ForegroundColor Gray
    Write-Host "  - Interacciones: $($syncResponse.totalInteracciones)" -ForegroundColor Gray
    Write-Host "  - Clientes: $($syncResponse.totalClientes)" -ForegroundColor Gray
    Write-Host "  - Productos (NUEVO): $($syncResponse.totalProductos)" -ForegroundColor Yellow
    Write-Host "  - Inventarios (NUEVO): $($syncResponse.totalInventarios)" -ForegroundColor Yellow
    Write-Host "  - Citas (NUEVO): $($syncResponse.totalCitas)" -ForegroundColor Yellow
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
