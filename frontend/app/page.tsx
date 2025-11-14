'use client';

import React, { useEffect, useState } from 'react';
import { Product, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/lib/context';
import { usePageTracking, useScrollTracking, useAnalytics } from '@/hooks/useAnalytics';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const { user, isLoading } = useStore();
  const analytics = useAnalytics();

  usePageTracking('home');
  useScrollTracking();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await getProducts(user.abTestGroup, category);
      setProducts(data);
    };

    fetchProducts();
  }, [user, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (analytics) {
      analytics.trackFilterApplied('category', category);
    }
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    if (analytics) {
      analytics.trackSortApplied(sort);
    }

    // Sort products
    const sorted = [...products].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

    setProducts(sorted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  const categories = ['all', 'shirts', 'pants', 'dresses', 'shoes', 'accessories', 'outerwear'];

  return (
    <main className="min-h-screen p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Waikiki Store</h1>
          <p className="text-gray-600">
            Welcome to our clothing experiment! You have ${user?.balance.toFixed(2)} to spend.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              User ID: {user.userId.slice(0, 8)}... | Test Group: {user.abTestGroup} | Session: {user.abTestGroup}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <span className="font-semibold">Category:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center ml-auto">
            <span className="font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 rounded border bg-white"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.productId} product={product} position={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
