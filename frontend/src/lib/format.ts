const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

/** Prices are whole Turkish Lira (see ASSUMPTIONS.md) — renders as "₺24.500". */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Renders an ISO 8601 date string as "dd.MM.yyyy". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
