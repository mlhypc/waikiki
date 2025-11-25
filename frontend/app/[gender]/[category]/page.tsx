'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/lib/context';
import { usePageTracking } from '@/hooks/useAnalytics';
import { getCategory } from '@/lib/categories';
import { getGenderTitle } from '@/lib/utils';
import { getProducts, Product } from '@/lib/api';

export default function CategoryPage() {
  const params = useParams();
  const gender = params.gender as string;
  const categoryId = params.category as string;
  const { isLoading, user } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingProductsRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  usePageTracking(`${gender}-${categoryId}`);

  const category = getCategory(gender, categoryId);
  const genderTitle = getGenderTitle(gender);

  const normalizeGender = (g: string) =>
    g.toLowerCase()
      .replace('ı', 'i')
      .replace('ğ', 'g')
      .replace('ü', 'u')
      .replace('ş', 's')
      .replace('ö', 'o')
      .replace('ç', 'c');

  // Sync refs with state
  useEffect(() => {
    currentPageRef.current = currentPage;
    hasMoreRef.current = hasMore;
    loadingProductsRef.current = loadingProducts;
    initialLoadDoneRef.current = initialLoadDone;
  }, [currentPage, hasMore, loadingProducts, initialLoadDone]);

  const loadMoreProducts = useCallback(async () => {
    if (!user || loadingProductsRef.current || !hasMoreRef.current || !initialLoadDoneRef.current) return;

    setLoadingProducts(true);
    loadingProductsRef.current = true;

    try {
      const data = await getProducts(user.abTestGroup, categoryId, currentPageRef.current, 20);

      const filteredProducts = data.products.filter(p =>
        normalizeGender(p.gender) === normalizeGender(gender)
      );

      if (filteredProducts.length === 0 || currentPageRef.current >= data.pagination.totalPages) {
        setHasMore(false);
        hasMoreRef.current = false;
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
        setCurrentPage(prev => {
          const newPage = prev + 1;
          currentPageRef.current = newPage;
          return newPage;
        });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
      loadingProductsRef.current = false;
    }
  }, [user, categoryId, gender]);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      if (!user) return;

      setInitialLoadDone(false);
      initialLoadDoneRef.current = false;
      setLoadingProducts(true);
      loadingProductsRef.current = true;
      setProducts([]);
      setCurrentPage(1);
      currentPageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;

      try {
        const data = await getProducts(user.abTestGroup, categoryId, 1, 20);
        const filteredProducts = data.products.filter(p =>
          normalizeGender(p.gender) === normalizeGender(gender)
        );
        setProducts(filteredProducts);
        setCurrentPage(2);
        currentPageRef.current = 2;
        const hasMoreData = data.pagination.totalPages > 1;
        setHasMore(hasMoreData);
        hasMoreRef.current = hasMoreData;
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoadingProducts(false);
        loadingProductsRef.current = false;
        // Mark initial load as done after a delay
        setTimeout(() => {
          setInitialLoadDone(true);
          initialLoadDoneRef.current = true;
        }, 300);
      }
    };

    fetchInitialProducts();
  }, [user, categoryId, gender]);

  useEffect(() => {
    // Setup observer only once after initial load
    if (!initialLoadDone) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '400px'
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initialLoadDone, loadMoreProducts]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!category) {
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

      <main className="max-w-6xl mx-auto py-6 pt-20 md:pt-24">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: genderTitle, href: `/${gender}` },
            { label: category.name }
          ]}
        />

        {/* Products Grid */}
        {products.length === 0 && !loadingProducts ? (
          <EmptyState
            variant="inline"
            message="Bu kategoride henüz ürün bulunmamaktadır."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
              {products.map((product, index) => (
                <ProductCard key={`${product.productId}-${index}`} product={product} position={index} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                {loadingProducts && <LoadingSpinner />}
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                Tüm ürünler gösterildi
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
