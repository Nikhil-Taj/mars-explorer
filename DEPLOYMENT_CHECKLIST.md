# 📋 Mars Explorer Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## 🔧 Pre-Deployment Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Git repository set up
- [ ] Code pushed to GitHub
- [ ] NASA API key obtained from [api.nasa.gov](https://api.nasa.gov/)

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (0.0.0.0/0 for production)
- [ ] Connection string obtained

### Platform Accounts
- [ ] Vercel account created
- [ ] Render account created
- [ ] GitHub repository connected to both platforms

## 🚀 Backend Deployment (Render)

### Service Configuration
- [ ] New web service created in Render
- [ ] Repository connected
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Health check path: `/health`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `NASA_API_KEY=your_actual_key`
- [ ] `MONGODB_URI=your_mongodb_connection_string`
- [ ] `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `CACHE_TTL=3600`

### Deployment
- [ ] Service deployed successfully
- [ ] Health check endpoint responding: `/health`
- [ ] API endpoints accessible: `/api/mars/photos/latest`
- [ ] Backend URL noted for frontend configuration

## 🌐 Frontend Deployment (Vercel)

### Project Configuration
- [ ] New project created in Vercel
- [ ] Repository imported
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- [ ] `VITE_NASA_API_KEY=your_actual_key`

### Deployment
- [ ] Project deployed successfully
- [ ] Frontend accessible and loading
- [ ] API calls working (check browser network tab)
- [ ] Frontend URL noted

## 🔄 Post-Deployment Configuration

### Backend CORS Update
- [ ] Update backend `CORS_ORIGIN` with actual frontend URL
- [ ] Redeploy backend service
- [ ] Verify CORS errors are resolved

### Testing
- [ ] Frontend loads without errors
- [ ] Mars photos display correctly
- [ ] Search functionality works
- [ ] AI features functional
- [ ] Favorites system working
- [ ] Analytics and statistics display
- [ ] Mobile responsiveness verified

### Performance Check
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Images load efficiently
- [ ] API responses fast (< 2 seconds)
- [ ] No console errors in browser

## 🔍 Verification Tests

### API Endpoints
Test these URLs directly in browser:
- [ ] `https://your-backend.onrender.com/health` → Returns "OK"
- [ ] `https://your-backend.onrender.com/api/mars/photos/latest?limit=5` → Returns photo data
- [ ] `https://your-backend.onrender.com/api/mars/cameras` → Returns camera list

### Frontend Features
- [ ] Photo gallery loads
- [ ] Search filters work
- [ ] AI search modal opens
- [ ] AI chat assistant responds
- [ ] Advanced search functions
- [ ] Statistics page displays data
- [ ] Analytics charts render
- [ ] Favorites can be added/removed

## 🛠️ Troubleshooting

### If Backend Fails
- [ ] Check Render logs for errors
- [ ] Verify environment variables are set
- [ ] Test MongoDB connection string
- [ ] Confirm NASA API key is valid

### If Frontend Fails
- [ ] Check Vercel function logs
- [ ] Verify environment variables
- [ ] Test API URL in browser
- [ ] Check for CORS errors in console

### If API Calls Fail
- [ ] Verify backend URL in frontend env vars
- [ ] Check CORS configuration
- [ ] Test API endpoints directly
- [ ] Confirm NASA API key limits

## 📊 Monitoring Setup (Optional)

### Uptime Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure alerts for downtime

### Error Tracking
- [ ] Set up Sentry for error tracking
- [ ] Configure error alerts

### Analytics
- [ ] Set up Google Analytics or Vercel Analytics
- [ ] Configure conversion tracking

## 🎉 Launch Checklist

### Final Steps
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] No critical errors in logs
- [ ] Documentation updated
- [ ] Team notified of URLs

### URLs to Share
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-service.onrender.com`
- **API Docs**: `https://your-service.onrender.com/api`

## 📞 Emergency Contacts

### Platform Support
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Render**: [render.com/support](https://render.com/support)
- **MongoDB Atlas**: [support.mongodb.com](https://support.mongodb.com)

### Quick Rollback
- **Vercel**: Use previous deployment in dashboard
- **Render**: Redeploy previous commit

---

✅ **Deployment Complete!** Your Mars Explorer app is now live! 🚀🔴
