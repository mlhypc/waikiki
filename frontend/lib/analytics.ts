import { trackEvent, trackEventBatch } from './api';

let eventQueue: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

const FLUSH_INTERVAL = 5000; // Flush events every 5 seconds
const MAX_QUEUE_SIZE = 50; // Flush if queue reaches 50 events

export class Analytics {
  private userId: string;
  private sessionId: string;
  private abTestGroup: string;
  private startTime: number;
  private pageStartTime: number;
  private currentPage: string;

  constructor(userId: string, sessionId: string, abTestGroup: string) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.abTestGroup = abTestGroup;
    this.startTime = Date.now();
    this.pageStartTime = Date.now();
    this.currentPage = '';
  }

  private queueEvent(eventType: string, eventData: any) {
    eventQueue.push({
      userId: this.userId,
      sessionId: this.sessionId,
      eventType,
      eventData: {
        ...eventData,
        timestamp: Date.now(),
      },
      abTestGroup: this.abTestGroup,
    });

    // Auto-flush if queue is full
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    } else if (!flushTimeout) {
      // Schedule flush
      flushTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL);
    }
  }

  async flush() {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue = [];

    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    await trackEventBatch(events);
  }

  // Page tracking
  trackPageView(page: string, referrer?: string) {
    // Track time spent on previous page
    if (this.currentPage) {
      this.trackTimeSpent(this.currentPage, Date.now() - this.pageStartTime);
    }

    this.currentPage = page;
    this.pageStartTime = Date.now();

    this.queueEvent('page_view', {
      page,
      referrer: referrer || document.referrer,
      url: window.location.href,
    });
  }

  // Product tracking
  trackProductView(productId: string, productName: string, price: number) {
    this.queueEvent('product_view', {
      productId,
      productName,
      price,
      page: this.currentPage,
    });
  }

  trackProductClick(productId: string, productName: string, position?: number) {
    this.queueEvent('product_click', {
      productId,
      productName,
      position,
      page: this.currentPage,
    });
  }

  // Cart tracking
  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    this.queueEvent('add_to_cart', {
      productId,
      productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  trackRemoveFromCart(productId: string, productName: string, quantity: number) {
    this.queueEvent('remove_from_cart', {
      productId,
      productName,
      quantity,
    });
  }

  trackCartView(cartItems: any[], cartTotal: number) {
    this.queueEvent('cart_view', {
      itemCount: cartItems.length,
      cartTotal,
      items: cartItems,
    });
  }

  // Checkout tracking
  trackCheckoutStart(cartItems: any[], cartTotal: number) {
    this.queueEvent('checkout_start', {
      itemCount: cartItems.length,
      cartTotal,
      items: cartItems,
    });
  }

  trackCheckoutComplete(orderId: string, cartItems: any[], total: number) {
    this.queueEvent('checkout_complete', {
      orderId,
      itemCount: cartItems.length,
      total,
      items: cartItems,
    });
  }

  // Interaction tracking
  trackClick(element: string, elementText?: string, elementId?: string) {
    this.queueEvent('click', {
      element,
      elementText,
      elementId,
      page: this.currentPage,
    });
  }

  trackHover(element: string, duration: number) {
    this.queueEvent('hover', {
      element,
      duration,
      page: this.currentPage,
    });
  }

  trackScroll(scrollDepth: number) {
    this.queueEvent('scroll', {
      scrollDepth,
      page: this.currentPage,
    });
  }

  trackTimeSpent(page: string, duration: number) {
    this.queueEvent('time_spent', {
      page,
      duration,
    });
  }

  // Search and filter tracking
  trackSearch(query: string, resultsCount: number) {
    this.queueEvent('search', {
      query,
      resultsCount,
    });
  }

  trackFilterApplied(filterType: string, filterValue: string) {
    this.queueEvent('filter_applied', {
      filterType,
      filterValue,
      page: this.currentPage,
    });
  }

  trackSortApplied(sortBy: string) {
    this.queueEvent('sort_applied', {
      sortBy,
      page: this.currentPage,
    });
  }

  // Cleanup
  destroy() {
    // Track time spent on final page
    if (this.currentPage) {
      this.trackTimeSpent(this.currentPage, Date.now() - this.pageStartTime);
    }

    // Flush remaining events
    this.flush();
  }
}

// Export singleton-like instance
let analyticsInstance: Analytics | null = null;

export const initAnalytics = (userId: string, sessionId: string, abTestGroup: string) => {
  analyticsInstance = new Analytics(userId, sessionId, abTestGroup);
  return analyticsInstance;
};

export const getAnalytics = (): Analytics | null => {
  return analyticsInstance;
};
