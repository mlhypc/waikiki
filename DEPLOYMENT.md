# Deployment Guide

## Prerequisites

1. GitHub account (to store code)
2. MongoDB Atlas account (free database)
3. Railway account (free backend hosting)
4. Vercel account (free frontend hosting)

All services have free tiers sufficient for this experiment!

---

## Step 1: Set Up MongoDB Atlas

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster**
   - Choose "Build a Database"
   - Select "M0 Free" tier
   - Choose a cloud provider and region (closest to your users)
   - Name your cluster (e.g., "waikiki")

3. **Set Up Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password (save these!)
   - Set privileges to "Read and write to any database"

4. **Set Up Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add `/waikiki-store` after `.net` and before `?`
   - Final: `mongodb+srv://username:password@cluster.mongodb.net/waikiki-store?retryWrites=true&w=majority`

---

## Step 2: Push Code to GitHub

```bash
cd C:\Users\Qwilleran\Desktop\waikiki

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Waikiki Store experiment platform"

# Create repo on GitHub (via website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/waikiki-store.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Railway

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `waikiki-store` repository
   - Railway will detect the monorepo

3. **Configure Backend Service**
   - Click "Add Service" → "GitHub Repo"
   - Select your repo
   - Set **Root Directory**: `backend`
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   - Click on your backend service
   - Go to "Variables" tab
   - Add these variables:
   ```
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Wait for build to complete
   - Copy your Railway app URL (e.g., `https://waikiki-production.up.railway.app`)

6. **Seed the Database**
   - In Railway dashboard, go to your service
   - Click "Settings" → "Deploy"
   - Or run locally with production MongoDB:
   ```bash
   cd backend
   MONGODB_URI="<your-atlas-string>" npm run seed
   ```

7. **Test Backend**
   - Visit `https://your-app.railway.app/health`
   - Should see: `{"status":"OK","timestamp":"..."}`

---

## Step 4: Deploy Frontend to Vercel

1. **Create Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your `waikiki-store` repository

3. **Configure Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - Click "Edit" next to Root Directory and set it

4. **Add Environment Variable**
   - In "Environment Variables" section
   - Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend.railway.app
   ```
   (Use your Railway URL from Step 3)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Vercel will give you a URL (e.g., `https://waikiki-store.vercel.app`)

6. **Test Frontend**
   - Visit your Vercel URL
   - You should see the store with products
   - Open browser console (F12) to see event tracking
   - Try adding items to cart and checking out

---

## Step 5: Test the Full System

1. **Open Your Store**
   - Go to your Vercel URL
   - Browse products, add to cart, checkout

2. **Check Analytics**
   - Visit: `https://your-backend.railway.app/api/analytics/overview`
   - Should see user and event data

3. **Export Data**
   - `https://your-backend.railway.app/api/analytics/export?format=json`
   - Download the JSON file

---

## Post-Deployment

### Share with Users
- Share your Vercel URL: `https://your-store.vercel.app`
- Users automatically get:
  - Unique anonymous ID
  - $1000 virtual money
  - Assignment to A/B test group

### Monitor Your Experiment

**View Real-Time Stats:**
```bash
curl https://your-backend.railway.app/api/analytics/overview
```

**Export Data:**
```bash
curl https://your-backend.railway.app/api/analytics/export?format=csv > data.csv
```

**A/B Test Comparison:**
```bash
curl https://your-backend.railway.app/api/analytics/ab-comparison
```

### Update Your App

When you push to GitHub, both Railway and Vercel will auto-deploy:

```bash
git add .
git commit -m "Update products"
git push origin main
```

---

## Costs

- **MongoDB Atlas**: Free tier (512MB storage, enough for ~100k events)
- **Railway**: Free tier ($5 credit/month, typically enough)
- **Vercel**: Free tier (100GB bandwidth, plenty for testing)

**For 1000 users**, free tiers should be sufficient for a short experiment.

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Fails:**
- Check connection string format
- Verify Network Access allows 0.0.0.0/0
- Check username/password are correct

**Railway Build Fails:**
- Verify Root Directory is set to `backend`
- Check Railway logs for specific errors
- Ensure all environment variables are set

### Frontend Issues

**Can't Connect to API:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Railway backend is running
- Test backend health endpoint directly

**Build Fails:**
- Check Vercel build logs
- Verify Root Directory is set to `frontend`
- Ensure all dependencies are in package.json

### CORS Errors

If you see CORS errors:
- Backend already has CORS enabled
- Check that API URL doesn't have trailing slash
- Verify Railway backend is accessible

---

## Scaling Tips

If you exceed free tiers:

1. **MongoDB**: Upgrade to M10 ($0.08/hr ~$57/month)
2. **Railway**: Add payment method, pay per usage
3. **Vercel**: Upgrade to Pro ($20/month) for more bandwidth

For 1000 concurrent users, consider:
- MongoDB: M10 cluster
- Railway: Monitor usage, may need to upgrade
- Vercel: Usually fine on free tier

---

## Security Notes

- API is open by default (no authentication)
- Rate limiting is enabled (1000 req/15min per IP)
- For production use, consider adding:
  - API keys
  - Request signing
  - Additional rate limiting
  - IP whitelisting

---

## Getting Help

- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/support
- **MongoDB**: https://www.mongodb.com/docs/atlas/

Your experiment platform is now live! 🚀
