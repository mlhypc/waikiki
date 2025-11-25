'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider, useStore } from '@/lib/context';
import { BottomNav } from '@/components/BottomNav';
import { Cart } from '@/components/Cart';
import { Favorites } from '@/components/Favorites';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import SurveyModal from '@/components/SurveyModal';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { showSurvey, handleSurveySubmit, selectedProductId, setSelectedProductId } = useStore();

  return (
    <>
      {children}
      <Cart />
      <Favorites />
      <BottomNav />
      {showSurvey && <SurveyModal onSubmit={handleSurveySubmit} />}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <StoreProvider>
          <LayoutContent>{children}</LayoutContent>
        </StoreProvider>
      </body>
    </html>
  );
}
