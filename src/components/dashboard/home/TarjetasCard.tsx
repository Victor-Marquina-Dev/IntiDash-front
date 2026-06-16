'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { DASHBOARD_CARD } from '@/lib/dashboard-spacing';
import { useDashboardAccounts } from '@/shared/hooks/use-dashboard-accounts';
import { getKpiPalette } from './kpi-palette';
import { CardTabsRow } from './CardHeaderSection';
import { AccountsBarChart } from '@/components/ui/AccountsBarChart';
import { RADIUS } from '@/lib/radius';

export function TarjetasCard({ darkMode = false, canWrite: _canWrite = true, onNavigate }: Readonly<{ darkMode?: boolean; canWrite?: boolean; onNavigate?: (screen: string) => void }>) {
  const { rows, loading, tipos, activeTab, visibles, selectTab } = useDashboardAccounts();
  const t = getKpiPalette(darkMode);
  const [btnHovered, setBtnHovered] = React.useState(false);

  const accent = darkMode
    ? { bg: 'rgba(198,172,143,0.12)', border: 'rgba(198,172,143,0.28)', color: '#C6AC8F' }
    : { bg: 'rgba(140,111,78,0.10)',  border: 'rgba(140,111,78,0.26)',  color: '#8C6F4E' };

  const D = darkMode;

  return (
    <div style={{ background: t.outerBg, borderRadius: RADIUS.dashboardCard }} className="relative rounded-xl overflow-hidden">

      <div
        className="flex flex-col w-full h-full rounded-lg"
        style={{ background: t.innerBg, borderRadius: RADIUS.dashboardCard, padding: DASHBOARD_CARD.padding }}
      >

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
              <Icon.arrowRight size={12} strokeWidth={2.2} />
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
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 196 }}
        >
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 168, paddingTop: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, height: `${38 + i * 16}%`, borderRadius: 10, background: t.border, opacity: 0.5 }} />
              ))}
            </div>
          )}

          {!loading && visibles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: t.label, fontSize: 12 }}>
              {rows.length === 0 ? 'Sin cuentas registradas.' : 'Sin cuentas en esta categoría.'}
            </div>
          )}

          {!loading && visibles.length > 0 && (
            <AccountsBarChart
              data={[...visibles]
                .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
                .map(c => ({ label: c.nombre, amount: c.balance ?? 0 }))}
              darkMode={D}
              accentColor={accent.color}
              onDetail={() => onNavigate?.('cards')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
