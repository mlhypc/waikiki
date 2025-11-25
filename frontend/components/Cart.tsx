'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/context';
import { useAnalytics } from '@/hooks/useAnalytics';

export const Cart: React.FC = () => {
  const { cart, addToCart, removeFromCart, cartTotal, checkout, user, isCartOpen, setIsCartOpen } = useStore();
  const analytics = useAnalytics();

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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Sepetim</h2>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="text-gray-500 text-base font-medium mb-1">Sepetiniz boş</p>
                    <p className="text-gray-400 text-xs">Alışverişe başlamak için ürün ekleyin</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {cart.map((item) => (
                        <div
                          key={item.product.productId}
                          className="border rounded-lg p-3 flex gap-3 items-center"
                        >
                          {/* Product Image */}
                          <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={item.product.images?.[1] || item.product.images?.[0] || item.product.image}
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
