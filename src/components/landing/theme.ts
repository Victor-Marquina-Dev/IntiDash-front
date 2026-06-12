export const landingColors = {
  ink: '#171C1A',
  muted: '#5A6661',
  softText: '#8B9690',
  paper: '#FAF8F4',
  band: '#F4F1EA',
  dark: '#0A2E22',
  income: '#8FA88F',
  expense: '#CF9C9C',
  debt: '#D9A86C',
  incomeSoft: '#EEF4EE',
  expenseSoft: '#F7EEEE',
  debtSoft: '#FBF1E4',
};

export const financeSeries = [
  { label: 'Ingresos', color: landingColors.income, soft: landingColors.incomeSoft },
  { label: 'Gastos', color: landingColors.expense, soft: landingColors.expenseSoft },
  { label: 'Deudas', color: landingColors.debt, soft: landingColors.debtSoft },
] as const;
