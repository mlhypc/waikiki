'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useStore } from '@/lib/context';
import { usePageTracking } from '@/hooks/useAnalytics';

export default function Home() {
  const { isLoading } = useStore();
  usePageTracking('home');

  if (isLoading) {
    return <LoadingSpinner message="Loading your shopping experience..." />;
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-0 md:gap-0 overflow-hidden pb-14 md:pb-0 pt-16 md:pt-20">
        {/* Women Card */}
        <Link href="/kadin" className="flex-1 relative group">
          <div className="absolute inset-0">
            <Image
              src="/category_photos/kadın.jpg"
              alt="Kadın"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-all flex items-center justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white">KADIN</h2>
            </div>
          </div>
        </Link>

        {/* Men Card */}
        <Link href="/erkek" className="flex-1 relative group">
          <div className="absolute inset-0">
            <Image
              src="/category_photos/erkek.jpg"
              alt="Erkek"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-all flex items-center justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white">ERKEK</h2>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
