# 🧪 Local Testing Guide

This guide will help you test your Codester Online Judge system locally before deploying to production.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18+)
- **Python** (3.9+)
- **Docker** (for compiler service)
- **MongoDB** (local or Atlas)
- **Redis** (local or Cloud)

### Install Dependencies
```bash
# Install Node.js dependencies
cd backend/server
npm install

# Install Python dependencies for compiler
cd ../../compiler-service
pip install flask flask-cors psutil

# Install frontend dependencies
cd ../../frontend
npm install
```

## 🏗️ Local Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Compiler      │
│   (localhost:5173) │◄──►│   (localhost:10000) │◄──►│   (localhost:8000) │
│                 │    │                 │    │                 │
│ - React App     │    │ - Node.js API   │    │ - Python Flask  │
│ - Code Editor   │    │ - MongoDB       │    │ - Docker        │
│ - UI/UX         │    │ - Redis         │    │ - Multi-lang    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Step-by-Step Local Testing

### 1. 🗄️ Database Setup

#### Option A: Local MongoDB + Redis
```bash
# Install MongoDB (Windows)
# Download from https://www.mongodb.com/try/download/community

# Install Redis (Windows)
# Download from https://github.com/microsoftarchive/redis/releases

# Or use Docker for databases
docker run -d --name mongodb -p 27017:27017 mongo:latest
docker run -d --name redis -p 6379:6379 redis:latest
```

#### Option B: Cloud Databases (Recommended)
```bash
# Use MongoDB Atlas and Redis Cloud for consistency with production
# Update backend/server/.env with cloud URLs
```

### 2. 🔧 Backend Testing

#### Create Environment File
```bash
cd backend/server
```

Create `.env` file:
```env
NODE_ENV=development
PORT=10000
MONGO_URI=mongodb://localhost:27017/codester
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
COMPILER_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

#### Start Backend
```bash
cd backend/server
npm run dev
# Backend will run on http://localhost:10000
```

#### Test Backend Health
```bash
curl http://localhost:10000/api/health
# Should return: {"status":"OK","message":"Production Backend is running!"}
```

### 3. 🐳 Compiler Testing

#### Option A: Docker Compose (Recommended)
```bash
cd compiler-service
docker-compose up --build
# Compiler will run on http://localhost:8000
```

#### Option B: Direct Python
```bash
cd compiler-service
python3 compiler.py
# Compiler will run on http://localhost:8000
```

#### Test Compiler Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","message":"Compiler service is running"}
```

#### Test Code Execution
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python",
    "input": ""
  }'
```

### 4. 🌐 Frontend Testing

#### Create Environment File
```bash
cd frontend
```

Create `.env.local` file:
```env
VITE_BACKEND_URL=http://localhost:10000
VITE_COMPILER_URL=http://localhost:8000
```

#### Start Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

## 🧪 Comprehensive Testing

### 1. 🔍 Health Check Tests

#### Backend Health
```bash
curl http://localhost:10000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Production Backend is running!",
  "services": {
    "database": "Connected",
    "redis": "Connected",
    "ai": "Available",
    "compiler": "Connected"
  }
}
```

#### Compiler Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Compiler service is running",
  "supported_languages": ["python", "javascript", "java", "cpp", "c", "csharp", "php", "ruby", "go", "rust"]
}
```

### 2. 💻 Code Execution Tests

#### Python Test
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")\nprint(\"Python is working!\")",
    "language": "python",
    "input": ""
  }'
```

#### JavaScript Test
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, World!\");\nconsole.log(\"JavaScript is working!\");",
    "language": "javascript",
    "input": ""
  }'
```

#### C++ Test
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() { std::cout << \"Hello, World!\" << std::endl; return 0; }",
    "language": "cpp",
    "input": ""
  }'
```

### 3. 🌐 Frontend Integration Tests

1. **Open Browser**: Go to `http://localhost:5173`
2. **Test Code Editor**:
   - Switch between languages
   - Test auto-indentation
   - Test syntax highlighting
3. **Test Code Execution**:
   - Write simple code
   - Click "Run" button
   - Verify output appears
4. **Test AI Review**:
   - Click "AI Review" button
   - Verify review appears
5. **Test File Operations**:
   - Download code
   - Upload code file

### 4. 🔗 API Integration Tests

#### Test Backend API
```bash
# Get problems
curl http://localhost:10000/api/problems

# Get stats
curl http://localhost:10000/api/stats

# Submit solution
curl -X POST http://localhost:10000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "test-problem",
    "code": "print(\"Hello\")",
    "language": "python"
  }'
```

#### Test Compiler API
```bash
# Test all supported languages
for lang in python javascript java cpp c csharp php ruby go rust; do
  echo "Testing $lang..."
  curl -X POST http://localhost:8000/execute \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"print('Hello from $lang')\", \"language\": \"$lang\", \"input\": \"\"}"
done
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Won't Start
```bash
# Check if MongoDB is running
mongo --eval "db.runCommand('ping')"

# Check if Redis is running
redis-cli ping

# Check environment variables
cat backend/server/.env
```

#### 2. Compiler Won't Start
```bash
# Check Docker
docker --version
docker ps

# Check Python dependencies
pip list | grep flask

# Check if port 8000 is free
netstat -an | grep 8000
```

#### 3. Frontend Won't Connect
```bash
# Check if backend is running
curl http://localhost:10000/api/health

# Check if compiler is running
curl http://localhost:8000/health

# Check environment variables
cat frontend/.env.local
```

#### 4. Code Execution Fails
```bash
# Check Docker containers
docker ps -a

# Check compiler logs
docker logs codester-compiler

# Test simple execution
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(1+1)", "language": "python"}'
```

### Debug Commands

#### Check All Services
```bash
# Check if all services are running
echo "=== Backend ==="
curl -s http://localhost:10000/api/health | jq .

echo "=== Compiler ==="
curl -s http://localhost:8000/health | jq .

echo "=== Frontend ==="
curl -s http://localhost:5173 | head -5
```

#### Check Network Connectivity
```bash
# Test internal communication
curl -X POST http://localhost:10000/api/test-compiler \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"test\")", "language": "python"}'
```

## 📊 Performance Testing

### Load Testing
```bash
# Install Apache Bench
# Windows: Download from Apache website
# Linux: sudo apt-get install apache2-utils

# Test backend
ab -n 100 -c 10 http://localhost:10000/api/health

# Test compiler
ab -n 50 -c 5 -p test-payload.json -T application/json http://localhost:8000/execute
```

### Memory Usage
```bash
# Check Docker memory usage
docker stats

# Check Node.js memory
ps aux | grep node

# Check Python memory
ps aux | grep python
```

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Compiler starts without errors
- [ ] Frontend loads and connects
- [ ] Code execution works for all languages
- [ ] AI review functionality works
- [ ] File upload/download works
- [ ] All API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Performance is acceptable
- [ ] Error handling works properly

## 🚀 Ready for Production

Once all local tests pass:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Local testing completed - ready for production"
   git push
   ```

2. **Deploy to production** following the `DEPLOYMENT_GUIDE.md`

3. **Test production environment** with the same tests

Your Codester Online Judge is now ready for production deployment! 🎉 