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
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
      {...hoverProps}
      onMouseEnter={() => {
        hoverProps.onMouseEnter();
        handleProductView();
      }}
    >
      <div className="relative w-full h-48 mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded"
        />
      </div>
      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
