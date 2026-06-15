'use client';
import React from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Mide el tamaño real (content-box) de un elemento vía ResizeObserver.
 * Devuelve [ref, { width, height }]. Útil para gráficos SVG que deben llenar
 * su contenedor sin deformarse: se usa el tamaño medido como viewBox.
 */
export function useElementSize<T extends HTMLElement>(): [React.RefObject<T | null>, ElementSize] {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<ElementSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
