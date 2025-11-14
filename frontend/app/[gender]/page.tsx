'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/lib/context';
import { usePageTracking } from '@/hooks/useAnalytics';
import { getGenderCategories } from '@/lib/categories';
import { getGenderTitle } from '@/lib/utils';

export default function GenderPage() {
  const params = useParams();
  const gender = params.gender as string;
  const { isLoading } = useStore();

  usePageTracking(gender);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const genderCategories = getGenderCategories(gender);
  const genderTitle = getGenderTitle(gender);

  if (genderCategories.length === 0) {
    return (
      <EmptyState
        title="Kategori bulunamadı"
        message="Bu kategoride ürün bulunmamaktadır."
        actionLabel="Ana sayfaya dön"
        actionHref="/"
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
            { label: genderTitle }
          ]}
        />


        {/* Category Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {genderCategories.map((category) => (
            <Link key={category.id} href={`/${gender}/${category.id}`}>
              <div className="bg-gray-50 !p-8 text-center cursor-pointer transition-all hover:bg-gray-100">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
