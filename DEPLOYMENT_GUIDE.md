# 🚀 Permanent Solution for Azure IP Changes

> Note (2025-08-10): This guide is informational. For the canonical deployment steps, see README.md. Keep this as a reference only.

## Problem
Azure Container Instances change IP addresses when restarted, causing your compiler service to become unreachable.

## ✅ Solution: Deploy to a Service with Stable URLs

### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Connect your GitHub repo: `ark5234/Online-Judge-Codester`
   - Create new Web Service
   - Select the `compiler-service` directory
   - Use Docker build
   - Your service will get a stable URL like: `https://codester-compiler.onrender.com`

3. **Update your backend configuration:**
   ```bash
   # Update COMPILER_SERVICE_URL to your new Render URL
   COMPILER_SERVICE_URL=https://codester-compiler.onrender.com
   ```

### Option 2: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd compiler-service
   railway login
   railway up
   ```

### Option 3: Keep Azure but Use Static IP

1. **Create Application Gateway with Static IP:**
   ```bash
   az network public-ip create \
     --resource-group codester-rg \
     --name codester-static-ip \
     --allocation-method Static \
     --sku Standard
   ```

2. **Configure Application Gateway to route to your container**

## 🎯 Recommended Action

**Use Render** - it's the easiest solution:
- Free tier available
- Automatic deployments from GitHub
- Stable HTTPS URLs
- No IP address changes
- Better reliability than Azure Container Instances

## Files Ready for Deployment

✅ `compiler-service/Dockerfile` - Ready for deployment
✅ `compiler-service/requirements.txt` - Python dependencies
✅ `compiler-service/render.yaml` - Render configuration
✅ `compiler-service/Procfile` - Process configuration
✅ Health check endpoint at `/health`

## Next Steps

1. Deploy to Render using the instructions above
2. Update `COMPILER_SERVICE_URL` in your Render environment variables
3. Test the new stable URL
4. Your submission system will work reliably! 🎉
