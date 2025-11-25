'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/context';
import { ProductCard } from './ProductCard';

export const Favorites: React.FC = () => {
  const { favorites, isFavoritesOpen, setIsFavoritesOpen } = useStore();

  const handleClose = () => {
    setIsFavoritesOpen(false);
  };

  // Prevent body scroll when favorites is open
  useEffect(() => {
    if (!isFavoritesOpen) return;

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
  }, [isFavoritesOpen]);

  return (
    <>
      {/* Full Screen Favorites */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-40 bg-white overflow-y-auto pt-12 md:pt-[72px]">
          <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
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
                <h2 className="text-xl font-bold text-gray-900 mb-8">Favorilerim</h2>

                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-6xl mb-4">❤️</div>
                    <p className="text-gray-500 text-lg font-medium mb-2">Favori ürününüz yok</p>
                    <p className="text-gray-400 text-sm">Beğendiğiniz ürünleri favorilere ekleyin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                    {favorites.map((product, index) => (
                      <ProductCard
                        key={product.productId}
                        product={product}
                        position={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
