'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { RADIUS } from '@/lib/radius';
import { Card, Tag } from '@/components/ui';
import type { BP } from '@/lib/breakpoints';
import { formatIntegerCurrency } from '@/lib/format';
import { fmtBalanceDec, fmtBalanceInt, useDashboardBalance } from '@/shared/hooks/use-dashboard-balance';

export function HeroBalance({ bp, darkMode, onNavigate: _onNavigate }: Readonly<{ bp: BP; darkMode?: boolean; onNavigate?: (screen: string) => void }>) {
  const D = darkMode ?? false;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';
  const numSize  = bp === 'desktop' ? 58 : isMobile ? 44 : 44;
  const prefSize = bp === 'desktop' ? 22 : isMobile ? 17 : 18;
  const decSize  = bp === 'desktop' ? 28 : isMobile ? 20 : 20;
  const balance = useDashboardBalance();
  const [hovered, setHovered] = React.useState(false);

  // Animación de conteo para el balance total
  const [displayed, setDisplayed] = React.useState(0);
  React.useEffect(() => {
    if (balance.total == null) return;
    const target = balance.total;
    let rafId: number;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setDisplayed(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [balance.total]);

  // Color tokens (dark mode matching TarjetasCard / CategoriesDonut)
  const cardBg      = D ? 'linear-gradient(145deg,#1A1D21,#16181C)' : 'rgba(234,224,213,0.97)';
  const cardBrd     = D ? 'rgba(255,255,255,0.08)' : 'rgba(198,172,143,0.60)';
  const baseShadow  = D ? '0 4px 24px rgba(0,0,0,.5)' : '0 1px 4px rgba(94,80,63,.08)';
  const labelC      = D ? 'rgba(255,255,255,0.38)' : '#5E503F';
  const amountC     = D ? 'rgba(255,255,255,0.90)' : '#2C1A0E';
  const currencyC   = D ? 'rgba(255,255,255,0.50)' : 'rgba(94,80,63,0.72)';
  const decC        = D ? 'rgba(255,255,255,.12)'  : 'rgba(17,24,39,0.18)';
  const metricLblC  = D ? 'rgba(255,255,255,0.38)' : 'rgba(94,80,63,0.62)';
  const sepC        = D ? 'rgba(255,255,255,.06)'  : 'rgba(94,80,63,0.12)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...(isDesktop ? { gridColumn: '1', alignSelf: 'stretch' } : { gridColumn: 'span 12' }),
        borderRadius: RADIUS.dashboardCard,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
      }}
    >
    <Card pad={0} style={{
      background: cardBg,
      border: `1px solid ${hovered ? (D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : cardBrd}`,
      boxShadow: hovered ? (D ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : baseShadow,
      borderRadius: RADIUS.dashboardCard,
      overflow: 'hidden',
      transition: 'box-shadow .25s, border-color .25s',
      height: '100%',
    }}>

      {/* TODO EL CONTENIDO centrado vertical y horizontalmente */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: isMobile ? '24px 18px 20px' : '28px 32px 26px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: labelC }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: labelC, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Balance Total
        </span>
      </div>
      {/* BODY: monto principal */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '18px 0 14px' : '24px 0 18px',
        gap: isMobile ? 14 : 16,
      }}>

        {/* Izquierda: monto + subtítulo + badge */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: prefSize, fontWeight: 800, color: currencyC, letterSpacing: -0.5 }}>S/</span>
            <span style={{ fontSize: numSize, fontWeight: 900, color: amountC, letterSpacing: -3, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {fmtBalanceInt(displayed)}
            </span>
            <span style={{ fontSize: decSize, fontWeight: 700, color: decC, letterSpacing: -1, marginLeft: 2 }}>
              {fmtBalanceDec(displayed)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {balance.summary && (
              <Tag dot={balance.isPositiveChange ? C.pos : C.neg} color={balance.isPositiveChange ? C.pos : C.neg} bg={balance.isPositiveChange ? `${C.pos}18` : `${C.neg}18`} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px' }}>
                {`${balance.isPositiveChange ? '↑' : '↓'} ${balance.pctAbs}% este mes`}
              </Tag>
            )}
          </div>
        </div>

      </div>

      {/* MÉTRICAS: 3 columnas inline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 0,
        padding: isMobile ? '12px 0 0' : '16px 0 0',
        width: '100%',
      }}>

        {/* Cambio mensual */}
        <div style={{ position: 'relative', textAlign: 'center', paddingRight: isMobile ? 8 : 16 }}>
          <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: 1, background: sepC }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: isMobile ? 8 : 9, fontWeight: 800, color: metricLblC, letterSpacing: isMobile ? 1 : 1.4, textTransform: 'uppercase' }}>Cambio mensual</span>
          </div>
          <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: balance.isPositiveChange ? C.pos : C.neg, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.summary ? `${balance.isPositiveChange ? '+' : ''}${balance.pctAbs}%` : '—'}
          </div>
        </div>

        {/* Flujo neto */}
        <div style={{ position: 'relative', textAlign: 'center', padding: isMobile ? '0 8px' : '0 16px' }}>
          <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: 1, background: sepC }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: isMobile ? 8 : 9, fontWeight: 800, color: metricLblC, letterSpacing: isMobile ? 1 : 1.4, textTransform: 'uppercase' }}>Flujo neto</span>
          </div>
          <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: balance.flujoPos ? C.pos : C.neg, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.flujoNeto !== null ? `${balance.flujoPos ? '+' : ''}${formatIntegerCurrency(Math.abs(balance.flujoNeto))}` : '—'}
          </div>
        </div>

        {/* Patrimonio neto */}
        <div style={{ textAlign: 'center', paddingLeft: isMobile ? 8 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: isMobile ? 8 : 9, fontWeight: 800, color: metricLblC, letterSpacing: isMobile ? 1 : 1.4, textTransform: 'uppercase' }}>Patrimonio neto</span>
          </div>
          <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: D ? '#c8d0c8' : C.text, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.patrimonio !== null ? formatIntegerCurrency(balance.patrimonio) : '—'}
          </div>
        </div>

      </div>
      </div>{/* fin grupo body+métricas */}

    </Card>
    </div>
  );
}
