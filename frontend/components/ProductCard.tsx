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
  const { addToCart } = useStore();
  const analytics = useAnalytics();
  const hoverProps = useHoverTracking(`product-card-${product.productId}`);

  const handleClick = () => {
    if (analytics) {
      analytics.trackProductClick(product.productId, product.name, position);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductView = () => {
    if (analytics) {
      analytics.trackProductView(product.productId, product.name, product.price);
    }
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      {...hoverProps}
      onMouseEnter={() => {
        hoverProps.onMouseEnter();
        handleProductView();
      }}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Quick Add Button - Shows on Hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-6 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 hover:text-white shadow-lg"
        >
          Add to Cart
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Add to favorites"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
