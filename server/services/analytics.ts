import "server-only";
import type { AnalyticsData, DashboardData } from "@/lib/types";
import * as purchases from "@/server/repositories/purchases";
import { getTopMoneyLeaks } from "@/server/services/alternatives";

const pad = (n: number) => String(n).padStart(2, "0");
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

function currentMonthRange(now = new Date()) {
  const key = monthKey(now);
  return { from: `${key}-01`, to: `${key}-31` };
}

export function getDashboard(): DashboardData {
  const range = currentMonthRange();
  const byCategory = purchases.totalsByCategory(range);
  return {
    month: { ...purchases.summarize(range), byCategory },
    allTime: purchases.summarize(),
    leaks: getTopMoneyLeaks(byCategory),
    recent: purchases.listPurchases({ limit: 5 }),
  };
}

export function getAnalytics(monthsBack = 6): AnalyticsData {
  const now = new Date();
  const months = Array.from({ length: monthsBack }, (_, i) => {
    return new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
  });

  const totals = purchases.totalsByMonth(`${monthKey(months[0])}-01`);
  const monthly = months.map((d) => ({
    month: monthKey(d),
    label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    amount: totals.get(monthKey(d)) ?? 0,
  }));

  const active = monthly.filter((m) => m.amount > 0);
  const averagePerMonth = active.length
    ? active.reduce((s, m) => s + m.amount, 0) / active.length
    : 0;

  const impulseSummary = purchases.summarize({ impulseOnly: true });

  return {
    monthly,
    averagePerMonth,
    totalCount: purchases.summarize().count,
    byCategory: purchases.totalsByCategory(),
    topExpenses: purchases.listPurchases({ orderBy: "amount", limit: 5 }),
    impulse: {
      ...impulseSummary,
      items: purchases.listPurchases({ impulseOnly: true, limit: 8 }),
    },
  };
}
