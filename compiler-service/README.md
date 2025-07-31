# 🐳 Codester Compiler Service

A standalone microservice for code compilation and execution, designed to be deployed on AWS EC2/ECR.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Compiler      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (AWS EC2)     │
│                 │    │                 │    │                 │
│ - React App     │    │ - Node.js API   │    │ - Python Flask  │
│ - Code Editor   │    │ - MongoDB       │    │ - Docker        │
│ - UI/UX         │    │ - Redis         │    │ - Multi-lang    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Supported Languages

- **Python** (3.9)
- **JavaScript** (Node.js)
- **Java** (OpenJDK 11)
- **C++** (GCC)
- **C** (GCC)
- **C#** (.NET)
- **PHP** (8.0)
- **Ruby** (3.0)
- **Go** (1.19)
- **Rust** (1.70)

## 📁 Project Structure

```
compiler-service/
├── compiler.py          # Main Flask application
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose for local dev
├── ec2-deploy.sh       # EC2 deployment script
├── ecr-deploy.sh       # ECR build and push script
└── README.md           # This file
```

## 🔧 API Endpoints

### Health Check
```bash
GET /health
```

### Execute Code
```bash
POST /execute
Content-Type: application/json

{
  "code": "print('Hello, World!')",
  "language": "python",
  "input": "optional input"
}
```

### Compile Code
```bash
POST /compile
Content-Type: application/json

{
  "code": "#include <iostream>\nint main() { std::cout << \"Hello\"; return 0; }",
  "language": "cpp"
}
```

## 🐳 Local Development

### Using Docker Compose
```bash
cd compiler-service
docker-compose up --build
```

### Direct Docker
```bash
cd compiler-service
docker build -t codester-compiler .
docker run -p 8000:8000 codester-compiler
```

## ☁️ Production Deployment

### Option 1: AWS ECR + EC2 (Recommended)

1. **Build and push to ECR**
   ```bash
   cd compiler-service
   chmod +x ecr-deploy.sh
   ./ecr-deploy.sh
   ```

2. **Deploy on EC2**
   ```bash
   # SSH to your EC2 instance
   chmod +x ec2-deploy.sh
   ./ec2-deploy.sh
   ```

### Option 2: Direct EC2 Deployment

1. **Launch EC2 instance** (Ubuntu 22.04, t3.medium)
2. **Clone repository** and run deployment script
3. **Set up domain** and SSL certificate

## 🔒 Security Features

- **Docker isolation** for code execution
- **Resource limits** (CPU, memory, time)
- **File system isolation** with volumes
- **Process isolation** with Docker containers
- **Input validation** and sanitization

## 📊 Monitoring

### Health Check
```bash
curl https://your-compiler-domain.com/health
```

### Logs
```bash
# Docker logs
docker logs codester-compiler

# System logs
sudo journalctl -u codester-compiler -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Docker not running**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Port already in use**
   ```bash
   sudo lsof -i :8000
   sudo kill -9 <PID>
   ```

3. **Permission issues**
   ```bash
   sudo chown -R $USER:$USER /opt/codester-compiler
   ```

## 📞 Support

For issues or questions:
1. Check the logs: `docker logs codester-compiler`
2. Verify Docker is running: `docker ps`
3. Test health endpoint: `curl /health`
4. Check resource usage: `docker stats`

## 🎯 Next Steps

1. Deploy to AWS EC2
2. Set up domain and SSL
3. Configure backend to use compiler URL
4. Test code execution
5. Set up monitoring and alerts 