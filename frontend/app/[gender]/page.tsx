'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/lib/context';
import { usePageTracking } from '@/hooks/useAnalytics';
import { getGenderCategories } from '@/lib/categories';

export default function GenderPage() {
  const params = useParams();
  const gender = params.gender as string;
  const { isLoading } = useStore();

  usePageTracking(gender);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const genderCategories = getGenderCategories(gender);

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
    <div className="h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0 pt-16 md:pt-20">
        {/* Category Grid - 2x2 */}
        <div className="flex-1 grid grid-cols-2 gap-0">
          {genderCategories.map((category) => (
            <Link key={category.id} href={`/${gender}/${category.id}`} className="relative group">
              <div className="absolute inset-0">
                <Image
                  src={`/category_photos/${gender === 'kadin' ? 'kadın' : gender}_${category.id === 'dis_giyim' ? 'dıs_giyim' : category.id === 'ayakkabi' ? 'ayakkabı' : category.id}.jpg`}
                  alt={category.name}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{category.name.toUpperCase()}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
