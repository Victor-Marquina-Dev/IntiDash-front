'use client';

import React from 'react';
import Link from 'next/link';
import { ColorOrb } from '@/components/ui/MorphPanel';

// ── Paleta Steep ───────────────────────────────────────────────────────────
const STEEP = {
  ink: '#17191c',
  white: '#ffffff',
  fog: '#f7f7f8',
  ash: '#4c4c4c',
  graphite: '#777b86',
  dove: '#a3a6af',
  rust: '#5d2a1a',
  apricot: '#fbe1d1',
  sky: '#d3e3fc',
  blue: '#4a90e2',
  pos: '#2f7a4f',
};
const SERIF = "'Signifier', Georgia, 'Times New Roman', serif";
const CARD_SHADOW = 'rgba(4,23,43,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.10) 0px 20px 25px -5px, rgba(0,0,0,0.10) 0px 8px 10px -6px';

const cardBase: React.CSSProperties = {
  borderRadius: 24, padding: 20, boxShadow: CARD_SHADOW, width: '100%', boxSizing: 'border-box',
};

// ── Card: Balance Total ──────────────────────────────────────────────────────
function BalanceCard() {
  return (
    <div style={{ ...cardBase, background: STEEP.white }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: STEEP.graphite }}>Balance total</div>
      <div style={{ fontSize: 38, fontWeight: 400, fontFamily: SERIF, color: STEEP.ink, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1 }}>
        S/ 18,307
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12.5, fontWeight: 500, color: STEEP.pos }}>
        ▲ +98.4% este mes
      </div>
      {/* mini sparkline */}
      <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style={{ display: 'block', marginTop: 14 }}>
        <path d="M0 28 C40 26, 70 18, 110 16 S180 6, 220 2" fill="none" stroke={STEEP.rust} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Card: Análisis (line chart rust + blue) ──────────────────────────────────
function AnalisisCard() {
  return (
    <div style={{ ...cardBase, background: STEEP.white }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: STEEP.ink }}>Análisis</span>
        <span style={{ display: 'flex', gap: 10, fontSize: 11, color: STEEP.graphite }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 2, background: STEEP.rust, display: 'inline-block' }} />Gastos</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 2, background: STEEP.blue, display: 'inline-block' }} />Ingresos</span>
        </span>
      </div>
      <svg width="100%" height="92" viewBox="0 0 240 92" preserveAspectRatio="none" style={{ display: 'block' }}>
        <path d="M0 60 C40 58, 60 34, 92 40 S160 14, 240 8" fill="none" stroke={STEEP.blue} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M0 74 C40 72, 70 62, 104 60 S168 48, 240 40" fill="none" stroke={STEEP.rust} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: STEEP.dove, marginTop: 6 }}>
        <span>ene</span><span>mar</span><span>may</span><span>jun</span>
      </div>
    </div>
  );
}

// ── Card: Categorías (ingresos / egresos) ─────────────────────────────────────
const CATS = [
  { label: 'Comida',      pct: 34, op: 1 },
  { label: 'Hogar',       pct: 28, op: 0.72 },
  { label: 'Transporte',  pct: 22, op: 0.48 },
  { label: 'Otros',       pct: 16, op: 0.28 },
];
function CategoriasCard() {
  const R = 30, C = 2 * Math.PI * R;
  return (
    <div style={{ ...cardBase, background: STEEP.apricot }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: STEEP.ink }}>Categorías</span>
        <span style={{ display: 'inline-flex', gap: 4, background: 'rgba(93,42,26,0.10)', borderRadius: 9999, padding: 2 }}>
          <span style={{ fontSize: 10.5, fontWeight: 500, color: STEEP.graphite, padding: '2px 8px' }}>Ingresos</span>
          <span style={{ fontSize: 10.5, fontWeight: 500, color: STEEP.white, background: STEEP.rust, borderRadius: 9999, padding: '2px 8px' }}>Egresos</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(93,42,26,0.14)" strokeWidth="11" />
          {CATS.map((c, i) => {
            const start = CATS.slice(0, i).reduce((s, x) => s + x.pct, 0);
            const seg = (c.pct / 100) * C;
            const dash = `${seg} ${C - seg}`;
            const offset = -(start / 100) * C;
            return (
              <circle key={c.label} cx="40" cy="40" r={R} fill="none"
                stroke={STEEP.rust} strokeOpacity={c.op} strokeWidth="11"
                strokeDasharray={dash} strokeDashoffset={offset}
                transform="rotate(-90 40 40)" />
            );
          })}
        </svg>
        <div style={{ flex: 1, fontSize: 12, color: STEEP.ash, lineHeight: 1.7 }}>
          {CATS.map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <i style={{ width: 8, height: 8, borderRadius: 2, background: STEEP.rust, opacity: c.op, display: 'inline-block' }} />
              <span style={{ flex: 1 }}>{c.label}</span>
              <b style={{ color: STEEP.ink, fontWeight: 500 }}>{c.pct}%</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Card: Chat IA con typing "Resumen del mes" ────────────────────────────────
const TYPED = 'Resumen del mes';
function ChatCard() {
  const [text, setText] = React.useState('');
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setText(TYPED.slice(0, i));
        if (i >= TYPED.length && interval) {
          clearInterval(interval);
          setTimeout(() => setSent(true), 700);
        }
      }, 70);
    }, 700);
    return () => { clearTimeout(startDelay); if (interval) clearInterval(interval); };
  }, []);

  return (
    <div style={{ ...cardBase, background: STEEP.white, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <ColorOrb dimension="26px" tones={{ base: 'oklch(22.64% 0 0)' }} />
        <span style={{ fontSize: 13.5, fontWeight: 500, color: STEEP.ink }}>Asistente IA</span>
      </div>

      {sent && (
        <div style={{ background: STEEP.sky, borderRadius: 16, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: STEEP.graphite, marginBottom: 6 }}>Ingresos vs gastos</div>
          <svg width="100%" height="44" viewBox="0 0 260 44" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0 34 C50 32, 90 18, 130 20 S210 6, 260 4" fill="none" stroke={STEEP.blue} strokeWidth="2" strokeLinecap="round" />
            <path d="M0 38 C50 36, 100 30, 140 29 S220 22, 260 18" fill="none" stroke={STEEP.rust} strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 12, color: STEEP.ash, marginTop: 8, lineHeight: 1.45 }}>
            Ingresaste <b style={{ color: STEEP.ink, fontWeight: 500 }}>S/ 37,638</b> y gastaste S/ 19,633. Tu ahorro creció 98%.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${STEEP.dove}`, borderRadius: 16, padding: '8px 8px 8px 14px' }}>
        <span style={{ flex: 1, fontSize: 14, color: text ? STEEP.ink : STEEP.graphite, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {text || 'Pregúntame algo...'}
          {!sent && <span className="fz-caret" style={{ display: 'inline-block', width: 1.5, height: 15, background: STEEP.ink, marginLeft: 1, verticalAlign: '-2px' }} />}
        </span>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: STEEP.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

const HERO_CARDS = [BalanceCard, AnalisisCard, CategoriasCard, ChatCard];
const CARD_DEPTHS = [14, 22, 10, 26]; // profundidad del parallax por card
// Posiciones orbitando el titular (desktop). Orden: Balance, Análisis, Categorías, Chat.
const ORBIT: React.CSSProperties[] = [
  { left:  'clamp(16px, 4vw, 96px)',  top: 150, width: 250 }, // Balance — sup-izq
  { left:  'clamp(40px, 7vw, 170px)', top: 470, width: 268 }, // Análisis — inf-izq
  { right: 'clamp(16px, 4vw, 96px)',  top: 122, width: 234 }, // Categorías — sup-der
  { right: 'clamp(16px, 3vw, 80px)',  top: 444, width: 320 }, // Chat — inf-der
];

export function Hero() {
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  // Parallax con el mouse: cada card se desplaza según su profundidad.
  React.useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const d = CARD_DEPTHS[i] ?? 14;
          el.style.transform = `translate(${(nx * d).toFixed(2)}px, ${(ny * d).toFixed(2)}px)`;
        });
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: STEEP.white, paddingTop: 120, paddingBottom: 88 }}>
      {/* Glow apricot del hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 1000px 540px at 50% -6%, rgba(251,225,209,0.9), transparent 66%)' }}
      />

      {/* Cards orbitando el titular (desktop) — absolutas respecto al section */}
      <div className="hidden xl:block">
        {HERO_CARDS.map((Card, i) => (
          <div
            key={Card.name}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="absolute"
            style={{ ...ORBIT[i], zIndex: 0, transition: 'transform .25s ease-out', willChange: 'transform' }}
          >
            <div className="fz-float-loop" style={{ animation: `fzFloatLoop ${6 + i * 0.6}s ease-in-out ${0.9 + i * 0.3}s infinite` }}>
              <div style={{ animation: `fzFloatIn .7s ease both ${0.1 + i * 0.12}s` }}>
                <Card />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Titular central */}
      <div className="relative z-10 mx-auto px-6 flex flex-col items-center text-center" style={{ maxWidth: 620, paddingTop: 112, paddingBottom: 96 }}>
        <span
          className="inline-flex items-center gap-2 rounded-full mb-7"
          style={{ background: STEEP.white, border: `1px solid ${STEEP.dove}`, color: STEEP.ink, fontSize: 13, fontWeight: 450, padding: '6px 14px' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STEEP.rust }} />
          Notion, Excel y workspaces en un solo dashboard
        </span>

        <h1
          className="mb-6"
          style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(40px, 5.4vw, 62px)', lineHeight: 1.1, letterSpacing: '-0.025em', color: STEEP.ink }}
        >
          Tus finanzas, claras como la luz del amanecer.
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.5, color: STEEP.ash, maxWidth: 540, marginBottom: 30, letterSpacing: '-0.009em' }}>
          Movimientos, cuentas y metas en una vista editorial y serena. Importa desde Notion,
          exporta a Excel y pregunta a la IA lo que necesites.
        </p>

        <div className="flex items-center gap-5" style={{ marginBottom: 14 }}>
          <Link href="/registro" style={{ background: STEEP.ink, color: STEEP.white, borderRadius: 9999, padding: '11px 22px', fontSize: 15, fontWeight: 450, letterSpacing: '-0.009em', textDecoration: 'none' }}>
            Crear mi dashboard
          </Link>
          <Link href="/demo" style={{ color: STEEP.ink, fontSize: 15, fontWeight: 450, letterSpacing: '-0.009em', textDecoration: 'none' }}>
            Ver demo interactiva →
          </Link>
        </div>

        <p style={{ fontSize: 13, color: STEEP.graphite, marginBottom: 0 }}>
          Sin tarjeta. Empieza manual, con Notion o con una hoja de cálculo.
        </p>
      </div>

      {/* Cards en grid (tablet / móvil) */}
      <div className="xl:hidden mx-auto px-6 pb-20 grid items-start gap-4 grid-cols-1 sm:grid-cols-2" style={{ maxWidth: 860 }}>
        {HERO_CARDS.map((Card, i) => (
          <div key={Card.name} style={{ animation: `fzFloatIn .6s ease both ${0.05 + i * 0.1}s` }}>
            <Card />
          </div>
        ))}
      </div>
    </section>
  );
}
