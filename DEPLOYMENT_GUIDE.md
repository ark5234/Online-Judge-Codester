# 🚀 Codester Online Judge - Deployment Guide

This guide will help you deploy your Codester Online Judge system to production using:
- **Frontend**: Vercel (already deployed)
- **Backend**: Render
- **Compiler**: AWS ECR/EC2 (standalone service)

## 📋 Prerequisites

### Required Accounts
- [Vercel](https://vercel.com) (for frontend)
- [Render](https://render.com) (for backend)
- [AWS](https://aws.amazon.com) (for compiler)
- [MongoDB Atlas](https://mongodb.com/atlas) (for database)
- [Redis Cloud](https://redis.com) (for caching)

### Required Tools
- AWS CLI
- Docker
- Git

## 🏗️ Architecture Overview

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

## 📁 Project Structure

```
Online-Judge-Codester/
├── frontend/              # React app (Vercel)
├── backend/
│   └── server/           # Node.js API (Render)
├── compiler-service/      # Python Flask compiler (AWS EC2)
└── DEPLOYMENT_GUIDE.md   # This guide
```

## 🎯 Step-by-Step Deployment

### 1. 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create a new cluster (M0 Free tier is fine)
   - Get your connection string

2. **Set up Redis Cloud**
   - Go to [Redis Cloud](https://redis.com)
   - Create a free database
   - Get your Redis URL

### 2. 🔧 Backend Deployment (Render)

1. **Prepare Backend for Render**
   ```bash
   cd backend/server
   ```

2. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New Web Service"
   - Connect your GitHub repository
   - Select the `backend/server` directory
   - Configure:
     - **Name**: `codester-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Port**: `10000`

4. **Set Environment Variables in Render**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codester
   REDIS_URL=redis://username:password@host:port
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   COMPILER_SERVICE_URL=https://your-compiler-domain.com
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend.onrender.com`

### 3. 🐳 Compiler Deployment (AWS ECR/EC2)

#### Option A: ECR + EC2 (Recommended)

1. **Set up AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region
   ```

2. **Build and Push to ECR**
   ```bash
   cd compiler-service
   chmod +x ecr-deploy.sh
   ./ecr-deploy.sh
   ```

3. **Launch EC2 Instance**
   - Go to AWS Console → EC2
   - Launch Instance:
     - **AMI**: Ubuntu 22.04 LTS
     - **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
     - **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (Compiler)
     - **Key Pair**: Create or use existing

4. **Deploy Compiler on EC2**
   ```bash
   # SSH to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Clone your repository
   git clone https://github.com/your-username/Online-Judge-Codester.git
   cd Online-Judge-Codester/compiler-service

   # Run the deployment script
   chmod +x ec2-deploy.sh
   ./ec2-deploy.sh
   ```

5. **Set up Domain and SSL**
   - Point your domain to EC2 IP
   - Install Certbot for SSL:
     ```bash
     sudo apt install certbot python3-certbot-nginx
     sudo certbot --nginx -d your-compiler-domain.com
     ```

#### Option B: Direct EC2 Deployment

1. **Launch EC2 Instance** (same as above)

2. **Deploy Directly**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Clone your repository
   git clone https://github.com/your-username/Online-Judge-Codester.git
   cd Online-Judge-Codester/compiler-service
   
   # Run deployment
   chmod +x ec2-deploy.sh
   ./ec2-deploy.sh
   ```

### 4. 🔗 Frontend Configuration

1. **Update Environment Variables**
   - Go to your Vercel project settings
   - Add environment variables:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_COMPILER_URL=https://your-compiler-domain.com
   ```

2. **Redeploy Frontend**
   ```bash
   # Push changes to trigger Vercel deployment
   git add .
   git commit -m "Update production URLs"
   git push
   ```

## 🔧 Configuration Files

### Backend Environment Variables
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codester
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
COMPILER_SERVICE_URL=https://your-compiler-domain.com
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables
```env
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_COMPILER_URL=https://your-compiler-domain.com
```

## 🧪 Testing Your Deployment

### 1. Health Checks
```bash
# Backend health
curl https://your-backend.onrender.com/api/health

# Compiler health
curl https://your-compiler-domain.com/health
```

### 2. Test Code Execution
```python
# Test Python code
curl -X POST https://your-compiler-domain.com/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python",
    "input": ""
  }'
```

### 3. Test Frontend
- Visit your Vercel frontend URL
- Try the code editor
- Test code execution
- Test AI review

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit secrets to Git
- Use environment variables for all sensitive data
- Rotate secrets regularly

### 2. CORS Configuration
- Only allow your frontend domain
- Configure CORS properly in backend

### 3. Rate Limiting
- Backend already has rate limiting
- Consider additional DDoS protection

### 4. SSL/TLS
- All services should use HTTPS
- Set up SSL certificates for all domains

## 📊 Monitoring and Logs

### 1. Render Logs
- View logs in Render dashboard
- Set up alerts for errors

### 2. EC2 Monitoring
```bash
# Check compiler service status
sudo systemctl status codester-compiler

# View logs
sudo journalctl -u codester-compiler -f

# Check Docker containers
docker ps
docker logs codester-compiler
```

### 3. Health Monitoring
- Set up uptime monitoring
- Monitor response times
- Set up error alerts

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Issues**
   - Check MongoDB connection string
   - Verify Redis URL
   - Check CORS configuration

2. **Compiler Not Working**
   - Check EC2 security groups
   - Verify Docker is running
   - Check compiler logs

3. **Frontend Not Loading**
   - Check environment variables
   - Verify backend URLs
   - Check browser console for errors

### Debug Commands
```bash
# Check backend health
curl https://your-backend.onrender.com/api/health

# Check compiler health
curl https://your-compiler-domain.com/health

# Test code execution
curl -X POST https://your-compiler-domain.com/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"test\")", "language": "python"}'
```

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Compiler deployed on AWS EC2
- [ ] Frontend updated with production URLs
- [ ] All environment variables set
- [ ] SSL certificates configured
- [ ] Health checks passing
- [ ] Code execution working
- [ ] AI review working
- [ ] Monitoring set up

## 📞 Support

If you encounter issues:
1. Check the logs for each service
2. Verify all environment variables
3. Test each component individually
4. Check network connectivity
5. Review security group configurations

Your Codester Online Judge is now ready for production! 🚀 