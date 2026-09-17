export function formatCurrency(value: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`; // safety net for unknown codes
  }
}

export function formatDate(date: string, locale: string): string {
  // "T00:00:00" parses as LOCAL midnight; without it, "2026-09-16" parses as UTC
  // and shifts back a day for users in negative timezones (the classic date bug)
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale);
}