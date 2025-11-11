try {
    $response = Invoke-WebRequest -Uri "http://localhost:5209/api/mobile/relaciones?agenteId=A001&incluirFrecuencia=true" -Method GET -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json

    Write-Host "========================================="
    Write-Host "TEST: API Mobile - Relaciones con Frecuencia"
    Write-Host "========================================="
    Write-Host ""
    Write-Host "Total relaciones: $($data.Count)"
    Write-Host ""

    $conFrecuencia = ($data | Where-Object { $_.frecuencia -ne $null }).Count
    $sinFrecuencia = ($data | Where-Object { $_.frecuencia -eq $null }).Count

    Write-Host "Con frecuencia: $conFrecuencia"
    Write-Host "Sin frecuencia: $sinFrecuencia"
    Write-Host ""
    Write-Host "Primeras 5 relaciones:"
    Write-Host ""

    $data | Select-Object -First 5 | ForEach-Object {
        if ($_.frecuencia) {
            Write-Host "  ✅ $($_.codigoRelacion): Estado=$($_.frecuencia.estado), $($_.frecuencia.interaccionesRealizadas)/$($_.frecuencia.frecuenciaObjetivo) visitas"
        } else {
            Write-Host "  ❌ $($_.codigoRelacion): Sin frecuencia (FrecuenciaVisitas=$($_.frecuenciaVisitas))"
        }
    }

    Write-Host ""
    Write-Host "========================================="
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Message
}
