'use client';
import React from 'react';

export type BP = 'mobile' | 'tablet' | 'desktop';

function get(w: number): BP {
  if (w < 768) return 'mobile';
  if (w < 1280) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): BP {
  const [bp, setBp] = React.useState<BP>('desktop');
  React.useEffect(() => {
    const fn = () => setBp(get(window.innerWidth));
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}
