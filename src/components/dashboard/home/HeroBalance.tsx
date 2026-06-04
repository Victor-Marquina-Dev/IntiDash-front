'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Card, Tag } from '@/components/ui';
import type { BP } from '@/lib/breakpoints';
import { fmtBalanceDec, fmtBalanceInt, useDashboardBalance } from '@/shared/hooks/use-dashboard-balance';

export function HeroBalance({ bp, darkMode, onNavigate: _onNavigate }: Readonly<{ bp: BP; darkMode?: boolean; onNavigate?: (screen: string) => void }>) {
  const D = darkMode ?? false;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';
  const numSize  = bp === 'desktop' ? 58 : isMobile ? 38 : 44;
  const prefSize = bp === 'desktop' ? 22 : isMobile ? 16 : 18;
  const decSize  = bp === 'desktop' ? 28 : isMobile ? 18 : 20;
  const balance = useDashboardBalance();

  // Color tokens (dark mode matching TarjetasCard / CategoriesDonut)
  const cardBg      = D ? 'linear-gradient(145deg,#111318,#0d0f12)' : '#FFFFFF';
  const cardBrd     = D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)';
  const labelC      = D ? 'rgba(255,255,255,0.38)' : '#6B7280';
  const amountC     = D ? 'rgba(255,255,255,0.90)' : C.text;
  const currencyC   = D ? 'rgba(255,255,255,0.50)' : C.textDim;
  const decC        = D ? 'rgba(255,255,255,.12)'  : 'rgba(17,24,39,0.18)';
  const subC        = D ? 'rgba(255,255,255,0.35)' : '#6B7280';
  const metricLblC  = D ? 'rgba(255,255,255,0.38)' : '#6B7280';
  const metricSubC  = D ? 'rgba(255,255,255,0.30)' : '#9CA3AF';
  const sepC        = D ? 'rgba(255,255,255,.06)'  : 'rgba(17,24,39,0.08)';
  const barInactive = D ? 'rgba(255,255,255,.10)'  : 'rgba(17,24,39,0.07)';
  const barActive   = D ? 'rgba(255,255,255,.35)'  : 'rgba(17,24,39,0.45)';
  const barShadow   = D ? 'none'                   : 'none';
  const barLblC     = D ? 'rgba(255,255,255,0.30)' : '#9CA3AF';
  const barActLblC  = D ? 'rgba(255,255,255,0.85)' : '#111827';

  // Normalize bar heights (max 64px)
  const barH = balance.bars.heights;
  const barPct = balance.bars.pct;
  const barLbl = balance.bars.labels;

  return (
    <Card pad={0} style={{
      ...(isDesktop ? { gridColumn: '1', alignSelf: 'stretch' } : { gridColumn: 'span 12' }),
      background: cardBg, border: `1px solid ${cardBrd}`, overflow: 'hidden',
    }}>

      {/* TODO EL CONTENIDO centrado vertical y horizontalmente */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', ...(isDesktop ? { maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' } : {}) }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '0 18px 8px' : '0 32px 10px' }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>💰</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: labelC, letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 7 }}>
          Balance Total · todas las cuentas
        </span>
      </div>
      {/* BODY: monto izquierda + chart derecha */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-end',
        justifyContent: 'space-between',
        padding: isMobile ? '14px 18px 12px' : '18px 32px 14px',
        gap: isMobile ? 14 : 16,
      }}>

        {/* Izquierda: monto + subtítulo + badge */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: prefSize, fontWeight: 800, color: currencyC, letterSpacing: -0.5 }}>S/</span>
            <span style={{ fontSize: numSize, fontWeight: 900, color: amountC, letterSpacing: -3, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {fmtBalanceInt(balance.total)}
            </span>
            <span style={{ fontSize: decSize, fontWeight: 700, color: decC, letterSpacing: -1, marginLeft: 2 }}>
              {fmtBalanceDec(balance.total)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: subC, fontWeight: 600 }}>{balance.subLabel}</span>
            {balance.summary && (
              <Tag dot={balance.isPositiveChange ? C.pos : C.neg} color={balance.isPositiveChange ? C.pos : C.neg} bg={balance.isPositiveChange ? `${C.pos}18` : `${C.neg}18`} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px' }}>
                {`${balance.isPositiveChange ? '↑' : '↓'} ${balance.pctAbs}% este mes`}
              </Tag>
            )}
          </div>
        </div>

        {/* Derecha: chart estilo Ingresos */}
        <div style={{ flexShrink: 0, width: isMobile ? '100%' : 200 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44, marginBottom: 3 }}>
            {barH.map((h, i) => {
              const last     = i === barH.length - 1;
              const pct      = barPct[i];
              const pctColor = last
                ? barActLblC
                : pct == null ? 'transparent'
                : pct >= 0 ? barActLblC
                : (D ? '#f87171' : '#c84040');
              return (
                <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
                  <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${h}%`, background: last ? barActive : barInactive, boxShadow: last ? barShadow : 'none', position: 'relative' }}>
                    {(pct != null || last) && (
                      <span style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: pctColor, whiteSpace: 'nowrap', lineHeight: 1, marginBottom: 3, pointerEvents: 'none' }}>
                        {last ? `${balance.isPositiveChange ? '+' : ''}${balance.pctAbs}%` : `${Math.abs(pct!)}%`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {barLbl.map((lbl, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: 8.5, fontWeight: 600, color: i === barLbl.length - 1 ? barActLblC : barLblC }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MÉTRICAS: 3 columnas inline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        gap: isMobile ? 12 : 0,
        padding: isMobile ? '12px 18px 16px' : '14px 32px 18px',
      }}>

        {/* Cambio mensual */}
        <div style={{ position: 'relative', paddingRight: isMobile ? 0 : 16, paddingBottom: isMobile ? 12 : 0, borderBottom: isMobile ? `1px solid ${sepC}` : 'none' }}>
          {!isMobile && <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: 1, background: sepC }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>📈</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: metricLblC, letterSpacing: 1.4, textTransform: 'uppercase' }}>Cambio mensual</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: balance.isPositiveChange ? C.pos : C.neg, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.summary ? `${balance.isPositiveChange ? '+' : ''}${balance.pctAbs}%` : '—'}
          </div>
          <div style={{ fontSize: 10, color: metricSubC, fontWeight: 600, marginTop: 3 }}>vs mes anterior</div>
        </div>

        {/* Flujo neto */}
        <div style={{ position: 'relative', padding: isMobile ? '0 0 12px' : '0 16px', borderBottom: isMobile ? `1px solid ${sepC}` : 'none' }}>
          {!isMobile && <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: 1, background: sepC }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>💵</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: metricLblC, letterSpacing: 1.4, textTransform: 'uppercase' }}>Flujo neto</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: balance.flujoPos ? C.pos : C.neg, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.flujoNeto !== null ? `${balance.flujoPos ? '+' : ''}S/ ${Math.round(Math.abs(balance.flujoNeto)).toLocaleString('es-PE')}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: metricSubC, fontWeight: 600, marginTop: 3 }}>Ingresos − Gastos</div>
        </div>

        {/* Patrimonio neto */}
        <div style={{ paddingLeft: isMobile ? 0 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>🏦</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: metricLblC, letterSpacing: 1.4, textTransform: 'uppercase' }}>Patrimonio neto</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: D ? '#c8d0c8' : C.text, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {balance.patrimonio !== null ? `S/ ${Math.round(balance.patrimonio).toLocaleString('es-PE')}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: metricSubC, fontWeight: 600, marginTop: 3 }}>Activos − Deudas</div>
        </div>

      </div>
      </div>{/* fin grupo body+métricas */}

    </Card>
  );
}

