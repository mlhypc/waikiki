# Waikiki Store - Backend API

Analytics and event tracking backend for the clothing store experiment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string.

For local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/waikiki-store
```

For MongoDB Atlas (recommended for Railway):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waikiki-store
```

3. Seed the database with products:
```bash
npm run seed
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users/init` - Initialize anonymous user
- `GET /api/users/:userId` - Get user info
- `PATCH /api/users/:userId/balance` - Update user balance

### Products
- `GET /api/products` - Get all products (with A/B pricing)
- `GET /api/products/:productId` - Get single product
- `POST /api/products/seed` - Seed products (first time only)

### Events
- `POST /api/events` - Track single event
- `POST /api/events/batch` - Track multiple events
- `GET /api/events/user/:userId` - Get user events

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/funnel` - Get conversion funnel
- `GET /api/analytics/export` - Export all data (JSON/CSV)
- `GET /api/analytics/journey/:userId` - Get user journey
- `GET /api/analytics/ab-comparison` - Compare A/B test groups

## Deploy to Railway

1. Create new project on Railway
2. Add MongoDB database (or use MongoDB Atlas)
3. Connect your GitHub repo
4. Set environment variables in Railway dashboard
5. Deploy!

Railway will automatically detect the Node.js app and run it.
