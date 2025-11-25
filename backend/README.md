# Waikiki Store - Backend API

Backend API for the Waikiki A/B testing e-commerce experiment platform. Built with Express.js and MongoDB.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (via Mongoose 8.19.3)
- **Rate Limiting**: express-rate-limit
- **CORS**: Enabled for frontend integration

### Core Components
- **REST API**: 4 main route modules (Users, Products, Events, Analytics)
- **MongoDB Models**: User, Product, Event
- **A/B Testing**: 4-group split (A, B, C, D) for cart suggestion strategies
- **Event Tracking**: Comprehensive user behavior analytics

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js          # User model with A/B group & balance
│   ├── Product.js       # Product catalog with suggestions
│   └── Event.js         # Analytics event tracking
├── routes/
│   ├── users.js         # User management & survey endpoints
│   ├── products.js      # Product catalog & suggestions
│   ├── events.js        # Event tracking & batch recording
│   └── analytics.js     # Analytics & reporting endpoints
├── server.js            # Express server setup
├── import-lcw-data.js   # Data import script from LCW source
├── copy-images.js       # Image asset migration tool
├── seed.js              # Database seeding script
└── package.json         # Dependencies & scripts
```

## 🗄️ Data Models

### User Model
```javascript
{
  userId: String,           // Unique UUID
  abTestGroup: String,      // 'A' | 'B' | 'C' | 'D'
  balance: Number,          // Virtual money (starts at 1000 TL)
  metadata: {
    userAgent: String,
    firstVisit: Date,
    lastVisit: Date
  },
  surveyResponses: {
    age: String,            // '18-24', '25-34', '35-44', '45+'
    gender: String,         // 'Kadın', 'Erkek', 'Diğer'
    completedAt: Date
  },
  totalPurchases: Number,
  totalSpent: Number
}
```

### Product Model
```javascript
{
  productId: String,              // Unique product identifier
  name: String,                   // Product name
  description: [String],          // Multi-line description
  price: Number,                  // Final price
  originalPrice: Number,          // Before discount
  discountedPrice: Number,        // After discount
  currency: String,               // 'TL'
  category: String,               // 'alt_giyim', 'ust_giyim', 'dis_giyim', 'ayakkabi'
  gender: String,                 // 'Kadın', 'Erkek', 'Unisex'
  images: [String],               // Image URLs
  sizes: [String],                // Available sizes
  stock: Number,
  productCode: String,
  mannequinInfo: String,
  properties: Mixed,
  combinationSuggestions: [{      // Pre-defined combos
    comboIndex: Number,
    products: [{ url, title, productId }]
  }],
  relatedProducts: [String],      // Related product IDs
  abTestGroup: String             // Default: 'B'
}
```

### Event Model
```javascript
{
  userId: String,
  sessionId: String,
  eventType: String,        // See Event Types below
  eventData: Mixed,         // Event-specific payload
  abTestGroup: String,
  userAgent: String,
  ipAddress: String,
  timestamp: Date
}
```

**Event Types:**
- `page_view` - Page navigation
- `product_view` - Product detail view
- `product_click` - Product card click
- `add_to_cart` - Add to cart action
- `remove_from_cart` - Remove from cart
- `cart_view` - Cart page view
- `checkout_start` - Checkout initiated
- `checkout_complete` - Purchase completed
- `scroll` - Scroll depth tracking
- `hover` - Element hover events
- `click` - Generic click events
- `time_spent` - Time on page
- `search` - Search queries
- `filter_applied` - Filter usage
- `sort_applied` - Sort usage
- `suggestion_view` - Suggestion displayed
- `suggestion_click` - Suggestion clicked
- `suggestion_add_to_cart` - Suggestion added to cart

## 🔌 API Endpoints

### Users API (`/api/users`)

#### POST `/api/users/init`
Initialize or retrieve anonymous user
```javascript
// Request
{ userId?: string }

// Response
{ user: User }
```

#### GET `/api/users/:userId`
Get user information
```javascript
// Response
{ user: User }
```

#### PATCH `/api/users/:userId/balance`
Update user balance (after purchase)
```javascript
// Request
{
  amount: number,
  type: 'deduct' | 'add'
}

// Response
{ user: User }
```

#### PATCH `/api/users/:userId/survey`
Submit survey responses
```javascript
// Request
{
  age: string,
  gender: string
}

// Response
{ user: User }
```

### Products API (`/api/products`)

#### GET `/api/products`
Get all products with optional filtering
```javascript
// Query params: ?category=alt_giyim&gender=Kadın&abTestGroup=B

// Response
{ products: Product[] }
```

#### GET `/api/products/:productId`
Get single product details
```javascript
// Query params: ?abTestGroup=B

// Response
{ product: Product }
```

#### GET `/api/products/suggestions/:productId`
Get cart suggestions based on A/B test group
```javascript
// Query params: ?abTestGroup=B (required)

// Response
{ suggestions: Product[] }

// Logic:
// Group A: No suggestions
// Group B: Random from combinationSuggestions
// Group C: AI suggestions (placeholder: uses relatedProducts)
// Group D: Related products (control)
```

### Events API (`/api/events`)

#### POST `/api/events`
Track single event
```javascript
// Request
{
  userId: string,
  sessionId: string,
  eventType: string,
  eventData: object,
  abTestGroup?: string
}

// Response
{ success: true, eventId: string }
```

#### POST `/api/events/batch`
Track multiple events (better performance)
```javascript
// Request
{
  events: [
    { userId, sessionId, eventType, eventData, abTestGroup }
  ]
}

// Response
{ success: true, count: number }
```

#### GET `/api/events/user/:userId`
Get events for a user (debugging/admin)
```javascript
// Query params: ?limit=100&skip=0

// Response
{ events: Event[], count: number }
```

### Analytics API (`/api/analytics`)

#### GET `/api/analytics/overview`
Get analytics overview
```javascript
// Response
{
  overview: {
    totalUsers: number,
    totalEvents: number,
    usersByGroup: [{
      _id: string,
      count: number,
      avgBalance: number,
      avgPurchases: number,
      avgSpent: number
    }],
    eventsByType: [{
      _id: string,
      count: number
    }]
  }
}
```

#### GET `/api/analytics/funnel`
Get conversion funnel metrics
```javascript
// Query params: ?abTestGroup=B

// Response
{
  funnel: {
    pageViews: number,
    productViews: number,
    addToCarts: number,
    checkoutStarts: number,
    purchases: number,
    conversionRate: string
  },
  rawData: []
}
```

#### GET `/api/analytics/export`
Export all data for analysis
```javascript
// Query params: ?format=json|csv&startDate=2024-01-01&endDate=2024-12-31&abTestGroup=B

// Response (JSON)
{
  events: Event[],
  users: User[],
  metadata: {
    exportDate: string,
    eventCount: number,
    userCount: number,
    filters: object
  }
}

// Response (CSV)
// CSV file download with event data
```

#### GET `/api/analytics/journey/:userId`
Get user journey timeline
```javascript
// Response
{
  user: User,
  journey: Event[],
  summary: {
    totalEvents: number,
    uniqueSessions: number,
    eventTypes: string[]
  }
}
```

#### GET `/api/analytics/ab-comparison`
Compare A/B test group performance
```javascript
// Response
{
  comparison: [{
    _id: string,              // A/B group
    totalUsers: number,
    avgBalance: number,
    avgPurchases: number,
    avgSpent: number,
    totalRevenue: number
  }]
}
```

## 🧪 A/B Test Groups

The platform tests 4 different cart suggestion strategies:

| Group | Strategy | Implementation |
|-------|----------|----------------|
| **A** | No suggestions | Returns empty array |
| **B** | Random suggestions | Uses `combinationSuggestions` from product data |
| **C** | AI-powered | Placeholder (currently uses `relatedProducts`) |
| **D** | Related products (Control) | Uses `relatedProducts` field |

Users are randomly assigned to a group on first visit and remain in that group throughout the experiment.

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- LCW product data folder (for import)

### Environment Variables
Create `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waikiki-store
SURVEY_MODE=false
```

**SURVEY_MODE Explanation:**
- `SURVEY_MODE=false` - **Test Mode**: No data is saved to database (for development/testing)
- `SURVEY_MODE=true` - **Survey Mode**: All data is collected and saved (for actual experiment)

This is crucial for your bachelor thesis - you don't want test data mixed with real participant data!

### Installation Steps

1. **Install dependencies**
```bash
npm install
```

2. **Setup MongoDB**
```bash
# Start local MongoDB (if using local)
mongod

# Or use MongoDB Atlas connection string in .env
```

3. **Import product data**
```bash
# Copy product images to frontend
npm run copy-images

# Import product data to MongoDB
npm run import

# Or run both sequentially
npm run setup
```

4. **Start server**
```bash
# Production
npm start

# Development
npm run dev
```

Server will run on `http://localhost:5000`

## 📊 Data Import Scripts

### copy-images.js
Copies product images from LCW data folder to frontend public directory.

```bash
npm run copy-images
```

**Process:**
1. Scans source folder for product directories with photos
2. Creates destination folder structure
3. Copies all `.jpg` and `.png` files
4. Maintains folder naming for URL consistency

**Configuration:**
- Source: `C:\Users\Qwilleran\Desktop\waikiki_model\DATA_GET\data\0_3-data_seperated`
- Destination: `../frontend/public/products/`

### import-lcw-data.js
Imports product metadata from LCW JSON files to MongoDB.

```bash
npm run import
```

**Process:**
1. Recursively scans for `info.json` files
2. Extracts category and gender from folder structure
3. Parses Turkish price format (comma decimal separator)
4. Processes combination suggestions with product IDs
5. Creates image URL paths
6. Clears existing products and imports new data

**Data Processing:**
- Category extraction from path (alt_giyim, ust_giyim, dis_giyim, ayakkabi)
- Gender extraction from path (Kadın, Erkek)
- Price parsing (handles "TL" suffix and comma decimals)
- Related products ID extraction from URLs
- Combination suggestions with product linking

## 🔒 Security Features

- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Input Validation**: Required field checks on all POST/PATCH endpoints
- **MongoDB Injection Protection**: Mongoose sanitization

## 🎓 Survey Mode vs Test Mode

The platform supports two operational modes to separate test data from real experiment data:

### Test Mode (SURVEY_MODE=false)
**Use this during development and testing**

- ✅ Users and events are NOT saved to database
- ✅ API returns mock responses
- ✅ Frontend shows: "🧪 TEST MODE - Data is NOT being saved"
- ✅ Console logs event counts without saving
- ✅ Perfect for development, debugging, and feature testing

**API Behavior:**
- `/api/users/init` - Returns mock user object
- `/api/events` - Acknowledges but doesn't save
- `/api/events/batch` - Acknowledges but doesn't save
- All responses include `mode: 'test', saved: false`

### Survey Mode (SURVEY_MODE=true)
**Use this ONLY when collecting real experiment data**

- 📊 All users and events ARE saved to database
- 📊 Frontend shows: "📊 SURVEY MODE - Data is being collected"
- 📊 Full analytics tracking and storage
- 📊 Use this when sharing with thesis participants

**API Behavior:**
- `/api/users/init` - Creates/retrieves user in database
- `/api/events` - Saves events to database
- `/api/events/batch` - Saves all events to database
- All responses include `mode: 'survey', saved: true`

### Switching Modes

**Backend (.env):**
```bash
# Development/Testing
SURVEY_MODE=false

# Real Experiment
SURVEY_MODE=true
```

**Frontend (.env.local):**
```bash
# Development/Testing
NEXT_PUBLIC_SURVEY_MODE=false

# Real Experiment
NEXT_PUBLIC_SURVEY_MODE=true
```

**Important:** Both backend AND frontend must be set to the same mode!

### Visual Indicators

When the frontend loads, check the browser console:
- 🧪 **TEST MODE** (orange text) - "Data is NOT being saved"
- 📊 **SURVEY MODE** (green text) - "Data is being collected"

## 📈 Performance Optimizations

### Database Indexes
```javascript
// Event Model
eventSchema.index({ userId: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ abTestGroup: 1, eventType: 1 });

// User Model
userId: { index: true }
abTestGroup: { index: true }

// Product Model
productId: { unique: true }
```

### Batch Event Tracking
Use `/api/events/batch` for high-volume tracking to reduce database roundtrips.

### Aggregation Pipeline
Analytics endpoints use MongoDB aggregation for efficient computation.

## 🐛 Debugging

### Health Check
```bash
curl http://localhost:5000/health
```

### View User Events
```bash
curl http://localhost:5000/api/events/user/{userId}?limit=50
```

### Check MongoDB Connection
Server logs will show:
- ✅ MongoDB Connected (success)
- ❌ MongoDB Connection Error (failure)

## 📝 Development Notes

### Adding New Event Types
1. Add event type to `Event.js` model enum
2. Update frontend tracking hooks
3. Document in analytics reporting

### Modifying A/B Test Logic
Edit suggestion logic in [products.js:46-115](routes/products.js)

### Extending Analytics
Add new aggregation queries to [analytics.js](routes/analytics.js)

## 🔄 Data Flow

```
User Request → Express Server → Rate Limiter → Route Handler
                                                     ↓
                                            MongoDB Query
                                                     ↓
                                            Response JSON
```

**Event Tracking Flow:**
```
Frontend Action → POST /api/events → Event Model → MongoDB
                                                       ↓
                                              Analytics Queries
```

## 🎯 Testing the A/B Test

1. Create 4 test users (one per group)
2. Track `add_to_cart` events
3. Request suggestions via `/api/products/suggestions/:productId?abTestGroup=X`
4. Compare results:
   - Group A: Empty array
   - Group B: Combination-based suggestions
   - Group C: AI suggestions (placeholder)
   - Group D: Related products

## 🚨 Common Issues

### MongoDB Connection Failed
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI in `.env`
- Check network/firewall for MongoDB Atlas

### Images Not Loading
- Run `npm run copy-images` first
- Check source path in `copy-images.js`
- Verify frontend public directory exists

### Import Failed
- Check source data path in `import-lcw-data.js`
- Ensure `info.json` files exist in source
- Verify MongoDB connection before import

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)

## 🔮 Future Enhancements

- [ ] Implement actual AI suggestions for Group C
- [ ] Add Redis caching for product queries
- [ ] WebSocket support for real-time analytics
- [ ] GraphQL API option
- [ ] Advanced recommendation algorithms
- [ ] Machine learning integration for personalization
