'use client';
import React from 'react';

export type BP = 'mobile' | 'tablet' | 'desktop';

function get(w: number): BP {
  if (w < 768) return 'mobile';
  if (w < 1280) return 'tablet';
  return 'desktop';
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

// getSnapshot devuelve un string primitivo: es estable entre renders mientras
// el ancho no cambie de bucket, por lo que useSyncExternalStore no entra en loop.
function getClientSnapshot(): BP {
  return get(window.innerWidth);
}

// Durante SSR e hidratación se asume 'desktop' (el HTML del servidor no conoce
// el ancho). Tras hidratar, React conmuta al snapshot real del cliente en un
// único re-render, sin mismatch de hidratación.
function getServerSnapshot(): BP {
  return 'desktop';
}

export function useBreakpoint(): BP {
  return React.useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * Factor de escala para pantallas grandes (solo desktop).
 *
 * El diseño base está pensado para un monitor de ~SCALE_BASE px de ancho; ahí el
 * factor es 1.0 y nada cambia. En monitores más anchos crece de forma proporcional
 * (hasta SCALE_MAX) para que el contenido — texto, gráficas y espaciados — se vea
 * más grande en vez de quedar pequeño con mucho aire alrededor.
 *
 * Para afinar la sensación visual basta con tocar estas dos constantes.
 */
const SCALE_BASE = 1920; // ancho donde el factor vale exactamente 1.0 (por debajo no escala)
const SCALE_MAX = 1.5;   // tope de ampliación en monitores muy anchos

function getScaleSnapshot(): number {
  const raw = window.innerWidth / SCALE_BASE;
  const clamped = Math.min(Math.max(raw, 1), SCALE_MAX);
  return Math.round(clamped * 1000) / 1000; // estable entre renders
}

function getScaleServerSnapshot(): number {
  return 1;
}

export function useViewportScale(): number {
  return React.useSyncExternalStore(subscribe, getScaleSnapshot, getScaleServerSnapshot);
}

function getHeightSnapshot(): number {
  return window.innerHeight;
}

function getWidthMeasureSnapshot(): number {
  return window.innerWidth;
}

function getZeroServerSnapshot(): number {
  return 0;
}

/** Alto del viewport en px (0 durante SSR). */
export function useViewportHeight(): number {
  return React.useSyncExternalStore(subscribe, getHeightSnapshot, getZeroServerSnapshot);
}

/** Ancho del viewport en px (0 durante SSR). */
export function useViewportWidth(): number {
  return React.useSyncExternalStore(subscribe, getWidthMeasureSnapshot, getZeroServerSnapshot);
}
