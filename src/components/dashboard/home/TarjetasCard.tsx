'use client';

import Image from 'next/image';
import React from 'react';
import { Icon } from '@/components/icons';
import { formatIntegerCurrency } from '@/lib/format';
import { useDashboardAccounts } from '@/shared/hooks/use-dashboard-accounts';

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
  const tabsRef   = React.useRef<HTMLDivElement>(null);
  const dragState = React.useRef({ dragging: false, startX: 0, scrollLeft: 0, moved: false });

  React.useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    function onDown(e: MouseEvent) {
      dragState.current = { dragging: true, startX: e.pageX, scrollLeft: el!.scrollLeft, moved: false };
      el!.style.cursor = 'grabbing';
    }
    function onMove(e: MouseEvent) {
      if (!dragState.current.dragging) return;
      const walk = (e.pageX - dragState.current.startX) * 1.2;
      if (Math.abs(walk) > 3) dragState.current.moved = true;
      el!.scrollLeft = dragState.current.scrollLeft - walk;
    }
    function onUp() {
      dragState.current.dragging = false;
      el!.style.cursor = 'grab';
    }

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function handleTabClick(tipo: string) {
    selectTab(tipo);
    const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${tipo}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  const [btnHov, setBtnHov]     = React.useState<'detail' | 'create' | null>(null);
  const [hovered, setHovered]   = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const D          = darkMode;
  const cardBg     = D ? 'linear-gradient(145deg,#1A1D21,#16181C)' : 'rgba(204,220,204,0.13)';
  const cardBorder = D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)';
  const labelC     = D ? 'rgba(255,255,255,0.38)' : '#6B7280';
  const nameC      = D ? 'rgba(255,255,255,0.85)' : '#111827';
  const bankC      = D ? 'rgba(255,255,255,0.35)' : '#9CA3AF';
  const limitC     = D ? 'rgba(255,255,255,0.35)' : '#9CA3AF';
  const trackBg    = D ? 'rgba(255,255,255,.05)'  : 'rgba(17,24,39,0.06)';
  const btnBg      = D ? 'rgba(255,255,255,.06)'  : 'rgba(17,24,39,0.04)';
  const btnBrd     = D ? 'rgba(255,255,255,.12)'  : 'rgba(17,24,39,0.10)';
  const btnC       = D ? 'rgba(255,255,255,0.65)' : '#374151';
  const btnHovBg   = D ? 'rgba(255,255,255,.14)'  : '#111827';
  const btnHovC    = D ? '#fff'                   : '#fff';
  const tabActiveBg    = D ? 'rgba(255,255,255,0.90)'   : '#111827';
  const tabActiveC     = D ? '#111'                     : '#fff';
  const tabInactiveBg  = D ? 'rgba(255,255,255,.03)'    : 'rgba(17,24,39,0.04)';
  const tabInactiveC   = D ? 'rgba(255,255,255,0.38)'   : '#6B7280';
  const tabInactiveBrd = D ? 'rgba(255,255,255,.08)'    : 'rgba(17,24,39,0.08)';
  const itemBg     = D ? 'rgba(255,255,255,.04)'  : '#FAFAFA';
  const itemBorder = D ? 'rgba(255,255,255,.08)'  : 'rgba(17,24,39,0.06)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
      background: cardBg, borderRadius: 22, overflow: 'hidden',
      border: `1px solid ${hovered ? (D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : cardBorder}`,
      boxShadow: hovered
        ? (D ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)')
        : (D ? '0 4px 24px rgba(0,0,0,.5), 0 12px 40px rgba(0,0,0,.3)' : '0 1px 2px rgba(17,24,39,.04), 0 12px 32px rgba(17,24,39,.06)'),
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'transform .25s, box-shadow .25s, border-color .25s',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.cards size={15} strokeWidth={2.2} />
          <span style={{ fontSize: 12, fontWeight: 800, color: labelC, letterSpacing: 1.5, textTransform: 'uppercase' }}>Cuentas</span>
        </div>
        <button
          onMouseEnter={() => setBtnHov('detail')} onMouseLeave={() => setBtnHov(null)}
          onClick={() => onNavigate?.('cards')}
          aria-label="Ir a Cuentas"
          title="Ir a Cuentas"
          style={{ width: 28, height: 28, borderRadius: 8, background: btnHov === 'detail' ? btnHovBg : btnBg, border: `1px solid ${btnBrd}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: btnHov === 'detail' ? btnHovC : btnC, transition: 'all .2s', flexShrink: 0 }}
        >
          <Icon.list size={12} strokeWidth={1.7} />
        </button>
      </div>

      {/* Tabs por tipo */}
      {!loading && tipos.length > 1 && (
        <div
          ref={tabsRef}
          className="fz-tabs-scroll"
          style={{ display: 'flex', gap: 6, padding: '2px 16px 8px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab', userSelect: 'none' }}
        >
          {tipos.map(tipo => {
            const isActive = activeTab === tipo;
            const count = rows.filter(r => (r.tipo ?? '').toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === tipo).length;
            const label = tipo.charAt(0) + tipo.slice(1).toLowerCase();
            return (
              <button
                key={tipo}
                data-tab={tipo}
                onClick={() => { if (!dragState.current.moved) handleTabClick(tipo); }}
                style={{
                  padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${isActive ? tabActiveBg : tabInactiveBrd}`,
                  background: isActive ? tabActiveBg : tabInactiveBg,
                  color: isActive ? tabActiveC : tabInactiveC,
                  fontFamily: 'var(--font-ui), system-ui, sans-serif',
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all .2s', whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: isActive && D ? '0 2px 12px rgba(139,92,246,.3)' : 'none',
                }}
              >
                {label}
                <span style={{
                  fontSize: 10, fontWeight: 900, padding: '1px 5px', borderRadius: 8,
                  background: 'rgba(255,255,255,.2)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      <div key={activeTab} className="fz-tab-content" style={{ padding: '10px 16px 16px' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, background: itemBg }}>
                <div className={D ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className={D ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 13, width: `${60 + i * 10}%`, borderRadius: 6 }} />
                  <div className={D ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 10, width: '40%', borderRadius: 6 }} />
                </div>
                <div className={D ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 13, width: 60, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: bankC, fontSize: 12 }}>
            Sin cuentas registradas.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 208, marginRight: -4, paddingRight: 4, scrollbarWidth: 'thin', scrollbarColor: 'rgba(143,168,143,0.5) transparent' }}>
          {[...visibles].sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0)).map((t, i) => {
            const saldo      = t.balance ?? 0;
            const limite     = t.credito ?? 0;
            const disponible = limite - saldo;
            const utilPct    = isCredito && limite > 0 ? Math.min(100, Math.round((saldo / limite) * 100)) : 0;
            const utilColor  = utilPct > 80 ? (D ? '#f87171' : '#dc2626')
              : utilPct > 50 ? (D ? '#fbbf24' : '#d97706')
              : (D ? '#34d399' : '#16a34a');
            const itemAlert  = isCredito && utilPct >= 100;
            const isSelected = selectedId === (t.id ?? String(i));
            const rowBg = itemAlert
              ? (D ? 'rgba(239,68,68,.04)' : 'rgba(239,68,68,.04)')
              : isSelected
                ? (D ? 'rgba(143,168,143,0.22)' : 'rgba(143,168,143,0.28)')
                : itemBg;
            const rowBorder = itemAlert
              ? (D ? 'rgba(239,68,68,.2)' : 'rgba(239,68,68,.25)')
              : isSelected
                ? (D ? 'rgba(143,168,143,0.5)' : 'rgba(143,168,143,0.6)')
                : itemBorder;
            return (
              <div
                key={t.id ?? i}
                onClick={() => setSelectedId(prev => prev === (t.id ?? String(i)) ? null : (t.id ?? String(i)))}
                style={{
                  padding: '13px 15px', borderRadius: 14,
                  background: rowBg,
                  border: `1px solid ${rowBorder}`,
                  cursor: 'pointer',
                  transition: 'background .2s, border-color .2s',
                }}>
                {/* Nombre + monto */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isCredito && limite > 0 ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    {(() => {
                      const logoSrc = getBankLogo(t.banco);
                      return (
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: logoSrc ? '#fff' : (D ? '#0A402A' : '#8FA88F'),
                          color: '#fff',
                          display: 'grid', placeItems: 'center',
                          fontSize: 10, fontWeight: 900, letterSpacing: 0.3,
                          overflow: 'hidden',
                        }}>
                          {logoSrc
                            ? <Image src={logoSrc} alt={t.banco ?? ''} width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : getBankInitial(t.banco)
                          }
                        </div>
                      );
                    })()}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: nameC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</div>
                      <div style={{ fontSize: 10, color: bankC, fontWeight: 600, marginTop: 2 }}>{t.banco}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: isCredito ? (D ? '#e07878' : '#dc2626') : (D ? '#c8d0c8' : '#111827') }}>
                      {isCredito
                        ? (saldo > 0 ? `−${formatIntegerCurrency(saldo)}` : formatIntegerCurrency(0))
                        : formatIntegerCurrency(saldo)}
                    </div>
                    {isCredito && limite > 0 && (
                      <div style={{ fontSize: 10, color: limitC, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                        lím. {formatIntegerCurrency(limite)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de utilización — solo crédito con límite */}
                {isCredito && limite > 0 && (
                  <>
                    <div style={{ height: 5, borderRadius: 10, background: trackBg, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: `${utilPct}%`, borderRadius: 10, background: utilPct > 80 ? `linear-gradient(90deg,${utilColor}99,${utilColor})` : `linear-gradient(90deg,#16a34a,#22c55e)`, transition: 'width .4s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: utilColor }}>{utilPct}% usado{utilPct >= 100 ? ' ⚠' : ''}</span>
                      <span style={{ fontSize: 11, color: bankC, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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

// ── DashboardHome ─────────────────────────────────────────────────────────
