/**
 * Sistema de color estandarizado — estética minimalista premium (Apple · Notion · Linear).
 *
 * Una sola fuente de verdad. Los tokens "heredados" (pos, neg, olive, purple…) se
 * conservan por compatibilidad pero ahora apuntan a la nueva paleta semántica, de modo
 * que un cambio aquí se propaga a toda la app.
 *
 * Capas:
 *   1. Superficie / texto / borde  → neutros (gris azulado, no verdes).
 *   2. Marca / acción              → negro elegante (accentDark).
 *   3. Semántica financiera        → success(verde) danger(rojo) info(azul)
 *                                     subscription(morado) goal(ámbar), c/u con su "soft".
 */
export const C = {
  /* ── Superficies ── */
  bg: '#FFFFFF',                  // fondo de la app
  card: 'rgba(204,220,204,0.18)', // tarjetas — sage verde muy sutil
  cardHi: '#FAFAFA',      // tarjeta elevada / hover

  /* ── Bordes (neutros translúcidos, ≈ #E5E7EB sobre claro) ── */
  border: 'rgba(17,24,39,0.08)',
  borderHi: 'rgba(17,24,39,0.16)',
  borderLight: '#E5E7EB',

  /* ── Texto ── */
  text: '#111827',        // principal
  textDim: '#6B7280',     // secundario
  textMute: '#9CA3AF',    // terciario / placeholder
  amount: '#2C1A0E',      // montos principales, igual al Balance Total

  /* ── Marca / acción (negro elegante) ── */
  primary: '#111827',
  accentDark: '#111827',
  accentDarkHover: '#1F2937',
  navbar: '#111827',
  navbarText: 'rgba(255,255,255,0.82)',
  navbarTextDim: 'rgba(255,255,255,0.50)',
  navbarBorder: 'rgba(255,255,255,0.10)',

  /* ── Semántica financiera ── */
  success: '#3C7828', successSoft: '#DCFCE7',   // ingresos / positivo
  danger: '#B43232',  dangerSoft: '#FEE2E2',    // gastos / negativo
  info: '#2563EB',    infoSoft: '#DBEAFE',      // ahorro / informativo
  subscription: '#7C3AED', subscriptionSoft: '#EDE9FE', // suscripciones
  goal: '#CA8A04',    goalSoft: '#FEF9C3',      // objetivos / atención

  /* ── Alias heredados → apuntan a la nueva paleta ── */
  soft: '#EEF1F5',        // fondo suave neutro (antes verde claro)
  pos: '#3C7828',         // = success
  neg: '#B43232',         // = danger
  warn: '#CA8A04',        // = goal (ámbar): alertas, cuotas, atención
  olive: '#3C7828',       // verde de marca = success
  purple: '#7C3AED',      // = subscription
  pink: '#DB2777',        // rosa (categorías / deudas decorativas)
  cyan: '#0891B2',        // celeste (educación / datos)
} as const;

export type Colors = typeof C;
