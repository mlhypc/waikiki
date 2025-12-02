'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/lib/api';
import { useStore } from '@/lib/context';
import { useAnalytics, useHoverTracking } from '@/hooks/useAnalytics';

interface ProductCardProps {
  product: Product;
  position?: number;
  compact?: boolean;
  isSuggestion?: boolean;
  sourceProductId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, position, compact = false, isSuggestion = false, sourceProductId }) => {
  const { addToFavorites, removeFromFavorites, isFavorite, setSelectedProductId, addToCart } = useStore();
  const analytics = useAnalytics();
  const hoverProps = useHoverTracking(`product-card-${product.productId}`);

  const handleProductClick = () => {
    if (analytics) {
      if (isSuggestion && sourceProductId) {
        analytics.trackSuggestionClick(product.productId, product.name, sourceProductId, position || 0);
      } else {
        analytics.trackProductClick(product.productId, product.name, position);
      }
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track suggestion add to cart if this is a suggestion
    if (isSuggestion && sourceProductId && analytics) {
      analytics.trackSuggestionAddToCart(product.productId, product.name, product.price, sourceProductId);
    }

    addToCart(product);
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
      <div className={compact ? "p-1.5" : "p-3"}>
        <h3 className={`text-gray-900 line-clamp-2 ${compact ? 'text-[10px] leading-tight' : 'text-xs'}`}>
          {product.name}
        </h3>

        {compact ? (
          /* Add to Cart Button for compact mode */
          <button
            onClick={handleAddToCart}
            className="mt-1.5 w-full bg-gray-800 text-white text-[10px] md:text-xs py-1.5 md:py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
            aria-label="Sepete Ekle"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Sepete Ekle</span>
          </button>
        ) : (
          /* Favorite Button for normal mode */
          <div className="flex justify-end mt-1">
            <button
              onClick={handleToggleFavorite}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
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
        )}
      </div>
    </div>
  );
};
