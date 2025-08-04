# MongoDB Setup Guide

## Security Notice
⚠️ **NEVER commit credentials to Git!** Always use environment variables for sensitive information.

## MongoDB Atlas Configuration

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (M0 Free tier is fine)
3. Note your cluster name and connection string

### Step 2: Configure Network Access
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 3: Create Database User
1. Go to "Database Access" in MongoDB Atlas
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Set a strong password
5. Note the username and password

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add `/codester` at the end to specify database name

## Environment Variables

Set these in your Render dashboard:

```bash
# MongoDB Connection (replace with your actual values)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codester?retryWrites=true&w=majority

# Other required variables
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://your-redis-connection-string
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Testing

After setup, test your connection:

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# MongoDB test
curl https://your-backend.onrender.com/api/test-mongo
```

## Security Best Practices

1. **Never commit credentials to Git**
2. **Use environment variables for all sensitive data**
3. **Rotate passwords regularly**
4. **Use strong, unique passwords**
5. **Enable MongoDB Atlas security features**

## Troubleshooting

### Common Issues:
- **DNS Resolution Error**: Check network access settings
- **Authentication Failed**: Verify username/password
- **Connection Timeout**: Check firewall settings
- **Environment Variables Not Loading**: Verify in Render dashboard

### Testing Commands:
```bash
# Check environment variables
curl https://your-backend.onrender.com/api/show-mongo-uri

# Test MongoDB connection
curl https://your-backend.onrender.com/api/test-mongo

# Check health status
curl https://your-backend.onrender.com/api/health
``` 