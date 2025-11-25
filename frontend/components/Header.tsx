'use client';

import React from 'react';
import { useStore } from '@/lib/context';
import { getCartQuantity } from '@/lib/utils';

export const Header: React.FC = () => {
  const { cart, setIsCartOpen, favorites, setIsFavoritesOpen } = useStore();

  const cartCount = getCartQuantity(cart);
  const favoritesCount = favorites.length;

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4  py-2 md:py-4">
        <div className="flex items-center justify-center md:justify-between">
          {/* Logo - Centered on mobile, left on desktop */}
          <h1 className="text-3xl font-bold text-blue-600">
            WAIKIKI
          </h1>

          {/* Icons - Hidden on mobile (shown in BottomNav), visible on desktop */}
          <div className="hidden md:flex gap-6">
            {/* Favorites Icon */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="flex flex-col items-center text-gray-700 relative hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
              <span className="text-xs mt-1">Favoriler</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center text-gray-700 relative hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="text-xs mt-1">Sepet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
