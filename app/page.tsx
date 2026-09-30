"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPurchases } from "@/lib/storage";
import { Purchase, Category, CATEGORY_COLORS } from "@/lib/types";
import { getTopMoneyLeaks } from "@/lib/alternatives";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function thisMonthPurchases(purchases: Purchase[]) {
  const now = new Date();
  return purchases.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

export default function Dashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    setPurchases(getPurchases());
  }, []);

  const monthly = thisMonthPurchases(purchases);
  const totalMonth = monthly.reduce((s, p) => s + p.amount, 0);
  const totalAll = purchases.reduce((s, p) => s + p.amount, 0);

  const byCategory = monthly.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const leaks = getTopMoneyLeaks(byCategory as Record<Category, number>);
  const recent = purchases.slice(0, 5);

  return (
    <div className="space-y-6 pt-2">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Spent This Month"
          value={formatCurrency(totalMonth)}
          sub={`${monthly.length} transactions`}
          color="indigo"
        />
        <StatCard
          label="All-Time Spending"
          value={formatCurrency(totalAll)}
          sub={`${purchases.length} total purchases`}
          color="purple"
        />
        <StatCard
          label="Biggest Category"
          value={topCategories[0]?.[0] ?? "—"}
          sub={
            topCategories[0]
              ? formatCurrency(topCategories[0][1]) + " this month"
              : "No data yet"
          }
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            This Month by Category
          </h2>
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-400">
              No purchases yet.{" "}
              <Link href="/add" className="text-indigo-600 underline">
                Add one!
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([cat, amount]) => {
                const pct = totalMonth > 0 ? (amount / totalMonth) * 100 : 0;
                const color =
                  CATEGORY_COLORS[cat as Category] || "#94a3b8";
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{cat}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(amount)}{" "}
                        <span className="text-gray-400 font-normal">
                          ({pct.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Money leaks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            🚨 Where You Might Be Losing Money
          </h2>
          {leaks.length === 0 ? (
            <p className="text-sm text-gray-400">
              Add more purchases to see insights.
            </p>
          ) : (
            <div className="space-y-3">
              {leaks.map((leak) => (
                <div
                  key={leak.category}
                  className="bg-red-50 border border-red-100 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-red-800">
                      {leak.category}
                    </span>
                    <span className="text-sm font-bold text-red-700">
                      {formatCurrency(leak.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">{leak.advice}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent purchases */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Recent Purchases</h2>
          <Link
            href="/history"
            className="text-xs text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">
            No purchases recorded yet.{" "}
            <Link href="/add" className="text-indigo-600 underline">
              Add your first one!
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((p) => (
              <PurchaseRow key={p.id} purchase={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "indigo" | "purple" | "orange";
}) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const color = CATEGORY_COLORS[purchase.category] || "#94a3b8";
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div>
          <p className="text-sm font-medium text-gray-800">{purchase.name}</p>
          <p className="text-xs text-gray-400">
            {purchase.category} ·{" "}
            {new Date(purchase.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-900">
        {formatCurrency(purchase.amount)}
      </span>
    </div>
  );
}
