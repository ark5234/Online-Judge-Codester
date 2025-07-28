$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer mock-jwt-token-for-testing"
}

$body = @{
    problemId = "688770f6594389b6e566d02f"
    code = "print('Hello World')"
    language = "python"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/submissions" -Method POST -Headers $headers -Body $body
    Write-Host "Success: $($response.Content)"
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Content: $($_.Exception.Response.Content)"
    Write-Host "Error Message: $($_.Exception.Message)"
} 