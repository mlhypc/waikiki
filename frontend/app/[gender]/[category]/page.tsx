'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/lib/context';
import { usePageTracking } from '@/hooks/useAnalytics';
import { getCategory } from '@/lib/categories';
import { getGenderTitle } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const gender = params.gender as string;
  const categoryId = params.category as string;
  const { isLoading } = useStore();

  usePageTracking(`${gender}-${categoryId}`);

  const category = getCategory(gender, categoryId);
  const genderTitle = getGenderTitle(gender);

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

      <main className="max-w-6xl mx-auto px-4">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: genderTitle, href: `/${gender}` },
            { label: category.name }
          ]}
        />

        {/* Subcategory Grid */}
        {category.subcategories && category.subcategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.subcategories.map((subcategory) => (
              <Link key={subcategory.id} href={`/${gender}/${categoryId}/${subcategory.id}`}>
                <div className="bg-gray-50 !p-8 text-center cursor-pointer transition-all hover:bg-gray-100">
                  <div className="text-4xl mb-2">{subcategory.icon}</div>
                  <h3 className="text-sm font-medium text-gray-900">{subcategory.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="inline"
            message="Bu kategoride alt kategori bulunmamaktadır."
          />
        )}
      </main>
    </div>
  );
}
