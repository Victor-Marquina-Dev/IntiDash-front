'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { formatCurrencyParts, formatIntegerCurrency, isDateInMonth } from '@/lib/format';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CuentaBancariaRow, GastoDeudaRow, GastoUnicoRow, IngresoRow, TransferenciaRow } from '@/shared/types/finance.types';
import { AccountListGroup } from './AccountGroup';
import { AccountModal, CreateAccountModal } from './AccountModals';
import { TransactionPanel } from './TransactionPanel';
import type { AccountExpenseRow } from './types';
import { isCreditAccount as _isCreditAccount } from './utils';

interface AccountsScreenProps { accent: string; canWrite?: boolean; darkMode?: boolean }

const TIPO_ORDER = ['CORRIENTE', 'AHORRO', 'INVERSION', 'ALIMENTOS'];

const normTipoValue = (t?: string | null) =>
  (t ?? '').trim().toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export function AccountsScreen({ accent: _accent, canWrite = true, darkMode = false }: AccountsScreenProps) {
  const [cuentas,        setCuentas]        = React.useState<CuentaBancariaRow[]>([]);
  const [ingresos,       setIngresos]       = React.useState<IngresoRow[]>([]);
  const [gastos,         setGastos]         = React.useState<GastoUnicoRow[]>([]);
  const [gastosDeudas,   setGastosDeudas]   = React.useState<GastoDeudaRow[]>([]);
  const [transferencias, setTransferencias] = React.useState<TransferenciaRow[]>([]);
  const [loading,        setLoading]        = React.useState(true);

  const [displayedTotal, setDisplayedTotal] = React.useState(0);
  const [hovAll,        setHovAll]        = React.useState(false);
  const [hovCreateBtn,  setHovCreateBtn]  = React.useState(false);
  const [activeCuenta,   setActiveCuenta]   = React.useState<CuentaBancariaRow | null>(null);
  const [activeGroupKey, setActiveGroupKey] = React.useState<string | null>(null);
  const [editCuenta,   setEditCuenta]   = React.useState<CuentaBancariaRow | null>(null);
  const [showCreate,   setShowCreate]   = React.useState(false);
  const [loadKey,      setLoadKey]      = React.useState(0);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = React.useCallback((group: string, isOpen: boolean) => {
    setExpandedGroups(current => ({ ...current, [group]: !current[group] }));
    if (!isOpen) return;
    const normG = normTipoValue;
    setActiveCuenta(current => (current && normG(current.tipo) === normG(group) ? null : current));
    setActiveGroupKey(current => (current === group ? null : current));
  }, []);

  // Recargar cuando otro componente crea/edita datos (con debounce: el evento puede emitirse dos veces)
  React.useEffect(() => {
    let t: number | undefined;
    const handler = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setLoadKey(k => k + 1), 250);
    };
    window.addEventListener('data-synced', handler);
    return () => { window.clearTimeout(t); window.removeEventListener('data-synced', handler); };
  }, []);

  React.useEffect(() => {
    let active = true;

    Promise.all([
      notionPaymentsService.getCuentasBancarias(),
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getTransferencias(),
    ]).then(([c, i, g, gd, t]) => {
      if (!active) return;
      setCuentas(c);
      setIngresos(i);
      setGastos(g);
      setGastosDeudas(gd);
      setTransferencias(t);
      // Section
      try {
        const pendingGroup = localStorage.getItem('florin:pending-group');
        if (pendingGroup) {
          localStorage.removeItem('florin:pending-group');
          const key = normTipoValue(pendingGroup);
          setExpandedGroups({ [key]: true });
          setActiveGroupKey(key);
        } else {
          const pending = localStorage.getItem('florin:pending-account');
          if (pending) {
            localStorage.removeItem('florin:pending-account');
            const found = c.find(x => x.nombre.toLowerCase() === pending.toLowerCase());
            if (found) setActiveCuenta(found);
          } else {
            const firstGroup = [...new Set(c.map(account => normTipoValue(account.tipo)).filter(Boolean))]
              .sort((a, b) => {
                const ai = TIPO_ORDER.indexOf(a);
                const bi = TIPO_ORDER.indexOf(b);
                if (ai !== -1 && bi !== -1) return ai - bi;
                if (ai !== -1) return -1;
                if (bi !== -1) return 1;
                return a.localeCompare(b);
              })[0];
            if (firstGroup) setExpandedGroups({ [firstGroup]: true });
          }
        }
      } catch {}
    }).catch(() => {}).finally(() => {
      if (!active) return;
      setLoading(false);
    });

    return () => { active = false; };
  }, [loadKey]);

  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const cuentaNorm = norm(activeCuenta?.nombre);

  // Suma con signo (igual que el dashboard): las cuentas de crédito con balance negativo restan
  const totalSaldo = cuentas.reduce((s, c) => s + (c.balance ?? c.balanceInicial ?? 0), 0);

  const TIPO_LABELS: Record<string, string> = {
    CORRIENTE: 'Corriente', AHORRO: 'Ahorro', INVERSION: 'Inversión',
    ALIMENTOS: 'Alimentos', CREDITO: 'Créditos',
  };

  const normTipo = normTipoValue;

  const tipoLabel = (t: string) => TIPO_LABELS[normTipo(t)] ?? (t[0].toUpperCase() + t.slice(1).toLowerCase());

  const accountGroups = React.useMemo(() => {
    const map = new Map<string, CuentaBancariaRow[]>();
    for (const c of cuentas) {
      const key = normTipo(c.tipo);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    const entries = Array.from(map.entries());
    entries.sort(([a], [b]) => {
      const ai = TIPO_ORDER.indexOf(a);
      const bi = TIPO_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return entries;
  }, [cuentas, normTipo]);

  const groupCuentaNames = React.useMemo(() => {
    if (!activeGroupKey) return null;
    return new Set(
      accountGroups.find(([k]) => k === activeGroupKey)?.[1]
        .map(c => norm(c.nombre)) ?? []
    );
  }, [activeGroupKey, accountGroups]);

  const allGastos = React.useMemo<AccountExpenseRow[]>(() => [
    ...gastos.map(row => ({
      id: row.id,
      nombre: row.nombre,
      categoriaGasto: row.categoriaGasto,
      cuentaBancaria: row.cuentaBancaria,
      monto: row.monto,
      fecha: row.fecha,
      origen: 'unico' as const,
      syncedAt: row.syncedAt,
    })),
    ...gastosDeudas.map(row => ({
      id: row.id,
      nombre: row.nombre,
      categoriaGasto: row.categoriaGasto,
      cuentaBancaria: row.cuentaBancaria,
      monto: row.montoGastado,
      fecha: row.fecha,
      origen: 'deuda' as const,
      cualDeuda: row.cualDeuda,
      syncedAt: row.syncedAt,
    })),
  ], [gastos, gastosDeudas]);

  const filteredIngresos = activeCuenta
    ? ingresos.filter(i => norm(i.cuentaBancaria) === cuentaNorm)
    : groupCuentaNames
      ? ingresos.filter(i => groupCuentaNames.has(norm(i.cuentaBancaria)))
      : ingresos;
  const filteredGastos = activeCuenta
    ? allGastos.filter(g => norm(g.cuentaBancaria) === cuentaNorm)
    : groupCuentaNames
      ? allGastos.filter(g => groupCuentaNames.has(norm(g.cuentaBancaria)))
      : allGastos;
  const filteredTransferencias = activeCuenta
    ? transferencias.filter(t => norm(t.cuentaOrigen) === cuentaNorm || norm(t.cuentaDestino) === cuentaNorm)
    : groupCuentaNames
      ? transferencias.filter(t => groupCuentaNames.has(norm(t.cuentaOrigen)) || groupCuentaNames.has(norm(t.cuentaDestino)))
      : transferencias;

  const currentMonth = React.useMemo(() => new Date(), []);
  const monthlyIngresos = React.useMemo(
    () => filteredIngresos.filter(row => isDateInMonth(row.fecha, currentMonth)),
    [filteredIngresos, currentMonth],
  );
  const monthlyGastos = React.useMemo(
    () => filteredGastos.filter(row => isDateInMonth(row.fecha, currentMonth)),
    [filteredGastos, currentMonth],
  );
  const monthlyTransferencias = React.useMemo(
    () => filteredTransferencias.filter(row => isDateInMonth(row.fecha, currentMonth)),
    [filteredTransferencias, currentMonth],
  );

  React.useEffect(() => {
    if (loading) return;
    const target = totalSaldo;
    let rafId: number;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedTotal(target * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setDisplayedTotal(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [totalSaldo, loading]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>

      {/* Panel izquierdo: lista de cuentas */}
      <div style={{
        width: '40%', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : C.border}`,
        overflowY: 'auto',
      }}>
        {/* Cabecera del panel */}
        <div style={{
          padding: '22px 20px 16px',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : C.border}`,
          flexShrink: 0,
          background: darkMode ? 'transparent' : 'linear-gradient(160deg, rgba(143,168,143,0.08) 0%, rgba(255,255,255,0) 60%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.wallet size={16} strokeWidth={2.2} style={{ color: darkMode ? 'rgba(255,255,255,0.50)' : C.textDim }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.5 }}>Cuentas</span>
              </div>
            </div>
            {canWrite && (
              <button
                onClick={() => setShowCreate(true)}
                onMouseEnter={() => setHovCreateBtn(true)}
                onMouseLeave={() => setHovCreateBtn(false)}
                title={'Nueva cuenta'}
                aria-label={'Nueva cuenta'}
                style={{
                  width: 30, height: 30, borderRadius: 9,
                  border: `1px solid ${hovCreateBtn ? (darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(17,24,39,0.22)') : (darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)')}`,
                  background: hovCreateBtn ? (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)') : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)'),
                  display: 'grid', placeItems: 'center',
                  cursor: 'pointer',
                  color: hovCreateBtn ? (darkMode ? 'rgba(255,255,255,0.88)' : C.text) : (darkMode ? 'rgba(255,255,255,0.50)' : C.textDim),
                  boxShadow: hovCreateBtn ? '0 2px 8px rgba(17,24,39,0.10)' : 'none',
                  transition: 'all .2s', flexShrink: 0,
                }}
              >
                <Icon.plus size={13} strokeWidth={2.2} />
              </button>
            )}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
            Balance total
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: darkMode ? 'rgba(255,255,255,0.50)' : C.textDim, letterSpacing: -0.3 }}>S/</span>
            <span style={{ fontSize: 38, fontWeight: 900, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -1.5, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {formatCurrencyParts(displayedTotal).integer}
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(17,24,39,0.22)', letterSpacing: -0.5 }}>
              .{String(Math.round((displayedTotal % 1) * 100)).padStart(2, '0')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: C.pos, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600 }}>
              {cuentas.length} cuentas activas
            </span>
          </div>
        </div>

        {/* Item "Todas" */}
        <div
          onClick={() => { setActiveCuenta(null); setActiveGroupKey(null); }}
          onMouseEnter={() => setHovAll(true)}
          onMouseLeave={() => setHovAll(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 20px 14px 16px', cursor: 'pointer',
            background: !activeCuenta && !activeGroupKey ? (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.06)') : hovAll ? (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.03)') : 'transparent',
            borderLeft: `3px solid ${!activeCuenta && !activeGroupKey ? C.primary : 'transparent'}`,
            boxShadow: hovAll && (activeCuenta || activeGroupKey) ? '0 2px 10px rgba(17,24,39,0.07)' : 'none',
            transform: hovAll && (activeCuenta || activeGroupKey) ? 'translateX(3px)' : 'translateX(0)',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: !activeCuenta && !activeGroupKey ? C.primary : hovAll ? (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.14)') : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.08)'),
            color: !activeCuenta && !activeGroupKey ? '#fff' : (darkMode ? 'rgba(255,255,255,0.50)' : C.textDim),
            display: 'grid', placeItems: 'center',
            transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
            transform: !activeCuenta && !activeGroupKey ? 'scale(1.05)' : hovAll ? 'scale(1.02)' : 'scale(1)',
            boxShadow: !activeCuenta && !activeGroupKey ? '0 4px 14px rgba(17,24,39,0.20)' : 'none',
          }}>
            <Icon.list size={18} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text }}>Todas las cuentas</div>
            <div style={{ fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600, marginTop: 2 }}>Vista agregada</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text, fontVariantNumeric: 'tabular-nums' }}>
            {formatIntegerCurrency(totalSaldo)}
          </div>
        </div>

        <div style={{ height: 1, background: darkMode ? 'rgba(255,255,255,0.08)' : C.border, margin: '3px 0' }} />

        {/* Skeleton de carga */}
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 16px', alignItems: 'center' }}>
            <div className="fz-skeleton" style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="fz-skeleton" style={{ height: 12, width: '70%', borderRadius: 5, marginBottom: 5 }} />
              <div className="fz-skeleton" style={{ height: 10, width: '50%', borderRadius: 5 }} />
            </div>
            <div className="fz-skeleton" style={{ height: 12, width: 60, borderRadius: 5 }} />
          </div>
        ))}

        {/* Lista de cuentas agrupada */}
        {!loading && cuentas.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, fontSize: 12 }}>
            Sin cuentas. Sincroniza desde Notion.
          </div>
        )}

        {!loading && accountGroups.map(([key, accounts]) => {
          const isOpen = !!expandedGroups[key];
          const groupTotal = accounts.reduce((s, c) => s + (c.balance ?? c.balanceInicial ?? 0), 0);
          return (
            <AccountListGroup
              key={key}
              label={tipoLabel(key)}
              accounts={accounts}
              isOpen={isOpen}
              activeCuentaId={activeCuenta?.id}
              isGroupActive={activeGroupKey === key && !activeCuenta}
              groupTotal={groupTotal}
              darkMode={darkMode}
              onToggle={() => toggleGroup(key, isOpen)}
              onSelect={c => { setActiveCuenta(c); setActiveGroupKey(null); }}
              onGroupSelect={key === 'AHORRO' ? () => { setActiveCuenta(null); setActiveGroupKey(key); } : undefined}
            />
          );
        })}

      </div>

      {/* Panel derecho: transacciones */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, fontSize: 14 }}>
          Cargando...
        </div>
      ) : (
        <TransactionPanel
          key={activeCuenta?.id ?? activeGroupKey ?? 'all'}
          cuentaNombre={activeCuenta?.nombre ?? (activeGroupKey ? `Todas · ${tipoLabel(activeGroupKey)}` : null)}
          ingresos={monthlyIngresos}
          gastos={monthlyGastos}
          transferencias={monthlyTransferencias}
          showCuenta={!activeCuenta}
          canWrite={canWrite}
          darkMode={darkMode}
          onRefresh={() => setLoadKey(k => k + 1)}
        />
      )}

      {/* Modales */}
      {editCuenta && (
        <AccountModal
          cuenta={editCuenta}
          onClose={() => setEditCuenta(null)}
          canWrite={canWrite}
          onSave={(updated) => {
            setCuentas(prev => prev.map(c => c.id === updated.id ? updated : c));
            if (activeCuenta?.id === updated.id) setActiveCuenta(updated);
            setEditCuenta(updated);
          }}
        />
      )}

      {showCreate && (
        <CreateAccountModal
          onClose={() => setShowCreate(false)}
          onCreated={(nueva) => {
            setCuentas(prev => [...prev, nueva]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

