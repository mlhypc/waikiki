'use client';

import Link from 'next/link';
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
        </div>

        {/* Gender Selection Cards */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Women Card */}
          <Link href="/kadin">
            <div className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-md">
              <div className="aspect-[3/4] flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-6xl mb-3">👗</div>
                  <h2 className="text-2xl font-semibold text-gray-900">KADIN</h2>
                </div>
              </div>
            </div>
          </Link>

          {/* Men Card */}
          <Link href="/erkek">
            <div className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-md">
              <div className="aspect-[3/4] flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-6xl mb-3">👔</div>
                  <h2 className="text-2xl font-semibold text-gray-900">ERKEK</h2>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
