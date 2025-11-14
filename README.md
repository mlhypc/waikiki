# Waikiki Store - User Behavior Experiment Platform

A full-stack e-commerce platform designed to track and analyze user behavior with 1000+ anonymous users using decoy money. Perfect for testing algorithms, pricing strategies, recommendation engines, and user experience patterns.

## Project Structure

```
waikiki/
├── backend/          # Express + MongoDB API
│   ├── models/      # Database schemas
│   ├── routes/      # API endpoints
│   └── server.js    # Main server file
├── frontend/        # Next.js React app
│   ├── app/         # Next.js pages
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Utilities and context
└── README.md        # This file
```

## Features

### Backend (Express + MongoDB)
- User management with automatic A/B test group assignment
- Comprehensive event tracking system
- Product catalog with variant pricing for A/B testing
- Mock payment system with virtual currency
- Advanced analytics and data export
- RESTful API endpoints

### Frontend (Next.js + React)
- Anonymous user tracking
- Real-time event logging (clicks, hovers, scrolls, time spent)
- Shopping cart with state management
- Product filtering and sorting
- Responsive design with Tailwind CSS
- Automatic A/B test group assignment

### Tracked Events
- Page views and navigation
- Product interactions (views, clicks, hovers)
- Cart actions (add, remove, view)
- Checkout funnel (start, complete)
- User engagement (scroll depth, time spent)
- Filter and sort preferences
- Search behavior

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas account)
- Two terminal windows

### 1. Backend Setup

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Seed the database with products
npm run seed

# Start the backend server
npm start
```

Backend will run on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local (default is http://localhost:5000)

# Start the frontend development server
npm run dev
```

Frontend will run on http://localhost:3000

### 3. Access the Application

Open http://localhost:3000 in your browser. Each user automatically gets:
- A unique anonymous ID
- $1000 virtual currency
- Assignment to an A/B test group (A, B, C, or D)

## API Endpoints

### Users
- `POST /api/users/init` - Initialize anonymous user
- `GET /api/users/:userId` - Get user details
- `PATCH /api/users/:userId/balance` - Update balance

### Products
- `GET /api/products` - List products (supports A/B pricing)
- `GET /api/products/:productId` - Get single product
- `POST /api/products/seed` - Seed database (first run only)

### Events
- `POST /api/events` - Track single event
- `POST /api/events/batch` - Batch track events
- `GET /api/events/user/:userId` - Get user events

### Analytics
- `GET /api/analytics/overview` - Overall statistics
- `GET /api/analytics/funnel` - Conversion funnel metrics
- `GET /api/analytics/export` - Export data (JSON/CSV)
- `GET /api/analytics/journey/:userId` - User journey analysis
- `GET /api/analytics/ab-comparison` - A/B test comparison

## Deployment

### Backend → Railway

1. Create a [Railway](https://railway.app) account
2. Create new project and add MongoDB database
3. Connect your GitHub repository
4. Add environment variables:
   ```
   MONGODB_URI=<your-mongodb-atlas-or-railway-db-url>
   PORT=5000
   ```
5. Railway will auto-detect and deploy Node.js app

### Frontend → Vercel

1. Create a [Vercel](https://vercel.com) account
2. Import your GitHub repository
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. Deploy! Vercel auto-detects Next.js

### MongoDB Atlas (Recommended)

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string
4. Whitelist Railway/Vercel IPs (or allow all: 0.0.0.0/0)

## A/B Testing

The platform supports up to 4 concurrent test groups (A, B, C, D). Each group can have:
- Different pricing strategies
- Different UI layouts (customize frontend)
- Different recommendation algorithms
- Different product ordering

Products have `priceVariants` that automatically apply based on user's test group.

## Data Analysis

Export data via:
```bash
curl http://localhost:5000/api/analytics/export?format=json > data.json
curl http://localhost:5000/api/analytics/export?format=csv > data.csv
```

Or use the analytics endpoints to get:
- Conversion funnels
- User journeys
- A/B test comparisons
- Event aggregations

## Example Use Cases

1. **Pricing Strategy Testing**: Test 4 different pricing models simultaneously
2. **Recommendation Algorithms**: Implement different product sorting for each group
3. **UI/UX Testing**: Show different layouts to different groups
4. **Checkout Flow Optimization**: Test different checkout processes
5. **Cart Abandonment Research**: Analyze when/why users abandon carts
6. **Product Discovery**: Track how users find products (browse vs search)

## Event Tracking Details

Events are batched and sent every 5 seconds or when queue reaches 50 events. This reduces API calls while maintaining real-time capabilities.

All events include:
- `userId` - Anonymous user identifier
- `sessionId` - Browser session ID
- `eventType` - Type of event
- `eventData` - Event-specific data
- `abTestGroup` - User's test group
- `timestamp` - When event occurred
- `userAgent` - Browser information
- `ipAddress` - User IP (for fraud detection)

## Development Tips

- Use browser DevTools Network tab to see event tracking
- Check MongoDB compass/atlas to view raw event data
- Use analytics endpoints to verify data collection
- Test with multiple browsers to simulate different users

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- CORS, rate limiting
- UUID for ID generation

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- React Context for state management

## License

ISC

## Contributing

This is an experimental platform. Feel free to extend and modify for your research needs.

## Support

For issues or questions:
1. Check the README files in backend/ and frontend/
2. Review API endpoint documentation
3. Check browser console for errors
4. Verify MongoDB connection
