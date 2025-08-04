# 🚀 Codester Online Judge - Step-by-Step Deployment

## 📋 Quick Start Checklist

### Phase 1: Database Setup (5 minutes)
- [ ] Create MongoDB Atlas cluster
- [ ] Create Redis Cloud database
- [ ] Get connection strings

### Phase 2: Backend Deployment (10 minutes)
- [ ] Deploy to Render
- [ ] Set environment variables
- [ ] Test backend health

### Phase 3: Compiler Deployment (15 minutes)
- [ ] Set up AWS EC2 instance
- [ ] Deploy compiler service
- [ ] Configure domain and SSL

### Phase 4: Frontend Configuration (5 minutes)
- [ ] Update environment variables
- [ ] Redeploy frontend
- [ ] Test complete system

---

## 🗄️ Phase 1: Database Setup

### Step 1: MongoDB Atlas
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Free)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/codester`

### Step 2: Redis Cloud
1. Go to [Redis Cloud](https://redis.com)
2. Create free account
3. Create database
4. Get Redis URL: `redis://username:password@host:port`

---

## 🔧 Phase 2: Backend Deployment (Render)

### Step 1: Prepare Repository
```bash
# Make sure your backend is ready
cd backend/server
# Check that production-server.js exists
ls production-server.js
```

### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `codester-backend`
   - **Root Directory**: `backend/server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `10000`

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codester
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
COMPILER_SERVICE_URL=https://your-compiler-domain.com
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Note your backend URL: `https://your-backend.onrender.com`

### Step 5: Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

---

## 🐳 Phase 3: Compiler Deployment (AWS EC2)

### Step 1: Launch EC2 Instance
1. Go to [AWS Console](https://aws.amazon.com)
2. Navigate to EC2 → Launch Instance
3. Configure:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
   - **Security Group**: 
     - SSH (22)
     - HTTP (80)
     - HTTPS (443)
     - Custom TCP (8000) for compiler
   - **Key Pair**: Create new or use existing

### Step 2: Connect to EC2
```bash
# Download your key file and connect
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Deploy Compiler
```bash
# On your EC2 instance
git clone https://github.com/your-username/Online-Judge-Codester.git
cd Online-Judge-Codester/compiler-service
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

### Step 4: Configure Domain (Optional)
1. Point your domain to EC2 IP
2. Install SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-compiler-domain.com
```

### Step 5: Test Compiler
```bash
curl https://your-compiler-domain.com/health
```

---

## 🔗 Phase 4: Frontend Configuration

### Step 1: Update Environment Variables
1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add:
```env
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_COMPILER_URL=https://your-compiler-domain.com
```

### Step 2: Redeploy Frontend
```bash
# Push any changes to trigger Vercel deployment
git add .
git commit -m "Update production URLs"
git push
```

---

## 🧪 Testing Your Deployment

### Test 1: Health Checks
```bash
# Backend
curl https://your-backend.onrender.com/api/health

# Compiler
curl https://your-compiler-domain.com/health
```

### Test 2: Code Execution
```bash
curl -X POST https://your-compiler-domain.com/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python",
    "input": ""
  }'
```

### Test 3: Frontend
1. Visit your Vercel frontend URL
2. Try the code editor
3. Test code execution
4. Test AI review

---

## 🔒 Security Checklist

- [ ] All environment variables set
- [ ] CORS configured properly
- [ ] SSL certificates installed
- [ ] Rate limiting enabled
- [ ] Secrets not in Git

---

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Render logs
# Go to Render dashboard → Your service → Logs

# Test backend directly
curl https://your-backend.onrender.com/api/health
```

### Compiler Issues
```bash
# SSH to EC2 and check status
ssh -i your-key.pem ubuntu@your-ec2-ip
sudo systemctl status codester-compiler
sudo journalctl -u codester-compiler -f
```

### Frontend Issues
```bash
# Check browser console for errors
# Verify environment variables in Vercel
```

---

## 🎉 Success Checklist

- [ ] Backend deployed and responding
- [ ] Compiler deployed and responding
- [ ] Frontend updated with production URLs
- [ ] Code execution working
- [ ] AI review working
- [ ] All health checks passing

Your Codester Online Judge is now live! 🚀

---

## 📞 Need Help?

1. Check the logs for each service
2. Verify all environment variables
3. Test each component individually
4. Check network connectivity
5. Review security group configurations

Common Issues:
- **CORS errors**: Check CORS_ORIGIN in backend
- **Connection refused**: Check security groups
- **Environment variables**: Verify all are set correctly
- **SSL issues**: Check certificate installation 