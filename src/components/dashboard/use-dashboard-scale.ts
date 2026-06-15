'use client';

import { useBreakpoint, useViewportHeight, useViewportScale, useViewportWidth } from '@/lib/breakpoints';

export const DASHBOARD_HEADER_HEIGHT = 68;

export function useDashboardScale() {
  const breakpoint = useBreakpoint();
  const scale = useViewportScale();
  const viewportHeight = useViewportHeight();
  const viewportWidth = useViewportWidth();
  const isDesktop = breakpoint === 'desktop';
  const isScaled = isDesktop && scale > 1 && viewportWidth > 0 && viewportHeight > 0;
  const physicalHeaderHeight = DASHBOARD_HEADER_HEIGHT * (isScaled ? scale : 1);
  const availableHeight = viewportHeight > 0
    ? viewportHeight - physicalHeaderHeight
    : 0;

  return {
    breakpoint,
    scale,
    viewportHeight,
    viewportWidth,
    isDesktop,
    isScaled,
    headerHeight: DASHBOARD_HEADER_HEIGHT,
    physicalHeaderHeight,
    availableHeight,
    logicalWidth: isScaled ? viewportWidth / scale : viewportWidth,
    logicalAvailableHeight: isScaled ? availableHeight / scale : availableHeight,
  };
}

