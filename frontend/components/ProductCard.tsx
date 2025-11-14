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
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all cursor-pointer"
      onClick={handleClick}
      {...hoverProps}
      onMouseEnter={() => {
        hoverProps.onMouseEnter();
        handleProductView();
      }}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {/* Quick Add Button - Shows on Hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 bg-black text-white py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Sepete Ekle
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">
            {product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
