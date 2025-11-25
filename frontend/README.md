# Waikiki Store - Frontend

Modern, responsive e-commerce frontend application built with Next.js 16 for AI-powered shopping cart suggestion A/B testing experiments.

## 🏗️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Analytics**: Custom event tracking system
- **HTTP Client**: Fetch API
- **UUID Generation**: uuid v13.0.0

## 📁 Project Structure

```
frontend/
├── app/
│   ├── [gender]/              # Dynamic gender routes
│   │   ├── page.tsx           # Gender category page (Kadın/Erkek)
│   │   └── [category]/        # Product category pages
│   │       └── page.tsx       # Category product listing
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Home page (gender selection)
│   └── globals.css            # Global styles
├── components/
│   ├── BottomNav.tsx          # Mobile bottom navigation
│   ├── Breadcrumb.tsx         # Navigation breadcrumbs
│   ├── Cart.tsx               # Shopping cart sidebar
│   ├── EmptyState.tsx         # Empty state component
│   ├── Header.tsx             # App header with cart icon
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── ProductCard.tsx        # Product display card
│   └── SurveyModal.tsx        # Survey collection modal
├── hooks/
│   └── useAnalytics.ts        # Analytics tracking hooks
├── lib/
│   ├── analytics.ts           # Analytics implementation
│   ├── api.ts                 # Backend API client
│   ├── categories.ts          # Category definitions
│   ├── context.tsx            # Global state management
│   └── utils.ts               # Utility functions
├── public/
│   └── products/              # Product images
├── .env.local                 # Environment variables
└── package.json               # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SURVEY_MODE=false
```

**NEXT_PUBLIC_SURVEY_MODE:**
- `false` - **Test Mode**: No data collection, for development
- `true` - **Survey Mode**: Full data collection, for experiments

## 🎨 Features

### 1. **Responsive Design**
- Mobile-first approach
- Bottom navigation for mobile
- Header cart icon for desktop
- Adaptive grid layouts

### 2. **Shopping Cart**
- Persistent cart (localStorage)
- Real-time quantity updates
- Sidebar UI with backdrop
- Add/remove items
- Checkout flow

### 3. **Product Browsing**
- Gender-based navigation (Kadın/Erkek)
- Category filtering (Üst Giyim, Alt Giyim, Dış Giyim, Ayakkabı)
- Product cards with images
- Quick add to cart

### 4. **Analytics Tracking**
- Page view tracking
- Product interaction tracking
- Cart events
- Scroll depth tracking
- Hover duration tracking
- Batch event submission (every 5s or 50 events)

### 5. **Survey System**
- Shows only in survey mode
- One-time display (localStorage tracking)
- Age and gender collection
- Turkish language interface

### 6. **A/B Test Support**
- Random group assignment (A, B, C, D)
- User-specific suggestions
- Persistent group membership

## 🧩 Core Components

### Layout & Navigation

#### Header (`components/Header.tsx`)
- Sticky header with logo
- Desktop cart icon with badge
- Clickable to open cart sidebar

#### BottomNav (`components/BottomNav.tsx`)
- Mobile-only navigation
- 5 items: Home, Categories (disabled), Cart, Favorites (disabled), Login (disabled)
- Cart badge with count
- TypeScript typed navigation items

#### Cart (`components/Cart.tsx`)
- Slide-in sidebar from right
- Product list with quantity controls
- Checkout button
- Context-based state management
- Analytics tracking

### Product Display

#### ProductCard (`components/ProductCard.tsx`)
```typescript
// Features:
- Product image with Next.js Image optimization
- Hover tracking (>500ms)
- Click tracking with position
- Quick add to cart button (hover reveal)
- Responsive sizing
```

#### Category Pages
- Dynamic routes: `/[gender]/[category]`
- Gender filtering with Turkish character normalization
- Empty states for no products
- Grid layout (2-4 columns based on screen size)

### Survey Modal (`components/SurveyModal.tsx`)
```typescript
// Shown when:
- NEXT_PUBLIC_SURVEY_MODE === 'true'
- localStorage.surveyCompleted !== 'true'
- user.surveyResponses.completedAt is null

// Fields:
- Age: 18-24, 25-34, 35-44, 45+
- Gender: Kadın, Erkek, Diğer
```

## 📊 State Management

### Global Context (`lib/context.tsx`)

```typescript
interface StoreContextType {
  // User
  user: User | null;
  sessionId: string;
  isLoading: boolean;

  // Cart
  cart: CartItem[];
  cartTotal: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<boolean>;

  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Survey
  showSurvey: boolean;
  handleSurveySubmit: (age: string, gender: string) => Promise<void>;
}
```

### State Persistence
- **Cart**: localStorage (`cart` key)
- **User ID**: localStorage (`userId` key)
- **Session ID**: sessionStorage (`sessionId` key)
- **Survey Completion**: localStorage (`surveyCompleted` key)

## 📡 API Integration

### API Client (`lib/api.ts`)

```typescript
// User APIs
initUser(userId?: string) → User
getUser(userId: string) → User
updateUserBalance(userId, amount, type) → User
submitSurvey(userId, age, gender) → User

// Product APIs
getProducts(abTestGroup?, category?) → Product[]
getProduct(productId, abTestGroup?) → Product
getSuggestions(productId, abTestGroup) → Product[]

// Event APIs
trackEvent(params: TrackEventParams) → void
trackEventBatch(events: TrackEventParams[]) → void
```

### API Response Handling
- Survey mode awareness (checks `mode` and `saved` in response)
- Error handling with console logs
- Automatic retry logic for failed requests

## 📈 Analytics System

### Analytics Class (`lib/analytics.ts`)

```typescript
class Analytics {
  // Page Tracking
  trackPageView(page, referrer?)
  trackTimeSpent(page, duration)

  // Product Tracking
  trackProductView(productId, productName, price)
  trackProductClick(productId, productName, position?)

  // Cart Tracking
  trackAddToCart(productId, productName, price, quantity)
  trackRemoveFromCart(productId, productName, quantity)
  trackCartView(cartItems, cartTotal)

  // Checkout Tracking
  trackCheckoutStart(cartItems, cartTotal)
  trackCheckoutComplete(orderId, cartItems, total)

  // Interaction Tracking
  trackClick(element, elementText?, elementId?)
  trackHover(element, duration)
  trackScroll(scrollDepth)

  // Batch Processing
  flush() // Sends queued events
}
```

### Event Queue System
- **Auto-flush**: Every 5 seconds
- **Size-based flush**: At 50 events
- **Manual flush**: On page unload
- **Survey mode check**: Events not sent in test mode

### Analytics Hooks (`hooks/useAnalytics.ts`)

```typescript
// Page tracking
usePageTracking(pageName)

// Scroll tracking (25% milestones)
useScrollTracking()

// Hover tracking (>500ms duration)
useHoverTracking(elementName)
```

## 🎯 Category System

### Categories (`lib/categories.ts`)

```typescript
const categories = {
  kadin: [
    { id: 'ust_giyim', name: 'Üst Giyim', icon: '👕' },
    { id: 'alt_giyim', name: 'Alt Giyim', icon: '👖' },
    { id: 'dis_giyim', name: 'Dış Giyim', icon: '🧥' },
    { id: 'ayakkabi', name: 'Ayakkabı', icon: '👠' }
  ],
  erkek: [
    { id: 'ust_giyim', name: 'Üst Giyim', icon: '👔' },
    { id: 'alt_giyim', name: 'Alt Giyim', icon: '👖' },
    { id: 'dis_giyim', name: 'Dış Giyim', icon: '🧥' },
    { id: 'ayakkabi', name: 'Ayakkabı', icon: '👞' }
  ]
};
```

### Turkish Character Normalization
```typescript
// Handles gender filtering
// 'Kadın' (backend) → 'kadin' (URL) → match
normalizeGender(str: string) {
  return str.toLowerCase()
    .replace('ı', 'i')
    .replace('ğ', 'g')
    .replace('ü', 'u')
    .replace('ş', 's')
    .replace('ö', 'o')
    .replace('ç', 'c');
}
```

## 🛠️ Utility Functions

### Cart Utilities (`lib/utils.ts`)

```typescript
// Get display title for gender
getGenderTitle(gender: string) → string
// 'kadin' → 'Kadın'
// 'erkek' → 'Erkek'

// Calculate total cart quantity
getCartQuantity(cart: CartItem[]) → number
```

## 🎨 Styling

### Tailwind Configuration
- Custom color scheme
- Responsive breakpoints (sm, md, lg)
- Custom utilities for Turkish text
- Mobile-first approach

### CSS Classes Conventions
```css
/* Layout */
.min-h-screen       /* Full viewport height */
.max-w-6xl          /* Content width constraint */
.mx-auto            /* Center content */

/* Components */
.bg-white           /* White backgrounds */
.text-gray-900      /* Dark text */
.rounded-lg         /* Rounded corners */
.shadow-xl          /* Elevation */

/* Interactive */
.hover:bg-gray-100  /* Hover states */
.transition-colors  /* Smooth transitions */
.cursor-pointer     /* Clickable elements */
```

## 🧪 Testing Modes

### Test Mode (Development)
```bash
NEXT_PUBLIC_SURVEY_MODE=false
```
- ✅ No data collection
- ✅ Console logs for events
- ✅ Survey modal hidden
- ✅ Full UI functionality
- ✅ Cart and checkout work
- 🧪 Perfect for development

### Survey Mode (Production)
```bash
NEXT_PUBLIC_SURVEY_MODE=true
```
- 📊 Full data collection
- 📊 Events saved to database
- 📊 Survey modal shown
- 📊 User behavior tracked
- 🎓 Use for thesis data collection

### Visual Indicators

**Browser Console:**
- Test Mode: `🧪 TEST MODE` (orange) - "Data is NOT being saved"
- Survey Mode: `📊 SURVEY MODE` (green) - "Data is being collected"

## 🚨 Common Issues

### Images Not Loading
```bash
# Ensure product images are copied
cd ../backend
npm run copy-images
```

### Survey Modal Not Showing
```bash
# Check environment variable
echo $NEXT_PUBLIC_SURVEY_MODE  # Should be 'true'

# Clear localStorage
localStorage.clear()
```

### Cart Not Persisting
```bash
# Check browser localStorage
localStorage.getItem('cart')

# Ensure cart state updates properly
# Check browser dev tools → Application → Local Storage
```

### TypeScript Errors
```bash
# Rebuild Next.js types
rm -rf .next
npm run dev
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
default:  < 640px   (mobile)
sm:       ≥ 640px   (mobile landscape)
md:       ≥ 768px   (tablet)
lg:       ≥ 1024px  (desktop)
xl:       ≥ 1280px  (large desktop)
```

### Component Visibility
- **BottomNav**: Mobile only (`md:hidden`)
- **Header Cart Icon**: Desktop only (`hidden md:block`)
- **Product Grid**: 2 cols (mobile) → 3 cols (tablet) → 4 cols (desktop)

## 🔧 Development Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🎓 Bachelor Thesis Integration

### Data Collection Strategy

1. **Test Mode** (Development)
   - Develop features without polluting data
   - Test user flows
   - Debug tracking events

2. **Survey Mode** (Experiment)
   - Deploy to participants
   - Collect real behavior data
   - One-time survey on first visit

### A/B Test Groups

| Group | Strategy | Purpose |
|-------|----------|---------|
| **A** | No suggestions | Baseline |
| **B** | Random combinations | Pre-defined combos |
| **C** | AI-powered | Placeholder (future) |
| **D** | Related products | Control group |

### Metrics Tracked
- Page views per session
- Product interaction rate
- Add to cart conversion
- Checkout completion rate
- Time on page
- Scroll depth
- Hover engagement
- Cart abandonment rate

## 🔐 Privacy & Ethics

### User Data
- Anonymous user IDs (UUID)
- No personal information required
- Survey responses (age, gender) are optional
- Data used for research purposes only

### Compliance
- localStorage for user consent tracking
- Survey displayed once per user
- Clear data usage messaging in survey modal

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.com
NEXT_PUBLIC_SURVEY_MODE=true
```

### Environment Setup
1. Update `.env.local` with production API URL
2. Set `NEXT_PUBLIC_SURVEY_MODE=true` for data collection
3. Ensure backend is accessible from frontend domain
4. Configure CORS on backend

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🔮 Future Enhancements

- [ ] Product detail pages
- [ ] Product image gallery
- [ ] Size selection
- [ ] Wishlist functionality
- [ ] Search functionality
- [ ] Filter and sort options
- [ ] Product recommendations (Group C AI)
- [ ] User authentication
- [ ] Order history
- [ ] Payment integration (mock)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Accessibility improvements (ARIA labels)

## 🐛 Debugging Tips

### Check Survey Mode Status
```javascript
// In browser console
console.log('Survey Mode:', process.env.NEXT_PUBLIC_SURVEY_MODE)
localStorage.getItem('surveyCompleted')
```

### View Cart State
```javascript
// In browser console
JSON.parse(localStorage.getItem('cart'))
```

### Monitor Analytics Events
```javascript
// Events are logged in test mode
// Check browser console for:
// "🧪 TEST MODE: Events not sent to server"
```

### Clear All Local Data
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

## 📞 Support

For issues or questions related to this thesis project, contact the development team or refer to the backend README for API documentation.

---

**Built with ❤️ for Bachelor Thesis Research**
