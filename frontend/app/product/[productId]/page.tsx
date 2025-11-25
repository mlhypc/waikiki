'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/context';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { setSelectedProductId } = useStore();
  const productId = params.productId as string;

  useEffect(() => {
    // Open modal and go back to previous page
    if (productId) {
      setSelectedProductId(productId);
      router.back();
    }
  }, [productId, setSelectedProductId, router]);

  return null;
}
