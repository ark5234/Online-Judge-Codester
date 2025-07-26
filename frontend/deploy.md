# Vercel Deployment Guide for OJ Codester

## Quick Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy using the script**:
   ```powershell
   .\deploy.ps1
   ```

3. **Or deploy manually**:
   ```bash
   cd frontend
   npm install
   npm run build
   vercel --prod
   ```

## Configuration Files

### `vercel.json`
- **Rewrites**: Handles client-side routing by redirecting all requests to `index.html`
- **Routes**: Additional routing configuration for better compatibility
- **Build Settings**: Specifies Vite as the framework and dist as output directory

### `public/_redirects`
- Alternative routing configuration for Vercel
- Ensures all routes are handled by the React app

### `vite.config.js`
- **Base Path**: Set to `/` for root deployment
- **Build Optimization**: Disabled sourcemaps and manual chunks for faster builds
- **Server Configuration**: Development server settings

## Troubleshooting 404 Errors

### Common Causes:
1. **Client-side routing not configured properly**
2. **Build artifacts not generated correctly**
3. **Vercel configuration issues**

### Solutions:

#### 1. Check Build Output
```bash
npm run build
ls dist/
```
Ensure `index.html` exists in the `dist` folder.

#### 2. Verify Vercel Configuration
Make sure `vercel.json` contains:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Force Redeploy
```bash
vercel --prod --force
```

#### 4. Check Vercel Dashboard
- Go to your Vercel dashboard
- Check the deployment logs for any build errors
- Verify the deployment settings

#### 5. Clear Cache and Redeploy
```bash
vercel --prod --force
```

## Environment Variables

If you need to set environment variables for Appwrite or other services:

1. **Via Vercel CLI**:
   ```bash
   vercel env add VITE_APPWRITE_ENDPOINT
   vercel env add VITE_APPWRITE_PROJECT_ID
   ```

2. **Via Vercel Dashboard**:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add your variables

## Appwrite Google Auth Setup

For Google OAuth to work in production:

1. **Update Appwrite Console**:
   - Go to your Appwrite project
   - Navigate to Auth > Settings
   - Add your Vercel domain to the allowed platforms
   - Example: `https://your-app.vercel.app`

2. **Update Google OAuth**:
   - Go to Google Cloud Console
   - Add your Vercel domain to authorized redirect URIs
   - Example: `https://your-app.vercel.app`

## Post-Deployment Checklist

- [ ] All routes work (Home, Problems, Login, etc.)
- [ ] Google Sign-In works
- [ ] Dark/Light theme toggle works
- [ ] Problem detail pages load correctly
- [ ] Code editor functions properly
- [ ] Responsive design works on mobile

## Support

If you continue to experience issues:

1. Check the Vercel deployment logs
2. Verify all configuration files are present
3. Ensure the build process completes successfully
4. Test locally with `npm run preview` before deploying 