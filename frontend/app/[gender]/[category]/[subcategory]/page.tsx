'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/lib/context';
import { usePageTracking, useScrollTracking } from '@/hooks/useAnalytics';
import { getCategory, getSubcategory } from '@/lib/categories';
import { getGenderTitle } from '@/lib/utils';

export default function SubcategoryPage() {
  const params = useParams();
  const gender = params.gender as string;
  const categoryId = params.category as string;
  const subcategoryId = params.subcategory as string;

  const [products, setProducts] = useState<Product[]>([]);
  const { user, isLoading } = useStore();

  usePageTracking(`${gender}-${categoryId}-${subcategoryId}`);
  useScrollTracking();

  const category = getCategory(gender, categoryId);
  const subcategory = getSubcategory(gender, categoryId, subcategoryId);
  const genderTitle = getGenderTitle(gender);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      const data = await getProducts(user.abTestGroup);
      setProducts(data);
    };

    fetchProducts();
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!category || !subcategory) {
    return (
      <EmptyState
        title="Kategori bulunamadı"
        message="Aradığınız kategori bulunamadı."
        actionLabel={`${genderTitle} sayfasına dön`}
        actionHref={`/${gender}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: genderTitle, href: `/${gender}` },
            { label: category.name, href: `/${gender}/${categoryId}` },
            { label: subcategory.name }
          ]}
        />


        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            variant="inline"
            message="Bu kategoride ürün bulunamadı."
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.productId} product={product} position={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
