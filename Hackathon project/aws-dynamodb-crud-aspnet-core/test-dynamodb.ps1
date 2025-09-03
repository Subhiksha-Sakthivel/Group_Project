# Test DynamoDB Local Connection
Write-Host "Testing DynamoDB Local Connection..." -ForegroundColor Green

# Test if DynamoDB Local is accessible
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/shell" -Method POST -ErrorAction Stop
    Write-Host "✓ DynamoDB Local is accessible on port 8000" -ForegroundColor Green
} catch {
    Write-Host "✗ DynamoDB Local is not accessible on port 8000" -ForegroundColor Red
    Write-Host "Make sure Docker is running and DynamoDB Local container is started" -ForegroundColor Yellow
    Write-Host "Run: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Test if we can list tables (should be empty initially)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000" -Method POST -Body '{"TableNames":[]}' -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ DynamoDB Local is responding to requests" -ForegroundColor Green
} catch {
    Write-Host "✗ DynamoDB Local is not responding properly" -ForegroundColor Red
    exit 1
}

Write-Host "`nDynamoDB Local is ready!" -ForegroundColor Green
Write-Host "You can now run your .NET application with: dotnet run" -ForegroundColor Cyan
