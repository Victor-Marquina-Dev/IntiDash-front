import { landingColors } from './theme';

/**
 * Dashboard recreado en HTML/CSS: refleja el layout real del producto.
 * Sin screenshot: nítido en retina, sin dependencias externas.
 */
export function HeroMockup() {
  const accounts = [
    { name: 'Yape', bank: 'YAPE', balance: 'S/ 8,289', color: '#7C3AED' },
    { name: 'Falabella', bank: 'FALABELLA', balance: 'S/ 6,689', color: landingColors.debt },
    { name: 'Ahorro Soles', bank: 'INTERBANK', balance: 'S/ 5,268', color: landingColors.income },
  ];

  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun'];

  return (
    <div
      className="w-full rounded-[24px] overflow-hidden"
      style={{
        background: '#F8F8F6',
        border: '1px solid rgba(10,46,34,0.1)',
        boxShadow: '0 24px 80px -24px rgba(10,46,34,0.25)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Chrome bar: fondo claro como el dashboard real */}
      <div style={{ background: 'rgba(245,245,247,0.95)', borderBottom: '1px solid rgba(17,24,39,0.07)', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Botones macOS */}
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'block' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#171C1A" />
            <path d="M8 8 L14 20 L20 8" stroke="#8FA88F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M11 14 L17 14" stroke="#8FA88F" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', letterSpacing: -0.5 }}>IntiDash</span>
        </div>

        {/* Workspace pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(17,24,39,0.05)', border: '1px solid rgba(17,24,39,0.08)', borderRadius: 8, padding: '3px 9px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: landingColors.income, display: 'inline-block' }} />
          <span style={{ fontSize: 10, color: '#374151', fontWeight: 500 }}>Personal de Victor J.</span>
        </div>

        {/* Nav pills: centrado */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, padding: '3px 4px' }}>
            {['Dashboard', 'Cuentas', 'Análisis', 'Objetivos'].map((n, i) => (
              <span key={n} style={{
                fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: i === 0 ? 700 : 500,
                background: i === 0 ? '#111827' : 'transparent',
                color: i === 0 ? '#fff' : '#6B7280',
              }}>{n}</span>
            ))}
          </div>
        </div>

        {/* Iconos derecha */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(17,24,39,0.08)', display: 'grid', placeItems: 'center', color: '#6B7280', fontSize: 12 }}>⚙</div>
          <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(17,24,39,0.08)', display: 'grid', placeItems: 'center', color: '#6B7280', fontSize: 12 }}>◐</div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(140deg,#374151,#111827)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 9, fontWeight: 700, boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(17,24,39,0.12)' }}>SC</div>
        </div>
      </div>

      {/* Cuerpo del dashboard */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: 10 }}>

        {/* Col 1: Balance + chart comparativa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Balance total */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(10,46,34,0.06)' }}>
            <p style={{ fontSize: 10, color: '#9AA5A0', marginBottom: 2, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>Balance total · Todas las cuentas</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#171C1A', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>S/ 35,418</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {[
                { label: 'Cambio mensual', val: '+82.2%', pos: true },
                { label: 'Flujo neto', val: '+S/ 45,016', pos: true },
                { label: 'Patrimonio', val: 'S/ 31,807', pos: false },
              ].map(k => (
                <div key={k.label}>
                  <p style={{ fontSize: 9, color: '#9AA5A0' }}>{k.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: k.pos ? landingColors.income : '#171C1A', fontVariantNumeric: 'tabular-nums' }}>{k.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico comparativa Ingresos, Gastos y Deudas */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(10,46,34,0.06)', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#5A6661', textTransform: 'uppercase', letterSpacing: 0.4 }}>Análisis</p>
              <div style={{ display: 'flex', gap: 8, fontSize: 9, color: '#9AA5A0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 2, background: landingColors.income, borderRadius: 2, display: 'inline-block' }} />Ingresos</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 2, background: landingColors.expense, borderRadius: 2, display: 'inline-block' }} />Gastos</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 2, background: landingColors.debt, borderRadius: 2, display: 'inline-block' }} />Deudas</span>
              </div>
            </div>
            <svg viewBox="0 0 240 80" style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={landingColors.income} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={landingColors.income} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 40, 60].map(y => <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="rgba(10,46,34,0.05)" strokeWidth="1" />)}
              {months.map((m, i) => <text key={m} x={i * 40 + 20} y="78" fontSize="7" fill="#9AA5A0" textAnchor="middle">{m}</text>)}
              <path d="M20,68 C60,67 100,65 140,62 C180,60 200,58 220,56" fill="none" stroke={landingColors.expense} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20,72 C60,70 100,68 140,63 C180,54 200,50 220,48" fill="none" stroke={landingColors.debt} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20,70 C60,69 100,66 140,55 C180,42 200,25 220,8 L220,72 L20,72 Z" fill="url(#gIngresos)" />
              <path d="M20,70 C60,69 100,66 140,55 C180,42 200,25 220,8" fill="none" stroke={landingColors.income} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Col 2: KPIs + donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'INGRESOS', val: 'S/ 35,638', delta: '+8.2%', color: landingColors.income, neg: false },
              { label: 'GASTOS', val: 'S/ 6,522', delta: '-2.1%', color: landingColors.expense, neg: true },
              { label: 'DEUDAS', val: 'S/ 13,732', sub: '10 activas', color: landingColors.debt, neg: false },
              { label: 'AHORRO', val: 'S/ 12,772', sub: '2 cuentas', color: landingColors.income, neg: false },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(10,46,34,0.06)' }}>
                <p style={{ fontSize: 8.5, fontWeight: 600, color: '#9AA5A0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{k.val}</p>
                {k.delta && <p style={{ fontSize: 9, color: k.neg ? landingColors.expense : landingColors.income, marginTop: 2 }}>{k.delta} vs mes anterior</p>}
                {k.sub && <p style={{ fontSize: 9, color: '#9AA5A0', marginTop: 2 }}>{k.sub}</p>}
              </div>
            ))}
          </div>

          {/* Donut categorías */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(10,46,34,0.06)', flex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#5A6661', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Categorías</p>
              <svg viewBox="0 0 80 80" width="72" height="72" style={{ display: 'block' }}>
                {(() => {
                  const slices = [
                    { pct: 26, color: landingColors.income },
                    { pct: 22, color: landingColors.debt },
                    { pct: 21, color: landingColors.expense },
                    { pct: 18, color: '#A7C4B5' },
                    { pct: 13, color: '#ECFDF5' },
                  ];
                  let cum = 0;
                  return slices.map((s, i) => {
                    const start = (cum / 100) * 2 * Math.PI - Math.PI / 2;
                    const end = ((cum + s.pct) / 100) * 2 * Math.PI - Math.PI / 2;
                    const r = 30; const cx = 40; const cy = 40;
                    const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start);
                    const x2 = cx + r * Math.cos(end); const y2 = cy + r * Math.sin(end);
                    const large = s.pct > 50 ? 1 : 0;
                    cum += s.pct;
                    return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={s.color} />;
                  });
                })()}
                <circle cx="40" cy="40" r="18" fill="#fff" />
                <text x="40" y="43" fontSize="8" fontWeight="800" fill="#171C1A" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>S/57.6k</text>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: 'Sueldo', color: landingColors.income, pct: '26%' },
                { label: 'Préstamos', color: landingColors.debt, pct: '22%' },
                { label: 'Gastos', color: landingColors.expense, pct: '21%' },
                { label: 'Sueldo', color: '#A7C4B5', pct: '18%' },
                { label: 'Otros', color: '#ECFDF5', pct: '13%' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, flexShrink: 0, border: '1px solid rgba(10,46,34,0.1)' }} />
                  <span style={{ fontSize: 9, color: '#5A6661', flex: 1 }}>{c.label}</span>
                  <span style={{ fontSize: 9, color: '#9AA5A0', fontVariantNumeric: 'tabular-nums' }}>{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Cuentas + deudas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '12px', border: '1px solid rgba(10,46,34,0.06)', flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#5A6661', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Cuentas</p>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {['Corriente 4', 'Ahorro 2', 'Crédito 2'].map((t, i) => (
                <span key={t} style={{ fontSize: 8.5, padding: '2px 7px', borderRadius: 20, background: i === 0 ? '#171C1A' : 'rgba(10,46,34,0.06)', color: i === 0 ? '#fff' : '#9AA5A0', fontWeight: i === 0 ? 600 : 400 }}>{t}</span>
              ))}
            </div>
            {accounts.map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(10,46,34,0.04)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: a.color, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{a.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#171C1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                  <p style={{ fontSize: 8.5, color: '#9AA5A0' }}>{a.bank}</p>
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#171C1A', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{a.balance}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '12px', border: '1px solid rgba(10,46,34,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#5A6661', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Deudas pendientes</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: landingColors.debt, fontVariantNumeric: 'tabular-nums' }}>S/ 13,732</p>
            <p style={{ fontSize: 9, color: '#9AA5A0', marginTop: 2 }}>10 deudas · 3 préstamos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

