export function formatCurrency(n: number, opts: { whole?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...(opts.whole && { maximumFractionDigits: 0 }),
  }).format(n);
}

// Parse YYYY-MM-DD as a local date; `new Date("2026-09-30")` is UTC midnight
// and shows as the previous day in timezones west of UTC.
export function formatDate(iso: string, withYear = false) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
  });
}

export function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
