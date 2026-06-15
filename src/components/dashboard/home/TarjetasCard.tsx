'use client';

import Image from 'next/image';
import React from 'react';
import { Icon } from '@/components/icons';
import { formatIntegerCurrency } from '@/lib/format';
import { useDashboardAccounts } from '@/shared/hooks/use-dashboard-accounts';
import { getKpiPalette } from './kpi-palette';
import { CardTabsRow } from './CardHeaderSection';
import { RADIUS } from '@/lib/radius';

const BANK_LOGOS: Record<string, string> = {
  yape:       '/Yape.png',
  falabella:  '/Falabella.png',
  interbank:  '/Interbank.png',
  bbva:       '/BBVA.png',
  bcp:        '/BCP.jpg',
};

function getBankLogo(banco?: string | null): string | null {
  if (!banco) return null;
  const b = banco.trim().toLowerCase();
  for (const [key, src] of Object.entries(BANK_LOGOS)) {
    if (b.includes(key)) return src;
  }
  return null;
}

function getBankInitial(banco?: string | null): string {
  return (banco ?? '?')[0]?.toUpperCase() ?? '?';
}

export function TarjetasCard({ darkMode = false, canWrite: _canWrite = true, onNavigate }: Readonly<{ darkMode?: boolean; canWrite?: boolean; onNavigate?: (screen: string) => void }>) {
  const { rows, loading, tipos, activeTab, visibles, isCredito, selectTab } = useDashboardAccounts();
  const t = getKpiPalette(darkMode);
  const [btnHovered, setBtnHovered] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const accent = darkMode
    ? { bg: 'rgba(198,172,143,0.12)', border: 'rgba(198,172,143,0.28)', color: '#C6AC8F' }
    : { bg: 'rgba(140,111,78,0.10)',  border: 'rgba(140,111,78,0.26)',  color: '#8C6F4E' };

  const D = darkMode;
  const trackBg = D ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.06)';

  return (
    <div style={{ background: t.outerBg, borderRadius: RADIUS.dashboardCard }} className="relative rounded-xl overflow-hidden">

      <div className="flex flex-col w-full h-full rounded-lg p-4" style={{ background: t.innerBg, borderRadius: RADIUS.dashboardCard }}>

        {/* Header */}
        <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
          <span className="text-xs font-black tracking-[2px] uppercase shrink-0" style={{ color: t.label }}>
            Cuentas
          </span>
          <div className="flex-1" />
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{
              width: 34, height: 34,
              background: darkMode ? 'rgba(156,128,94,0.28)' : 'rgba(125,99,71,0.18)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => onNavigate?.('cards')}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              className="rounded-full flex items-center justify-center cursor-pointer active:scale-95"
              style={{
                width: 24, height: 24,
                background: darkMode ? '#9C805E' : '#7D6347',
                color: 'rgba(255,255,255,0.90)',
                transform: btnHovered ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <Icon.list size={10} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tabs estandarizados (solo nombre) + lista de cuentas */}
        {!loading && tipos.length > 1 && (
          <CardTabsRow
            tabs={tipos.map(tipo => ({
              id: tipo,
              label: tipo.charAt(0) + tipo.slice(1).toLowerCase(),
            }))}
            activeTab={activeTab ?? tipos[0]}
            onTabChange={selectTab}
            darkMode={darkMode}
            padX="0"
            style={{ marginBottom: 6 }}
          />
        )}

        <div
          key={activeTab ?? 'all'}
          className="fz-tab-content"
          style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            overflowY: 'auto', maxHeight: 208,
            marginRight: -4, paddingRight: 4,
            scrollbarWidth: 'thin',
            scrollbarColor: `${accent.color}55 transparent`,
          }}
        >
          {loading && [1, 2, 3].map(i => (
            <div key={i} style={{ height: 48, borderRadius: 10, background: t.border, opacity: 0.5 }} />
          ))}

          {!loading && rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: t.label, fontSize: 12 }}>
              Sin cuentas registradas.
            </div>
          )}

          {[...visibles].sort((x, y) => (y.balance ?? 0) - (x.balance ?? 0)).map((cuenta, i) => {
            const saldo      = cuenta.balance ?? 0;
            const limite     = cuenta.credito ?? 0;
            const disponible = limite - saldo;
            const utilPct    = isCredito && limite > 0 ? Math.min(100, Math.round((saldo / limite) * 100)) : 0;
            const utilColor  = utilPct > 80 ? (D ? '#f87171' : '#dc2626')
              : utilPct > 50 ? (D ? '#fbbf24' : '#d97706')
              : (D ? '#34d399' : '#16a34a');
            const logoSrc    = getBankLogo(cuenta.banco);
            const isSelected = selectedId === (cuenta.id ?? String(i));

            return (
              <div
                key={cuenta.id ?? i}
                onClick={() => setSelectedId(prev =>
                  prev === (cuenta.id ?? String(i)) ? null : (cuenta.id ?? String(i))
                )}
                style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: isSelected ? `${accent.color}18` : 'transparent',
                  border: `1px solid ${isSelected ? accent.border : t.border}`,
                  cursor: 'pointer',
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCredito && limite > 0 ? 8 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: logoSrc ? '#fff' : accent.bg,
                      color: accent.color,
                      display: 'grid', placeItems: 'center',
                      fontSize: 9, fontWeight: 900, overflow: 'hidden',
                    }}>
                      {logoSrc
                        ? <Image src={logoSrc} alt={cuenta.banco ?? ''} width={30} height={30} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : getBankInitial(cuenta.banco)
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: D ? 'rgba(255,255,255,0.88)' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cuenta.nombre}
                      </div>
                      <div style={{ fontSize: 10, color: t.subtitle, fontWeight: 600, marginTop: 1 }}>
                        {cuenta.banco}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: isCredito ? (D ? '#e07878' : '#dc2626') : (D ? 'rgba(255,255,255,0.88)' : '#111827') }}>
                      {isCredito
                        ? (saldo > 0 ? `−${formatIntegerCurrency(saldo)}` : formatIntegerCurrency(0))
                        : formatIntegerCurrency(saldo)}
                    </div>
                    {isCredito && limite > 0 && (
                      <div style={{ fontSize: 9, color: t.subtitle, fontWeight: 600, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                        lím. {formatIntegerCurrency(limite)}
                      </div>
                    )}
                  </div>
                </div>

                {isCredito && limite > 0 && (
                  <>
                    <div style={{ height: 4, borderRadius: 10, background: trackBg, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{
                        height: '100%', width: `${utilPct}%`, borderRadius: 10,
                        background: utilPct > 80 ? `linear-gradient(90deg,${utilColor}99,${utilColor})` : 'linear-gradient(90deg,#16a34a,#22c55e)',
                        transition: 'width .4s',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: utilColor }}>{utilPct}%{utilPct >= 100 ? ' ⚠' : ''}</span>
                      <span style={{ fontSize: 10, color: t.subtitle, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        disponible {formatIntegerCurrency(disponible)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
