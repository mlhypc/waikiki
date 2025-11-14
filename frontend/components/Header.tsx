'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/context';
import { useAnalytics } from '@/hooks/useAnalytics';

export const Header: React.FC = () => {
  const { user, cart } = useStore();
  const analytics = useAnalytics();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Shirts', value: 'shirts' },
    { name: 'Pants', value: 'pants' },
    { name: 'Dresses', value: 'dresses' },
    { name: 'Shoes', value: 'shoes' },
    { name: 'Accessories', value: 'accessories' },
    { name: 'Outerwear', value: 'outerwear' },
  ];

  const handleCartClick = () => {
    setIsCartOpen(true);
    if (analytics) {
      analytics.trackClick('cart-button', 'Cart Button');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            <span>Free Shipping on Orders Over $50</span>
            <span>•</span>
            <span>User Behavior Experiment Platform</span>
          </div>
          <div className="flex gap-4 items-center">
            {user && (
              <>
                <span>Balance: ${user.balance.toFixed(2)}</span>
                <span>•</span>
                <span>Group: {user.abTestGroup}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                WAIKIKI
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  onFocus={() => analytics?.trackClick('search-bar', 'Search Bar')}
                />
                <svg
                  className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <button className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-1">Account</span>
              </button>

              <button className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs mt-1">Favorites</span>
              </button>

              <button
                onClick={handleCartClick}
                className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="text-xs mt-1">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 py-3">
            {categories.map((category) => (
              <a
                key={category.value}
                href={`#${category.value}`}
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors uppercase tracking-wide"
                onClick={() => analytics?.trackClick('category-nav', category.name)}
              >
                {category.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
