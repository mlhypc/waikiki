'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/api';
import { useStore } from '@/lib/context';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, onClose }) => {
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [validImages, setValidImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data.product);

        // Take all valid images from API
        const images = data.product.images || [];
        const validImagesList = images
          .filter((img: string) => img && img.trim() !== '' && !img.includes('undefined'));

        if (validImagesList.length === 0 && data.product.image) {
          setValidImages([data.product.image]);
        } else {
          setValidImages(validImagesList);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!product) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8">
          </div>
        </div>
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleFavorite = () => {
    if (isFavorite(product.productId)) {
      removeFromFavorites(product.productId);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <>
      {/* Full Screen Product Detail - respects header and bottom nav */}
      <div className="fixed inset-0 z-40 bg-white overflow-y-auto pt-8 md:pt-[72px]">
        <div className="min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Back Button - right side with white background */}
            <div className="sticky top-4 right-4 z-[70] flex justify-end px-4">
              <button
                onClick={onClose}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-24 md:px-8 md:pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images Section */}
                <div>
                  {/* Main Image */}
                  <div className="relative w-full aspect-[8/10] bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {validImages.length > 0 ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${validImages[selectedImageIndex] || validImages[0]}`}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {validImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {validImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square bg-gray-100 rounded overflow-hidden border-2 ${
                            selectedImageIndex === index ? 'border-blue-600' : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 25vw, 12vw"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info Section */}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-black text-white py-3 px-6 rounded font-medium hover:bg-gray-800 transition-colors"
                    >
                      Sepete Ekle
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className="p-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      aria-label={isFavorite(product.productId) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg
                        className="w-6 h-6"
                        fill={isFavorite(product.productId) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Product Code */}
                  {product.productCode && (
                    <p className="text-sm text-gray-500 mb-6">Ürün Kodu: {product.productCode}</p>
                  )}

                  {/* Description */}
                  {product.description && product.description.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Ürün Açıklaması</h3>
                      <ul className="space-y-2">
                        {product.description.map((desc, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mannequin Info */}
                  {product.mannequinInfo && (
                    <div className="border-t mt-6 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Manken Bilgisi</h3>
                      <p className="text-sm text-gray-600">{product.mannequinInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
