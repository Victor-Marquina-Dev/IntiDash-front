export function formatNotionDate(fecha: string | null, empty = '-'): string {
  if (!fecha) return empty;
  const d = new Date(fecha);
  if (d.getUTCSeconds() === 59) {
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(value: number, fractionDigits = 2): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatIntegerCurrency(value: number): string {
  return formatCurrency(value, 0);
}

export function formatNullableCurrency(value: number | null | undefined, empty = '-', fractionDigits = 2): string {
  return value != null ? formatCurrency(value, fractionDigits) : empty;
}

export function formatCompactCurrency(value: number, fractionDigits = 1): string {
  if (value >= 1_000_000) return `S/${(value / 1_000_000).toFixed(fractionDigits)}M`;
  if (value >= 1_000) return `S/${(value / 1_000).toFixed(fractionDigits)}k`;
  return `S/${Math.round(value).toLocaleString('es-PE')}`;
}

export function formatCurrencyParts(value: number): { integer: string; decimal: string } {
  const absValue = Math.abs(value);
  return {
    integer: Math.floor(absValue).toLocaleString('es-PE'),
    decimal: (absValue % 1).toFixed(2).slice(1),
  };
}

// Las fechas se guardan como medianoche UTC del día elegido; usar la parte
// YYYY-MM-DD del string evita que en zonas UTC-negativas se corran un día atrás.
function parseDateParts(fecha: string): { y: number; m: number; d: number } | null {
  const [datePart] = fecha.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return { y, m, d };
}

export function formatShortDate(fecha: string | null, empty = '-'): string {
  if (!fecha) return empty;
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const p = parseDateParts(fecha);
  if (!p) return empty;
  return `${p.d} ${meses[p.m - 1]}`;
}

export function formatRelativeDate(fecha: string | null, empty = '-'): string {
  if (!fecha) return empty;
  const p = parseDateParts(fecha);
  if (!p) return empty;
  const d = new Date(p.y, p.m - 1, p.d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff >= 2 && diff <= 6) return `hace ${diff}d`;
  return formatShortDate(fecha, empty);
}

export function isDateInMonth(fecha: string | null | undefined, referenceDate = new Date()): boolean {
  if (!fecha) return false;
  const [datePart] = fecha.split('T');
  const [yearText, monthText] = datePart.split('-');
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.getFullYear() === referenceDate.getFullYear() && parsed.getMonth() === referenceDate.getMonth();
  }

  return year === referenceDate.getFullYear() && month === referenceDate.getMonth() + 1;
}
