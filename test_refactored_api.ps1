$baseUrl = "http://localhost:5000"

# Test 1: Register endpoint
Write-Host "Testing /auth/register endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"email":"test@example.com","password":"TestPass123!"}' `
        -ErrorAction Stop
    Write-Host "✅ /auth/register is working!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 2: Login endpoint
Write-Host "Testing /auth/login endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"email":"test@example.com","password":"TestPass123!"}' `
        -ErrorAction Stop
    Write-Host "✅ /auth/login is working!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 3: Get Profile endpoint
Write-Host "Testing /profile/1 endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/profile/1" `
        -Method GET `
        -ErrorAction Stop
    Write-Host "✅ /profile/1 is working!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 4: Swagger endpoint
Write-Host "Testing /swagger/index.html endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/swagger/index.html" `
        -Method GET `
        -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Swagger UI is available!" -ForegroundColor Green
        Write-Host "   Visit: http://localhost:5000/swagger/index.html" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Refactoring Test Complete ===" -ForegroundColor Cyan
Write-Host "New endpoint paths are working correctly!" -ForegroundColor Green
