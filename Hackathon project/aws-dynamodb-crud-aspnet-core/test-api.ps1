# Test API Endpoints
Write-Host "Testing API Endpoints..." -ForegroundColor Green

$baseUrl = "http://localhost:5214"

# Test 1: Get all mappings
Write-Host "`n1. Testing GET /api/Mappings..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/Mappings" -Method GET -ErrorAction Stop
    Write-Host "✓ Successfully retrieved mappings. Count: $($response.Count)" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "   First mapping: $($response[0].Operation) - $($response[0].Status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to get mappings: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get table view
Write-Host "`n2. Testing GET /api/Mappings/table..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/Mappings/table" -Method GET -ErrorAction Stop
    Write-Host "✓ Successfully retrieved table view. Count: $($response.Count)" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "   First item: $($response[0].Operation) - $($response[0].Status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to get table view: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get specific mapping
Write-Host "`n3. Testing GET /api/Mappings/1..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/Mappings/1" -Method GET -ErrorAction Stop
    Write-Host "✓ Successfully retrieved mapping with ID 1" -ForegroundColor Green
    Write-Host "   Operation: $($response.Operation), Status: $($response.Status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to get mapping by ID: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green
Write-Host "If all tests passed, your DynamoDB Local setup is working correctly!" -ForegroundColor Cyan
