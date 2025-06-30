# 🚀 Render Deployment Guide for Mars Explorer

## Quick Fix for Current Deployment Issue

The build error you're seeing is likely due to one of these issues:

### 1. **Immediate Fix - Update Environment Variables**

In your Render dashboard, make sure these environment variables are set:

```
NODE_ENV=production
PORT=10000
NASA_API_KEY=bK5ADcBXRPaROH3lKVCedfJLUasrKNZYlTx4fH4p
NASA_API_BASE_URL=https://api.nasa.gov
MONGODB_URI=mongodb://localhost:27017/nasa-space-explorer
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

### 2. **Build Command Fix**

Update your Render service build command to:
```bash
npm ci && npm run build
```

### 3. **Root Directory**

Make sure your Render service root directory is set to: `backend`

## Step-by-Step Deployment Process

### Step 1: Prepare Repository
1. Commit all changes to your GitHub repository
2. Push to the main branch

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mars-explorer-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
Add all the environment variables listed above in the Render dashboard.

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Check the logs for any errors

## Troubleshooting Common Issues

### Build Fails with "npm run build"
- **Cause**: Missing devDependencies or TypeScript issues
- **Fix**: The Dockerfile has been updated to install all dependencies first

### Environment Variable Errors
- **Cause**: Missing required environment variables
- **Fix**: Ensure all variables from the list above are set

### CORS Errors After Deployment
- **Cause**: Frontend URL not in CORS_ORIGIN
- **Fix**: Update CORS_ORIGIN with your actual frontend URL

## Testing Your Deployment

Once deployed, test these endpoints:

1. **Health Check**: `https://your-service.onrender.com/health`
2. **API Root**: `https://your-service.onrender.com/api`
3. **Mars Photos**: `https://your-service.onrender.com/api/mars/photos/latest`

## Next Steps After Backend Deployment

1. **Note your backend URL** (e.g., `https://mars-explorer-backend.onrender.com`)
2. **Update frontend environment variables** with the backend URL
3. **Deploy frontend to Vercel** (if not already done)
4. **Update CORS_ORIGIN** in backend with frontend URL

## Alternative: Manual Deployment Check

If the automated deployment fails, you can test locally first:

```bash
cd backend
npm ci
npm run build
npm start
```

This should work without errors before deploying to Render.
