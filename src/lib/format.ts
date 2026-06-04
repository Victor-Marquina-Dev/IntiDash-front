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
