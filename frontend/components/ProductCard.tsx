'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/lib/api';
import { useStore } from '@/lib/context';
import { useAnalytics, useHoverTracking } from '@/hooks/useAnalytics';

interface ProductCardProps {
  product: Product;
  position?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, position }) => {
  const { addToFavorites, removeFromFavorites, isFavorite, setSelectedProductId } = useStore();
  const analytics = useAnalytics();
  const hoverProps = useHoverTracking(`product-card-${product.productId}`);

  const handleProductClick = () => {
    if (analytics) {
      analytics.trackProductClick(product.productId, product.name, position);
    }
    setSelectedProductId(product.productId);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(product.productId)) {
      removeFromFavorites(product.productId);
    } else {
      addToFavorites(product);
    }
  };

  const handleProductView = () => {
    if (analytics) {
      analytics.trackProductView(product.productId, product.name, product.price);
    }
  };

  // Get the first valid image from the images array
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const validImages = product.images?.filter(img => img && img.trim() !== '' && !img.includes('undefined')) || [];
  const firstImage = validImages[0] || '';
  // If image is already a full URL (starts with http), use it directly; otherwise prepend API_URL
  const imageUrl = firstImage ? (firstImage.startsWith('http') ? firstImage : `${API_URL}${firstImage}`) : '';

  // Debug: Log first product to see what data we're getting
  if (product.productId === 'asimetrik-yaka-buzgulu-bluz-siyah-o-5065958') {
    console.log('DEBUG ProductCard:', {
      productId: product.productId,
      images: product.images,
      validImages,
      imageUrl
    });
  }

  return (
    <div
      onClick={handleProductClick}
      className="group bg-white overflow-hidden hover:border-gray-300 transition-all cursor-pointer"
      {...hoverProps}
      onMouseEnter={() => {
        hoverProps.onMouseEnter();
        handleProductView();
      }}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[8/10] overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            onError={() => {
              console.error('Image load error for product:', product.productId, imageUrl);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex justify-between items-start">
        <h3 className="text-xs text-gray-900 line-clamp-2 flex-1">
          {product.name}
        </h3>
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          aria-label={isFavorite(product.productId) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-5 h-5"
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
    </div>
  );
};
