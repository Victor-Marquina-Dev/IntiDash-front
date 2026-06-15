export const KPI_DARK = {
  outerBg:   '#1E2025',
  innerBg:   '#17191F',
  border:    'rgba(255,255,255,0.07)',
  borderHov: 'rgba(255,255,255,0.14)',
  label:     'rgba(255,255,255,0.38)',
  lineGrad:  'rgba(255,255,255,0.07)',
  amtGrad:   'linear-gradient(to right, #F0EDE8, #F0EDE8)',
  amtGlow:   [] as string[],
  subtitle:  'rgba(255,255,255,0.32)',
  halo:      'transparent',
  ray:       'transparent',
  badgePos:  { bg: 'rgba(134,198,107,0.12)', border: 'rgba(134,198,107,0.25)', color: '#86C66B' },
  badgeNeg:  { bg: 'rgba(208,89,89,0.12)',   border: 'rgba(208,89,89,0.25)',   color: '#D05959' },
  badgeNeu:  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.42)' },
};

export const KPI_LIGHT = {
  outerBg:   'linear-gradient(135deg, #C6AC8F, #EAE0D5 65%)',
  innerBg:   'rgba(234,224,213,0.97)',
  border:    'rgba(198,172,143,0.60)',
  borderHov: 'rgba(94,80,63,0.55)',
  label:     '#5E503F',
  lineGrad:  'linear-gradient(to right, rgba(94,80,63,0.28), transparent)',
  amtGrad:   'linear-gradient(to right, #2C2217, #2C2217)',
  amtGlow:   ['0 0 8px rgba(94,80,63,0.22)', '0 0 1px rgba(94,80,63,0.05)', '0 0 8px rgba(94,80,63,0.22)'] as string[],
  subtitle:  'rgba(94,80,63,0.75)',
  halo:      'rgba(94,80,63,0.09)',
  ray:       'rgba(94,80,63,0.04)',
  badgePos:  { bg: 'rgba(60,120,40,0.10)',  border: 'rgba(60,120,40,0.22)',  color: '#3C7828' },
  badgeNeg:  { bg: 'rgba(180,50,50,0.10)',  border: 'rgba(180,50,50,0.22)',  color: '#B43232' },
  badgeNeu:  { bg: 'rgba(94,80,63,0.08)',   border: 'rgba(94,80,63,0.18)',   color: '#5E503F' },
};

export type KpiPalette = typeof KPI_DARK;

export function getKpiPalette(darkMode: boolean): KpiPalette {
  return darkMode ? KPI_DARK : KPI_LIGHT;
}
