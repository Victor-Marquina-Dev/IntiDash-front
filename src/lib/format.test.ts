import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatNullableCurrency,
  formatCompactCurrency,
  formatCurrencyParts,
  formatNotionDate,
  isDateInMonth,
} from './format';

describe('formatCurrency', () => {
  it('formatea con 2 decimales por defecto', () => {
    expect(formatCurrency(1234.56)).toBe('S/ 1,234.56');
  });
  it('formatea cero', () => {
    expect(formatCurrency(0)).toBe('S/ 0.00');
  });
  it('respeta fractionDigits personalizado', () => {
    expect(formatCurrency(1000, 0)).toBe('S/ 1,000');
  });
});

describe('formatNullableCurrency', () => {
  it('devuelve "-" para null', () => {
    expect(formatNullableCurrency(null)).toBe('-');
  });
  it('devuelve "-" para undefined', () => {
    expect(formatNullableCurrency(undefined)).toBe('-');
  });
  it('formatea valor numérico', () => {
    expect(formatNullableCurrency(500)).toBe('S/ 500.00');
  });
  it('usa el parámetro empty personalizado', () => {
    expect(formatNullableCurrency(null, 'N/A')).toBe('N/A');
  });
});

describe('formatCompactCurrency', () => {
  it('formatea miles con k', () => {
    expect(formatCompactCurrency(1500)).toBe('S/1.5k');
  });
  it('formatea millones con M', () => {
    expect(formatCompactCurrency(2_500_000)).toBe('S/2.5M');
  });
  it('formatea valores pequeños sin sufijo', () => {
    expect(formatCompactCurrency(500)).toBe('S/500');
  });
});

describe('formatCurrencyParts', () => {
  it('separa parte entera y decimal correctamente', () => {
    const parts = formatCurrencyParts(1234.56);
    expect(parts.integer).toBe('1,234');
    expect(parts.decimal).toBe('.56');
  });
  it('maneja valores negativos usando el absoluto', () => {
    const parts = formatCurrencyParts(-500.25);
    expect(parts.integer).toBe('500');
    expect(parts.decimal).toBe('.25');
  });
});

describe('formatNotionDate', () => {
  it('devuelve "-" para null', () => {
    expect(formatNotionDate(null)).toBe('-');
  });
  it('devuelve valor empty personalizado para null', () => {
    expect(formatNotionDate(null, 'Sin fecha')).toBe('Sin fecha');
  });
  it('formatea una fecha ISO con hora', () => {
    const result = formatNotionDate('2026-06-11T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('-');
  });
});

describe('isDateInMonth', () => {
  it('devuelve false para null', () => {
    expect(isDateInMonth(null)).toBe(false);
  });
  it('devuelve false para undefined', () => {
    expect(isDateInMonth(undefined)).toBe(false);
  });
  it('detecta fecha ISO en el mes de referencia', () => {
    const ref = new Date('2026-06-15T12:00:00Z');
    expect(isDateInMonth('2026-06-01', ref)).toBe(true);
  });
  it('rechaza fecha de un mes diferente', () => {
    const ref = new Date('2026-06-15T12:00:00Z');
    expect(isDateInMonth('2026-05-31', ref)).toBe(false);
  });
  it('rechaza fecha de un año diferente', () => {
    const ref = new Date('2026-06-15T12:00:00Z');
    expect(isDateInMonth('2025-06-15', ref)).toBe(false);
  });
});
