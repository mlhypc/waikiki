# Quick Setup Guide

## Step-by-Step Instructions

### 1. Install MongoDB

**Option A: MongoDB Atlas (Recommended - Free Cloud Database)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add `/waikiki-store` at the end before the query parameters

**Option B: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Connection string will be: `mongodb://localhost:27017/waikiki-store`

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env file and add your MongoDB connection string
# Use your text editor to open .env and set:
MONGODB_URI=mongodb+srv://your-connection-string
# OR for local:
MONGODB_URI=mongodb://localhost:27017/waikiki-store

# Seed the database with products
npm run seed

# Start the backend server
npm start
```

Backend should now be running on http://localhost:5000

Test it: Open http://localhost:5000/health in your browser

### 3. Frontend Setup

**Open a NEW terminal window** (keep backend running)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local    # Windows
cp .env.local.example .env.local      # Mac/Linux

# The default settings should work (http://localhost:5000)
# No need to edit unless your backend is on a different URL

# Start the frontend development server
npm run dev
```

Frontend should now be running on http://localhost:3000

### 4. Test the Application

1. Open http://localhost:3000 in your browser
2. You should see the Waikiki Store with products
3. Check the browser console (F12) to see event tracking
4. Try adding items to cart
5. Try checking out

### 5. View Analytics

Test the analytics endpoints:

```bash
# Get overview
curl http://localhost:5000/api/analytics/overview

# Get conversion funnel
curl http://localhost:5000/api/analytics/funnel

# Export data
curl http://localhost:5000/api/analytics/export?format=json > data.json
```

Or open these URLs in your browser:
- http://localhost:5000/api/analytics/overview
- http://localhost:5000/api/analytics/funnel
- http://localhost:5000/api/analytics/ab-comparison

## Troubleshooting

### Backend won't start
- **Error: "MongoDB connection error"**
  - Check your MongoDB connection string in `backend/.env`
  - Make sure MongoDB is running (if local)
  - Check firewall/network settings for Atlas

- **Error: "Port 5000 already in use"**
  - Change PORT in `backend/.env` to 5001 or another port
  - Update `frontend/.env.local` to match

### Frontend won't start
- **Error: "Cannot connect to API"**
  - Make sure backend is running on http://localhost:5000
  - Check `frontend/.env.local` has correct API URL
  - Check browser console for CORS errors

- **Error: "Port 3000 already in use"**
  - Kill the process using port 3000
  - Or run on different port: `npm run dev -- -p 3001`

### Products not showing
- Run the seed script: `cd backend && npm run seed`
- Check MongoDB has the products collection
- Check browser console for API errors

### Events not being tracked
- Open browser DevTools → Network tab
- Look for POST requests to `/api/events` or `/api/events/batch`
- Check backend logs for errors
- Verify user is initialized (check `/api/users` calls)

## Next Steps

### For Testing with Real Users

1. **Deploy to Production** (see main README.md)
   - Backend → Railway
   - Frontend → Vercel
   - MongoDB → Atlas

2. **Share the Link**
   - Give users the Vercel URL
   - They'll automatically get anonymous IDs
   - Each gets $1000 virtual money

3. **Monitor in Real-Time**
   ```bash
   # Watch events coming in
   curl http://localhost:5000/api/analytics/overview
   ```

4. **Export Data for Analysis**
   ```bash
   curl "http://localhost:5000/api/analytics/export?format=csv" > experiment_data.csv
   ```

### Customizing the Experiment

1. **Change Prices by Test Group**
   - Edit product `priceVariants` in `backend/seed.js`
   - Groups A, B, C, D can have different prices

2. **Add More Products**
   - Add to the products array in `backend/seed.js`
   - Delete products collection in MongoDB
   - Re-run: `npm run seed`

3. **Track Custom Events**
   - Use `analytics.queueEvent('custom_event', { your: 'data' })`
   - See `frontend/lib/analytics.ts` for examples

4. **Change Virtual Money Amount**
   - Edit `balance: 1000` in `backend/models/User.js`
   - Default is $1000 per user

## Support

If you run into issues:
1. Check this troubleshooting guide
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all services are running
5. Check MongoDB connection

## Architecture

```
Browser (User)
    ↓
Next.js Frontend (localhost:3000)
    ↓ API calls
Express Backend (localhost:5000)
    ↓ Data storage
MongoDB Database
```

All events are tracked automatically as users interact with the site!
