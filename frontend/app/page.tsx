'use client';

import React, { useEffect, useState } from 'react';
import { Product, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading your shopping experience...</div>
        </div>
      </div>
    );
  }

  const categories = ['all', 'shirts', 'pants', 'dresses', 'shoes', 'accessories', 'outerwear'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Winter Collection 2025
            </h1>
            <p className="text-xl mb-8 text-red-100">
              Discover the latest trends. Free shipping on orders over $50.
            </p>
            <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banners */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h3 className="font-semibold mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600">On orders over $50</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600">100% secure checkout</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Filters and Sort */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h2>
          <p className="text-gray-600 mt-1">{products.length} products found</p>
        </div>

        {/* Products Grid - 4 Columns like LC Waikiki */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.productId} product={product} position={index} />
            ))}
          </div>
        )}

        {/* Bottom Promo Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl overflow-hidden">
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Get exclusive deals, new arrivals, and style inspiration delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
