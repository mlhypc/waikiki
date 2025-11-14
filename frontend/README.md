# Waikiki Store - Frontend

User behavior tracking frontend for the clothing store experiment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Anonymous User Tracking**: Each user gets a unique ID stored in localStorage
- **A/B Testing**: Users are automatically assigned to test groups (A, B, C, D)
- **Comprehensive Event Tracking**:
  - Page views
  - Product views and clicks
  - Cart interactions
  - Checkout flow
  - Scroll depth
  - Hover events
  - Filter and sort actions
  - Time spent on pages

- **Shopping Features**:
  - Product catalog with filtering and sorting
  - Shopping cart with real-time updates
  - Mock checkout with balance tracking
  - Different prices for different A/B test groups

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repo in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Deploy!

Vercel will automatically detect Next.js and configure the build.

## User Flow

1. User visits the site → Gets assigned a unique ID and A/B test group
2. User browses products → All interactions are tracked
3. User adds items to cart → Cart events tracked
4. User checks out → Purchase recorded with order details
5. All data sent to backend API for analysis

## Tracked Events

- `page_view` - Page navigation
- `product_view` - Product card viewed
- `product_click` - Product clicked
- `add_to_cart` - Item added to cart
- `remove_from_cart` - Item removed from cart
- `cart_view` - Cart opened
- `checkout_start` - Checkout initiated
- `checkout_complete` - Purchase completed
- `scroll` - Scroll depth milestones
- `hover` - Element hover duration
- `click` - General clicks
- `time_spent` - Time on page
- `filter_applied` - Category filter used
- `sort_applied` - Sort option changed
