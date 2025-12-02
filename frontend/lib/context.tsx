'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Product, initUser, updateUserBalance } from './api';
import { initAnalytics, getAnalytics } from './analytics';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  user: User | null;
  setUser: (user: User) => void;
  sessionId: string;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  checkout: () => Promise<boolean>;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  showSurvey: boolean;
  handleSurveySubmit: (age: string, gender: string, frequency: string) => Promise<void>;
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;
  selectedProductId: string | null;
  setSelectedProductId: (productId: string | null) => void;
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Custom setters that close other modals when opening cart/favorites
  const openCart = (open: boolean) => {
    if (open) {
      if (selectedProductId) {
        setSelectedProductId(null); // Close product modal first
      }
      if (isFavoritesOpen) {
        setIsFavoritesOpen(false); // Close favorites first
      }
    }
    setIsCartOpen(open);
  };

  const openFavorites = (open: boolean) => {
    if (open) {
      if (selectedProductId) {
        setSelectedProductId(null); // Close product modal first
      }
      if (isCartOpen) {
        setIsCartOpen(false); // Close cart first
      }
    }
    setIsFavoritesOpen(open);
  };

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

        // Check if survey should be shown (only in survey mode and if not completed)
        const surveyMode = process.env.NEXT_PUBLIC_SURVEY_MODE === 'true';
        const surveyCompleted = localStorage.getItem('surveyCompleted');

        if (surveyMode && !surveyCompleted && !userData.surveyResponses?.completedAt) {
          setShowSurvey(true);
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

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

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

  const handleSurveySubmit = async (age: string, gender: string, frequency: string) => {
    if (!user) return;

    try {
      const { submitSurvey } = await import('./api');
      await submitSurvey(user.userId, age, gender, frequency);

      // Mark survey as completed in localStorage
      localStorage.setItem('surveyCompleted', 'true');
      setShowSurvey(false);
    } catch (error) {
      console.error('Survey submission failed:', error);
    }
  };

  const addToFavorites = (product: Product) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.find((p) => p.productId === product.productId);
      if (exists) return prevFavorites;
      return [...prevFavorites, product];
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((p) => p.productId !== productId)
    );
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some((p) => p.productId === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        sessionId,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        checkout,
        isLoading,
        isCartOpen,
        setIsCartOpen: openCart,
        showSurvey,
        handleSurveySubmit,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        isFavoritesOpen,
        setIsFavoritesOpen: openFavorites,
        selectedProductId,
        setSelectedProductId,
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
