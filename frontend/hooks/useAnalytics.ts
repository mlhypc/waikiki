import { useEffect, useRef } from 'react';
import { getAnalytics } from '@/lib/analytics';

export const useAnalytics = () => {
  const analytics = getAnalytics();

  return analytics;
};

// Hook to track page views
export const usePageTracking = (pageName: string) => {
  const analytics = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (analytics && !hasTracked.current) {
      analytics.trackPageView(pageName);
      hasTracked.current = true;
    }
  }, [analytics, pageName]);
};

// Hook to track scroll depth
export const useScrollTracking = () => {
  const analytics = useAnalytics();
  const lastDepth = useRef(0);

  useEffect(() => {
    if (!analytics) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Track every 25% milestone
      if (scrollDepth >= lastDepth.current + 25) {
        analytics.trackScroll(scrollDepth);
        lastDepth.current = scrollDepth;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analytics]);
};

// Hook to track hover events
export const useHoverTracking = (elementName: string) => {
  const analytics = useAnalytics();
  const hoverStart = useRef<number>(0);

  const onMouseEnter = () => {
    hoverStart.current = Date.now();
  };

  const onMouseLeave = () => {
    if (hoverStart.current && analytics) {
      const duration = Date.now() - hoverStart.current;
      if (duration > 500) { // Only track hovers longer than 500ms
        analytics.trackHover(elementName, duration);
      }
      hoverStart.current = 0;
    }
  };

  return { onMouseEnter, onMouseLeave };
};
