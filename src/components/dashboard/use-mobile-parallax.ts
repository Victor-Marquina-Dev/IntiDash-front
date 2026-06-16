'use client';

import React from 'react';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useMobileParallax(enabled: boolean, depths: readonly number[]) {
  const refs = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    const nodes = refs.current;

    if (!enabled || typeof window === 'undefined') {
      nodes.forEach((el) => {
        if (el) el.style.transform = '';
      });
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let scheduled = false;

    const apply = () => {
      scheduled = false;
      const viewportH = Math.max(window.innerHeight, 1);

      nodes.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = (center - viewportH / 2) / (viewportH / 2);
        const progress = clamp(distance, -1, 1);
        const depth = depths[index] ?? depths[depths.length - 1] ?? 28;
        const y = progress * -depth;

        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      raf = window.requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    apply();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.cancelAnimationFrame(raf);
      nodes.forEach((el) => {
        if (el) el.style.transform = '';
      });
    };
  }, [enabled, depths]);

  return refs;
}
