'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatIntegerCurrency } from '@/lib/format';

export interface AccountBar {
  /** Nombre de la cuenta (etiqueta bajo la barra). */
  label: string;
  /** Monto/saldo de la cuenta. */
  amount: number;
}

export interface AccountsBarChartProps {
  data: AccountBar[];
  darkMode?: boolean;
  /** Color sólido de las barras (tema del tab activo). */
  accentColor: string;
  /** Acción al seleccionar una barra ("Ver detalles"). */
  onDetail?: () => void;
  className?: string;
}

// La barra más alta llega solo hasta este % del track (deja aire arriba);
// al seleccionar (hover) la barra activa crece al 100%.
const MAX_HEIGHT_PCT = 79;

/**
 * Bar chart animado adaptado del componente AnalyticsCard (shadcn) al estilo del
 * dashboard: barras tipo tarjeta con fondo rayado, % por barra y animación de
 * entrada. Muestra máximo 3 barras; el resto se accede con scroll horizontal.
 */
export function AccountsBarChart({ data, darkMode = false, accentColor, onDetail, className }: Readonly<AccountsBarChartProps>) {
  const [active, setActive] = React.useState<number | null>(null);

  const positives = data.map(d => Math.max(d.amount, 0));
  const total     = positives.reduce((s, v) => s + v, 0) || 1;
  const maxAmount = Math.max(...positives, 0) || 1;

  const stripe  = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(125,99,71,0.14)';
  const trackBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(125,99,71,0.08)';
  const labelC  = darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(94,80,63,0.66)';
  const amountC = darkMode ? 'rgba(255,255,255,0.85)' : '#2C1A0E';

  if (data.length === 0) return null;

  // Hasta 3 barras llenan el ancho; con más, se ven 2 completas + 3/4 de la
  // tercera (peek) para insinuar que hay más y se puede hacer scroll horizontal.
  const itemFlex = data.length > 3 ? '0 0 calc((100% - 20px) / 2.75)' : '1';

  return (
    <div
      className={cn('w-full', className)}
      style={{
        display: 'flex', alignItems: 'stretch', gap: 10, height: 196,
        overflowX: data.length > 3 ? 'auto' : 'visible', overflowY: 'hidden',
        paddingBottom: 6,
        scrollbarWidth: 'thin', scrollbarColor: `${accentColor}55 transparent`,
      }}
      aria-label="Distribución de cuentas"
    >
      {data.map((item, index) => {
        const amount   = Math.max(item.amount, 0);
        const sharePct = Math.round((amount / total) * 100);
        const isActive = active === index;
        const baseH    = (amount / maxAmount) * MAX_HEIGHT_PCT;
        const barH     = isActive ? 100 : Math.max(baseH, amount > 0 ? 10 : 4);
        const solid    = isActive || amount === maxAmount;

        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            onClick={onDetail}
            title={onDetail ? 'Ver detalles' : undefined}
            style={{
              flex: itemFlex, minWidth: data.length > 3 ? 0 : undefined,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', padding: 0,
              cursor: onDetail ? 'pointer' : 'default',
              fontFamily: 'var(--font-ui), system-ui, sans-serif',
            }}
          >
            {/* Track con fondo rayado */}
            <div
              style={{
                position: 'relative', flex: 1, width: '100%',
                display: 'flex', alignItems: 'flex-end',
                overflow: 'hidden', borderRadius: 16, padding: 6, boxSizing: 'border-box',
                background: trackBg,
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, ${stripe} 4px, ${stripe} 8px)`,
              }}
            >
              {/* Barra animada tipo tarjeta */}
              <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${barH}%` }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'relative', width: '100%',
                  borderRadius: 12,
                  background: solid ? accentColor : `${accentColor}55`,
                  boxShadow: isActive ? `0 6px 16px ${accentColor}55` : 'none',
                  minHeight: 40,
                  transition: 'background .2s, box-shadow .2s',
                }}
              >
                {/* Asa superior */}
                <div style={{ position: 'absolute', left: '50%', top: 8, height: 4, width: '34%', transform: 'translateX(-50%)', borderRadius: 9999, background: 'rgba(255,255,255,0.5)' }} />
                {/* % de participación */}
                <span style={{ position: 'absolute', bottom: isActive ? 24 : 9, left: '50%', transform: 'translateX(-50%)', fontSize: 13, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', transition: 'bottom .2s' }}>
                  {sharePct}%
                </span>
                {/* Ver detalles (al seleccionar) */}
                {isActive && onDetail && (
                  <span style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', letterSpacing: 0.2 }}>
                    Ver detalles →
                  </span>
                )}
              </motion.div>
            </div>

            {/* Etiqueta + monto */}
            <div style={{ width: '100%', textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: labelC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: amountC, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatIntegerCurrency(amount)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
