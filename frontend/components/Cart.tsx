'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/context';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getSuggestions, Product } from '@/lib/api';
import { ProductCard } from './ProductCard';

const SURVEY_MODE = process.env.NEXT_PUBLIC_SURVEY_MODE === 'true';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, cartTotal, checkout, user, isCartOpen, setIsCartOpen, setUser } = useStore();
  const analytics = useAnalytics();
  const [suggestions, setSuggestions] = useState<Record<string, Product[]>>({});

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = async () => {
    if (!user) return;

    try {
      // Mark simulation as completed
      const { completeSimulation } = await import('@/lib/api');
      await completeSimulation(user.userId);

      // Complete checkout
      const success = await checkout();
      if (success) {
        alert('Simülasyon tamamlandı! Katılımınız için teşekkür ederiz.');
        setIsCartOpen(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
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

                // Track suggestion view
                if (analytics) {
                  analytics.trackSuggestionView(
                    item.product.productId,
                    suggestionsData,
                    item.product.productId
                  );
                }
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
  }, [isCartOpen, cart, user?.abTestGroup, analytics]);

  const getSuggestionTitle = () => {
    if (user?.abTestGroup === 'B') return 'Sizin için seçtiklerimiz';
    if (user?.abTestGroup === 'C') return 'Sizin için özel seçtiklerimiz';
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
                        <div key={item.product.productId} className="border border-black border-opacity-20 rounded-lg overflow-hidden">
                          {/* Product Item */}
                          <div className="p-3 md:p-5 flex gap-3 md:gap-5 items-center bg-white border-2 border-opacity-50 border-gray-500 rounded-md">
                            {/* Product Image */}
                            <div className="relative w-20 h-24 md:w-28 md:h-36 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={(() => {
                                  const img = item.product.images?.[0] || '/placeholder.jpg';
                                  return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`;
                                })()}
                                alt={item.product.name}
                                fill
                                sizes="(max-width: 768px) 80px, 112px"
                                className="object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm md:text-lg leading-tight">{item.product.name}</h3>
                              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-1.5">
                                {item.product.productCode && `${item.product.productCode}`}
                                {item.product.productCode && item.product.properties?.Renk && ' - '}
                                {item.product.properties?.Renk}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeFromCart(item.product.productId)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-2 flex-shrink-0"
                              aria-label="Sepetten Çıkar"
                            >
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Suggestions for this product */}
                          {suggestions[item.product.productId] && suggestions[item.product.productId].length > 0 && (
                            <div className="border-t border-dashed border-gray-300 bg-gray-50/50 px-2 py-2 md:px-4 md:py-3">
                              <h4 className="text-[10px] md:text-xs font-semibold text-gray-500 mb-1.5 md:mb-2">
                                {getSuggestionTitle()}
                              </h4>
                              <div className="grid grid-cols-3 gap-1 md:gap-1.5 opacity-90">
                                {(user?.abTestGroup === 'C'
                                  ? [...suggestions[item.product.productId]].reverse()
                                  : suggestions[item.product.productId]
                                ).slice(0, 3).map((product, idx) => (
                                  <ProductCard
                                    key={product.productId}
                                    product={product}
                                    position={idx}
                                    compact={true}
                                    isSuggestion={true}
                                    sourceProductId={item.product.productId}
                                  />
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
                        className="w-full bg-red text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
                      >
                        Simülasyonu Tamamla
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
