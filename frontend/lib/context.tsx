'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Product, initUser, updateUserBalance } from './api';
import { initAnalytics, getAnalytics } from './analytics';

interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  user: User | null;
  sessionId: string;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  checkout: () => Promise<boolean>;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Generate or retrieve user ID from localStorage
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId] = useState<string>(() => getSessionId());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user and analytics
  useEffect(() => {
    const init = async () => {
      try {
        const userId = getUserId();
        const userData = await initUser(userId);
        setUser(userData);

        // Initialize analytics
        initAnalytics(userData.userId, sessionId, userData.abTestGroup);

        // Track initial page view
        const analytics = getAnalytics();
        if (analytics) {
          analytics.trackPageView('home', document.referrer);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.destroy();
      }
    };
  }, [sessionId]);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.productId === product.productId);

      if (existingItem) {
        const newCart = prevCart.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        // Track event
        const analytics = getAnalytics();
        if (analytics) {
          analytics.trackAddToCart(product.productId, product.name, product.price, 1);
        }

        return newCart;
      }

      // Track event
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackAddToCart(product.productId, product.name, product.price, 1);
      }

      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.productId === productId);

      if (!existingItem) return prevCart;

      // Track event
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackRemoveFromCart(productId, existingItem.product.name, 1);
      }

      if (existingItem.quantity === 1) {
        return prevCart.filter((item) => item.product.productId !== productId);
      }

      return prevCart.map((item) =>
        item.product.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const checkout = async (): Promise<boolean> => {
    if (!user || cart.length === 0) return false;

    try {
      // Track checkout start
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackCheckoutStart(cart, cartTotal);
      }

      // Check if user has enough balance
      if (user.balance < cartTotal) {
        alert('Insufficient balance!');
        return false;
      }

      // Deduct balance
      const updatedUser = await updateUserBalance(user.userId, cartTotal, 'deduct');
      setUser(updatedUser);

      // Track checkout complete
      const orderId = uuidv4();
      if (analytics) {
        analytics.trackCheckoutComplete(orderId, cart, cartTotal);
      }

      // Clear cart
      clearCart();

      return true;
    } catch (error) {
      console.error('Checkout failed:', error);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        sessionId,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        checkout,
        isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
