# Ready to Deploy! 🚀

## ✅ What's Done
- ✅ Code is on GitHub: https://github.com/mlhypc/waikiki
- ✅ MongoDB Atlas database created and seeded
- ✅ Backend tested locally (working)
- ✅ Frontend tested locally (working)

## 🚂 Deploy Backend to Railway

1. **Go to Railway**: https://railway.app/new
2. **Sign in with GitHub**
3. **Click "Deploy from GitHub repo"**
4. **Select**: `mlhypc/waikiki`
5. **Important**: Railway will try to deploy both folders. Configure:
   - Click on the service
   - Go to **Settings** → **Build** → **Root Directory**
   - Set: `backend`
   - Go to **Settings** → **Deploy** → **Start Command**
   - Set: `npm start`
6. **Add Environment Variables**:
   - Click **Variables** tab
   - Add these:
   ```
   MONGODB_URI=mongodb+srv://mlhypc:gzWSayrPBSJrBBlZ@waikiki.fwhpmaw.mongodb.net/waikiki-store?retryWrites=true&w=majority&appName=waikiki
   PORT=5000
   NODE_ENV=production
   ```
7. **Deploy** - Railway will automatically deploy
8. **Get your URL**: Copy the Railway URL (e.g., `https://waikiki-production.up.railway.app`)

**Test it**: Visit `https://your-railway-url.railway.app/health` - should see `{"status":"OK"}`

---

## ▲ Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Sign in with GitHub**
3. **Import Git Repository**: Select `mlhypc/waikiki`
4. **Configure Project**:
   - **Project Name**: waikiki-store (or any name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click "Edit" → Set to `frontend`
   - **Build Command**: `npm run build` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)
5. **Environment Variables**:
   - Click "Add Environment Variable"
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url.railway.app` (from step 8 above)
6. **Click "Deploy"**
7. **Wait 2-3 minutes** for build to complete
8. **Get your URL**: Vercel will give you a URL (e.g., `https://waikiki-store.vercel.app`)

**Test it**: Visit your Vercel URL - you should see the store!

---

## 🎉 You're Live!

Share this URL with users: `https://your-vercel-url.vercel.app`

Each user will automatically:
- Get a unique anonymous ID
- Receive $1000 virtual money
- Be assigned to an A/B test group (A, B, C, or D)

---

## 📊 View Analytics

```bash
# Overall stats
https://your-railway-url.railway.app/api/analytics/overview

# Conversion funnel
https://your-railway-url.railway.app/api/analytics/funnel

# A/B test comparison
https://your-railway-url.railway.app/api/analytics/ab-comparison

# Export data
https://your-railway-url.railway.app/api/analytics/export?format=csv
```

---

## 🔧 Troubleshooting

### Backend won't deploy on Railway
- Check that Root Directory is set to `backend`
- Verify all environment variables are set
- Check Railway logs for errors

### Frontend won't deploy on Vercel
- Check that Root Directory is set to `frontend`
- Verify NEXT_PUBLIC_API_URL is set correctly (no trailing slash!)
- Check Vercel deployment logs

### Frontend can't connect to backend
- Make sure Railway backend is running
- Test backend health: `https://your-railway-url.railway.app/health`
- Check that NEXT_PUBLIC_API_URL in Vercel matches your Railway URL exactly

---

## 💰 Cost

All services are FREE for this experiment:
- **MongoDB Atlas**: Free tier (512MB - enough for ~100k events)
- **Railway**: $5 free credit/month
- **Vercel**: 100GB bandwidth/month free

For 1000 users doing a short experiment, you'll stay in free tiers! 🎉

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel (with Railway URL)
3. Test your live site
4. Share URL with users
5. Monitor analytics in real-time!

Good luck with your experiment! 🚀
