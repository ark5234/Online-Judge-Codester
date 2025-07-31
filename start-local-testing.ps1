# 🧪 Local Testing Startup Script
# This script starts all services for local testing

Write-Host "🚀 Starting Codester Online Judge Local Testing..." -ForegroundColor Green

# Check if required software is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites met!" -ForegroundColor Green

# Create environment files if they don't exist
Write-Host "🔧 Setting up environment files..." -ForegroundColor Yellow

# Backend .env
$backendEnvPath = "backend/server/.env"
if (-not (Test-Path $backendEnvPath)) {
    $backendEnv = @"
NODE_ENV=development
PORT=10000
MONGO_URI=mongodb://localhost:27017/codester
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-jwt-secret-for-testing
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
COMPILER_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
"@
    $backendEnv | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}

# Frontend .env.local
$frontendEnvPath = "frontend/.env.local"
if (-not (Test-Path $frontendEnvPath)) {
    $frontendEnv = @"
VITE_BACKEND_URL=http://localhost:10000
VITE_COMPILER_URL=http://localhost:8000
"@
    $frontendEnv | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location "backend/server"
npm install
Set-Location "../../"

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "frontend"
npm install
Set-Location "../"

# Python dependencies for compiler
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
Set-Location "compiler-service"
pip install flask flask-cors psutil
Set-Location "../"

Write-Host "✅ All dependencies installed!" -ForegroundColor Green

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Yellow

# Start MongoDB and Redis with Docker (if not running)
Write-Host "Starting databases..." -ForegroundColor Cyan
try {
    docker run -d --name mongodb -p 27017:27017 mongo:latest 2>$null
    Write-Host "✅ MongoDB started" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ MongoDB already running or failed to start" -ForegroundColor Yellow
}

try {
    docker run -d --name redis -p 6379:6379 redis:latest 2>$null
    Write-Host "✅ Redis started" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Redis already running or failed to start" -ForegroundColor Yellow
}

# Start backend
Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd backend/server && npm run dev" -WindowStyle Minimized

# Start compiler
Write-Host "Starting compiler..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd compiler-service && docker-compose up --build" -WindowStyle Minimized

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd frontend && npm run dev" -WindowStyle Minimized

Write-Host "✅ All services started!" -ForegroundColor Green

# Wait a moment for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test services
Write-Host "🧪 Testing services..." -ForegroundColor Yellow

# Test backend
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:10000/api/health" -Method Get
    Write-Host "✅ Backend is running: $($backendResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend test failed. Check if it's running on port 10000" -ForegroundColor Red
}

# Test compiler
try {
    $compilerResponse = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✅ Compiler is running: $($compilerResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Compiler test failed. Check if it's running on port 8000" -ForegroundColor Red
}

# Test frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get
    Write-Host "✅ Frontend is running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend test failed. Check if it's running on port 5173" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Local testing environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:10000" -ForegroundColor White
Write-Host "   Compiler:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test commands:" -ForegroundColor Cyan
Write-Host "   Backend health:  curl http://localhost:10000/api/health" -ForegroundColor White
Write-Host "   Compiler health: curl http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed testing instructions, see LOCAL_TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 