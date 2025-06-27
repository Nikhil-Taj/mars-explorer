# 🚀 Mars Explorer - Deployment Guide

This guide covers deploying the Mars Explorer application to production using Vercel (frontend) and Render (backend).

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [NASA API Key](https://api.nasa.gov/) (free)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier available)
- [Vercel](https://vercel.com/) account (free tier available)
- [Render](https://render.com/) account (free tier available)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │───▶│   (Render)      │───▶│ (MongoDB Atlas) │
│   React + Vite  │    │   Node.js API   │    │   Cloud DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Environment Setup

### 1. Get NASA API Key

1. Visit [NASA API Portal](https://api.nasa.gov/)
2. Click "Generate API Key"
3. Fill out the form (use your real email)
4. Save the API key - you'll need it for deployment

### 2. Set Up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is sufficient)
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/mars-explorer`

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Repository

1. Ensure your code is pushed to GitHub
2. Make sure `backend/` directory contains all necessary files

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mars-explorer-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Render dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
NASA_API_KEY=your_nasa_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mars-explorer
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-service-name.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables

In Vercel dashboard, add these environment variables:

```bash
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
VITE_NASA_API_KEY=your_nasa_api_key_here
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-project.vercel.app`

### Step 4: Update Backend CORS

Update your backend's `CORS_ORIGIN` environment variable in Render:
```bash
CORS_ORIGIN=https://your-project.vercel.app
```

## 🔄 Post-Deployment Steps

### 1. Test the Application

1. Visit your frontend URL
2. Check that photos load correctly
3. Test AI features
4. Verify API connectivity

### 2. Monitor Logs

- **Render**: Check logs in the Render dashboard
- **Vercel**: Check function logs in Vercel dashboard

### 3. Set Up Custom Domain (Optional)

#### For Frontend (Vercel):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### For Backend (Render):
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly
- Check for trailing slashes

#### 2. API Key Issues
- Verify NASA API key is valid
- Check rate limits (1000 requests/hour for free tier)

#### 3. Database Connection
- Verify MongoDB connection string
- Check IP whitelist settings
- Ensure database user has correct permissions

#### 4. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are listed in package.json
- Check for TypeScript errors

### Debug Commands

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd frontend
npm run dev

# Build frontend for production
cd frontend
npm run build:production

# Test production build locally
cd frontend
npm run preview
```

## 📊 Performance Optimization

### Frontend
- Images are optimized automatically by Vite
- Code splitting is enabled
- Service worker for offline functionality

### Backend
- Response caching implemented
- Rate limiting configured
- Gzip compression enabled

## 🔒 Security Considerations

- API keys are stored as environment variables
- CORS is properly configured
- Helmet.js provides security headers
- Rate limiting prevents abuse

## 📈 Monitoring

### Recommended Tools
- **Uptime**: UptimeRobot or Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics or Vercel Analytics

## 🔄 CI/CD (Optional)

For automatic deployments, both Vercel and Render support GitHub integration:

1. **Vercel**: Automatically deploys on push to main branch
2. **Render**: Configure auto-deploy in service settings

## 📞 Support

If you encounter issues:

1. Check the logs in your deployment platform
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check NASA API status

## 🎉 Success!

Your Mars Explorer application should now be live and accessible worldwide! 

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-service.onrender.com`

Enjoy exploring Mars! 🔴🚀
