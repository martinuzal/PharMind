$url = "http://localhost:5209/api/mobile/clientes?agenteId=55905530-1c75-4856-a555-4e354d595d1d"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers @{'Accept'='application/json'}
    Write-Host "SUCCESS - Status: 200"
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    }
}
