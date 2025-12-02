'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/context';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getSuggestions, Product } from '@/lib/api';
import { ProductCard } from './ProductCard';

const SURVEY_MODE = process.env.NEXT_PUBLIC_SURVEY_MODE === 'true';

export const Cart: React.FC = () => {
  const { cart, addToCart, removeFromCart, cartTotal, checkout, user, isCartOpen, setIsCartOpen, setUser } = useStore();
  const analytics = useAnalytics();
  const [suggestions, setSuggestions] = useState<Record<string, Product[]>>({});

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = async () => {
    const success = await checkout();
    if (success) {
      alert('Satın alma başarılı! Alışverişiniz için teşekkür ederiz.');
      setIsCartOpen(false);
    }
  };

  const handleGroupChange = async (group: 'A' | 'B' | 'C') => {
    if (user) {
      const updatedUser = { ...user, abTestGroup: group };
      setUser(updatedUser);

      // Clear suggestions immediately when switching groups
      setSuggestions({});
    }
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (!isCartOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (isCartOpen && analytics) {
      analytics.trackCartView(cart, cartTotal);
    }
  }, [isCartOpen, analytics, cart, cartTotal]);

  // Fetch suggestions for each product when cart opens
  useEffect(() => {
    const fetchAllSuggestions = async () => {
      if (!isCartOpen || !user || cart.length === 0 || user.abTestGroup === 'A') {
        setSuggestions({});
        return;
      }

      const newSuggestions: Record<string, Product[]> = {};

      try {
        await Promise.all(
          cart.map(async (item) => {
            try {
              const suggestionsData = await getSuggestions(item.product.productId, user.abTestGroup);
              if (suggestionsData.length > 0) {
                newSuggestions[item.product.productId] = suggestionsData;
              }
            } catch (error) {
              console.error(`Failed to fetch suggestions for ${item.product.productId}:`, error);
            }
          })
        );

        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions({});
      }
    };

    fetchAllSuggestions();
  }, [isCartOpen, cart, user?.abTestGroup]);

  const getSuggestionTitle = () => {
    if (user?.abTestGroup === 'B') return 'Klasik Kombinasyon';
    if (user?.abTestGroup === 'C') return 'AI Önerileri';
    return '';
  };

  return (
    <>
      {/* Full Screen Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-white overflow-y-auto pt-12 md:pt-[72px]">
          <div className="min-h-screen">
            <div className="max-w-3xl mx-auto">
              {/* Close Button */}
              <div className="sticky top-4 right-4 z-10 flex justify-end px-4">
                <button
                  onClick={handleClose}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 pb-24 md:px-8 md:pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Sepetim</h2>

                  {/* A/B/C Group Switcher (only in test mode) */}
                  {!SURVEY_MODE && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGroupChange('A')}
                        className={`px-3 py-1 text-sm font-semibold rounded ${
                          user?.abTestGroup === 'A'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => handleGroupChange('B')}
                        className={`px-3 py-1 text-sm font-semibold rounded ${
                          user?.abTestGroup === 'B'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => handleGroupChange('C')}
                        className={`px-3 py-1 text-sm font-semibold rounded ${
                          user?.abTestGroup === 'C'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        C
                      </button>
                    </div>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="text-gray-500 text-base font-medium mb-1">Sepetiniz boş</p>
                    <p className="text-gray-400 text-xs">Alışverişe başlamak için ürün ekleyin</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 mb-6">
                      {cart.map((item) => (
                        <div key={item.product.productId}>
                          {/* Product Item */}
                          <div className="border rounded-lg p-3 flex gap-3 items-center">
                            {/* Product Image */}
                            <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={`http://localhost:5000${item.product.images?.[0] || '/placeholder.jpg'}`}
                                alt={item.product.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Adet: {item.quantity}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => removeFromCart(item.product.productId)}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                aria-label="Azalt"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => addToCart(item.product)}
                                className="text-gray-600 hover:text-green-600 transition-colors"
                                aria-label="Arttır"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Suggestions for this product */}
                          {suggestions[item.product.productId] && suggestions[item.product.productId].length > 0 && (
                            <div className="mt-3 pl-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                {getSuggestionTitle()}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {suggestions[item.product.productId].slice(0, 4).map((product) => (
                                  <ProductCard key={product.productId} product={product} position={0} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <button
                        onClick={handleCheckout}
                        disabled={!user}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
                      >
                        Satın Al
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
