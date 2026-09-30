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

export function getDashboard(userId: string): DashboardData {
  const range = currentMonthRange();
  const byCategory = purchases.totalsByCategory(userId, range);
  return {
    month: { ...purchases.summarize(userId, range), byCategory },
    allTime: purchases.summarize(userId),
    leaks: getTopMoneyLeaks(byCategory),
    recent: purchases.listPurchases(userId, { limit: 5 }),
  };
}

export function getAnalytics(userId: string, monthsBack = 6): AnalyticsData {
  const now = new Date();
  const months = Array.from({ length: monthsBack }, (_, i) => {
    return new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
  });

  const totals = purchases.totalsByMonth(userId, `${monthKey(months[0])}-01`);
  const monthly = months.map((d) => ({
    month: monthKey(d),
    label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    amount: totals.get(monthKey(d)) ?? 0,
  }));

  const active = monthly.filter((m) => m.amount > 0);
  const averagePerMonth = active.length
    ? active.reduce((s, m) => s + m.amount, 0) / active.length
    : 0;

  const impulseSummary = purchases.summarize(userId, { impulseOnly: true });

  return {
    monthly,
    averagePerMonth,
    totalCount: purchases.summarize(userId).count,
    byCategory: purchases.totalsByCategory(userId),
    topExpenses: purchases.listPurchases(userId, { orderBy: "amount", limit: 5 }),
    impulse: {
      ...impulseSummary,
      items: purchases.listPurchases(userId, { impulseOnly: true, limit: 8 }),
    },
  };
}
