# 🧪 Local Services Test Script
# This script tests all services to ensure they're working correctly

Write-Host "🧪 Testing Codester Online Judge Local Services..." -ForegroundColor Green
Write-Host ""

# Function to test HTTP endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$ServiceName,
        [string]$ExpectedMessage
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        Write-Host "✅ $ServiceName is running" -ForegroundColor Green
        if ($ExpectedMessage -and $response.message) {
            Write-Host "   Message: $($response.message)" -ForegroundColor Gray
        }
        return $true
    } catch {
        Write-Host "❌ $ServiceName test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test code execution
function Test-CodeExecution {
    param(
        [string]$Language,
        [string]$Code,
        [string]$ExpectedOutput
    )
    
    $payload = @{
        code = $Code
        language = $Language
        input = ""
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/execute" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 30
        Write-Host "✅ $Language code execution successful" -ForegroundColor Green
        if ($response.output) {
            Write-Host "   Output: $($response.output)" -ForegroundColor Gray
        }
        return $true
    } catch {
        Write-Host "❌ $Language code execution failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test backend health
Write-Host "🔧 Testing Backend..." -ForegroundColor Yellow
$backendOk = Test-Endpoint -Url "http://localhost:10000/api/health" -ServiceName "Backend" -ExpectedMessage "Production Backend is running!"

# Test compiler health
Write-Host ""
Write-Host "🐳 Testing Compiler..." -ForegroundColor Yellow
$compilerOk = Test-Endpoint -Url "http://localhost:8000/health" -ServiceName "Compiler" -ExpectedMessage "Compiler service is running"

# Test frontend
Write-Host ""
Write-Host "🌐 Testing Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 10
    Write-Host "✅ Frontend is running" -ForegroundColor Green
    $frontendOk = $true
} catch {
    Write-Host "❌ Frontend test failed: $($_.Exception.Message)" -ForegroundColor Red
    $frontendOk = $false
}

# Test code execution for different languages
Write-Host ""
Write-Host "💻 Testing Code Execution..." -ForegroundColor Yellow

$languages = @(
    @{ Name = "Python"; Code = "print('Hello from Python!')" },
    @{ Name = "JavaScript"; Code = "console.log('Hello from JavaScript!');" },
    @{ Name = "Java"; Code = "public class Main { public static void main(String[] args) { System.out.println('Hello from Java!'); } }" },
    @{ Name = "C++"; Code = "#include <iostream>`nint main() { std::cout << 'Hello from C++!' << std::endl; return 0; }" }
)

$executionTests = @()

foreach ($lang in $languages) {
    $result = Test-CodeExecution -Language $lang.Name.ToLower() -Code $lang.Code
    $executionTests += $result
}

# Summary
Write-Host ""
Write-Host "📊 Test Summary:" -ForegroundColor Cyan
Write-Host "   Backend:     $(if ($backendOk) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($backendOk) { 'Green' } else { 'Red' })
Write-Host "   Compiler:    $(if ($compilerOk) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($compilerOk) { 'Green' } else { 'Red' })
Write-Host "   Frontend:    $(if ($frontendOk) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($frontendOk) { 'Green' } else { 'Red' })

$passedTests = ($executionTests | Where-Object { $_ -eq $true }).Count
$totalTests = $executionTests.Count
Write-Host "   Code Exec:   $passedTests/$totalTests languages working" -ForegroundColor $(if ($passedTests -eq $totalTests) { 'Green' } else { 'Yellow' })

# Overall result
$allServicesOk = $backendOk -and $compilerOk -and $frontendOk
$allCodeExecutionOk = $passedTests -eq $totalTests

if ($allServicesOk -and $allCodeExecutionOk) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Your local environment is ready for development." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
    Write-Host "   2. Test the code editor and features" -ForegroundColor White
    Write-Host "   3. Try different programming languages" -ForegroundColor White
    Write-Host "   4. Test AI review functionality" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ Some tests failed. Please check the services and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
    if (-not $backendOk) {
        Write-Host "   - Backend: Check if it's running on port 10000" -ForegroundColor White
    }
    if (-not $compilerOk) {
        Write-Host "   - Compiler: Check if Docker is running and compiler is started" -ForegroundColor White
    }
    if (-not $frontendOk) {
        Write-Host "   - Frontend: Check if it's running on port 5173" -ForegroundColor White
    }
    if ($passedTests -lt $totalTests) {
        Write-Host "   - Code Execution: Check compiler logs for errors" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 