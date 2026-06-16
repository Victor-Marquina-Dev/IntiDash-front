// ── Sistema de diseño "Steep" (light, editorial) para el landing ──
// Se mantienen las claves antiguas (ink, paper, band, income…) para no romper
// las secciones existentes; ahora apuntan a la paleta Steep.
export const landingColors = {
  ink: '#17191c',        // texto principal / superficies oscuras
  muted: '#4c4c4c',      // ash — texto secundario
  softText: '#777b86',   // graphite — texto terciario
  paper: '#ffffff',      // canvas
  band: '#f7f7f8',       // fog — bandas alternas / sidebar
  dark: '#17191c',       // secciones oscuras = ink

  // Data-viz: solo dos voces cromáticas (rust cálido + azul frío) + un cálido medio
  income: '#4a90e2',     // azul (voz fría)
  expense: '#5d2a1a',    // rust (voz cálida)
  debt: '#a8623f',       // rust medio
  incomeSoft: '#d3e3fc', // sky wash
  expenseSoft: '#fbe1d1',// apricot wash
  debtSoft: '#f6e7dd',   // apricot tenue

  // Tokens Steep adicionales
  rust: '#5d2a1a',
  apricot: '#fbe1d1',
  sky: '#d3e3fc',
  blue: '#4a90e2',
  dove: '#a3a6af',
  graphite: '#777b86',
  fog: '#f7f7f8',
  white: '#ffffff',
  pos: '#2f7a4f',
};

// Serif editorial (Signifier → fallback) — solo para titulares ≥40px.
export const serifFont = "'Signifier', Georgia, 'Times New Roman', serif";

// Sombra de elevación de 3 capas (profundidad/relieve sobre el plano Steep).
export const cardShadow =
  'rgba(4,23,43,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.10) 0px 20px 25px -5px, rgba(0,0,0,0.10) 0px 8px 10px -6px';

export const landingRadius = {
  card: 24,
  media: 12,
  input: 16,
  pill: 9999,
} as const;

export const sectionPadding = 'clamp(76px, 9vw, 112px)';

export const financeSeries = [
  { label: 'Ingresos', color: landingColors.income, soft: landingColors.incomeSoft },
  { label: 'Gastos', color: landingColors.expense, soft: landingColors.expenseSoft },
  { label: 'Deudas', color: landingColors.debt, soft: landingColors.debtSoft },
] as const;
