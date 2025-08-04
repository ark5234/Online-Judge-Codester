# MongoDB Connection Fix Guide

## Problem Description
Your Render deployment is showing:
```
❌ MongoDB connection error: querySrv ENOTFOUND _mongodb._tcp.cluster0.8ndl519.mongodb.net
```

This means the application cannot resolve the DNS for your MongoDB Atlas cluster.

## Root Cause Analysis
1. **Environment Variables**: MongoDB URI might not be properly set in Render
2. **MongoDB Atlas Configuration**: Cluster might be paused, deleted, or have network restrictions
3. **DNS Resolution**: Network connectivity issue between Render and MongoDB Atlas

## Solution Steps

### Step 1: Verify MongoDB Atlas Configuration

1. **Log into MongoDB Atlas** (https://cloud.mongodb.com/)
2. **Check Cluster Status**:
   - Ensure cluster `cluster0.8ndl519` is **running** (not paused)
   - If paused, click "Resume" to restart it
3. **Network Access Configuration**:
   - Go to "Network Access" in the left sidebar
   - Ensure you have an entry allowing `0.0.0.0/0` (allow access from anywhere)
   - Or add Render's IP ranges if you want more security
4. **Database User**:
   - Go to "Database Access"
   - Verify user `vikrantkawadkar2099` exists and has proper permissions
   - Ensure the password matches what's in your connection string

### Step 2: Update Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service**: `codester-backend`
3. **Navigate to Environment tab**
4. **Set the following environment variables**:

```bash
# Core Database Configuration
MONGO_URI=mongodb+srv://vikrantkawadkar2099:oj_data%402099@cluster0.8ndl519.mongodb.net/codester?retryWrites=true&w=majority

# Security
JWT_SECRET=f34d2c971b34b809408113aa9c27c70695386a75171f947021601cf2c548bba75e6e69e48ebffd5ec253be02cfac50ed521f2da95db5bf3cba11b62ad53c0ae0

# External Services
GEMINI_API_KEY=AIzaSyB_7Q1glTnxVc6DPi0ZkCmUHGE80UPNu-s
REDIS_URL=redis://your-redis-url:6379

# Frontend/CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Compiler Service
COMPILER_URL=https://your-compiler-ec2-instance.com

# Environment
NODE_ENV=production
PORT=10000
```

### Step 3: Test the Connection

After updating environment variables:

1. **Redeploy your service** in Render
2. **Check the logs** for connection status
3. **Test endpoints**:
   - Health Check: `https://online-judge-codester.onrender.com/api/health`
   - MongoDB Test: `https://online-judge-codester.onrender.com/api/test-mongo`
   - Environment Check: `https://online-judge-codester.onrender.com/api/show-mongo-uri`

### Step 4: Alternative Solutions

If the above doesn't work, try these alternatives:

#### Option A: Create a New MongoDB Atlas Cluster
1. Create a new cluster in MongoDB Atlas
2. Use the new connection string
3. Update the `MONGO_URI` environment variable

#### Option B: Use Railway or Another Database Provider
1. Create a MongoDB instance on Railway
2. Update the connection string format to `mongodb://...`

#### Option C: Enable Render's Database Add-on
1. Add a PostgreSQL database from Render
2. Update your application to use PostgreSQL instead of MongoDB

### Step 5: Verify the Fix

After implementation, you should see:
```
✅ MongoDB connected successfully
```

Instead of:
```
❌ MongoDB connection failed, using mock mode
```

## Testing Commands

Once deployed, test these URLs:

1. **Health Check**:
   ```
   GET https://online-judge-codester.onrender.com/api/health
   ```

2. **MongoDB Connection Test**:
   ```
   GET https://online-judge-codester.onrender.com/api/test-mongo
   ```

3. **Environment Variables Check**:
   ```
   GET https://online-judge-codester.onrender.com/api/show-mongo-uri
   ```

## Common Issues and Solutions

### Issue 1: "querySrv ENOTFOUND"
- **Cause**: DNS resolution failure
- **Solution**: Check MongoDB Atlas cluster status and network access

### Issue 2: "Authentication failed"
- **Cause**: Wrong username/password
- **Solution**: Verify database user credentials in MongoDB Atlas

### Issue 3: "Connection timed out"
- **Cause**: Network access restrictions
- **Solution**: Add `0.0.0.0/0` to MongoDB Atlas network access list

### Issue 4: Environment variables not loading
- **Cause**: Render environment variables not properly set
- **Solution**: Double-check all environment variables in Render dashboard

## Need Help?
If you continue to have issues:
1. Check the Render logs for specific error messages
2. Test the MongoDB connection locally first
3. Verify all environment variables are correctly set
4. Consider switching to a different database provider if MongoDB Atlas continues to have issues

## Files Modified
- `backend/server/production-server.js` - Improved error handling and connection logic
- `MONGODB_FIX_GUIDE.md` - This troubleshooting guide
