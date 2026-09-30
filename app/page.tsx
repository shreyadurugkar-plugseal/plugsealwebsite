"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { DashboardData, Purchase, CATEGORY_COLORS } from "@/lib/types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard().then(setData, (e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="pt-2 text-sm text-red-600">Couldn&apos;t load dashboard: {error}</p>;
  if (!data) return <p className="pt-2 text-sm text-gray-400">Loading…</p>;

  const totalMonth = data.month.total;
  const topCategories = data.month.byCategory.slice(0, 5);
  const { leaks, recent } = data;

  return (
    <div className="space-y-6 pt-2">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Spent This Month"
          value={formatCurrency(totalMonth)}
          sub={`${data.month.count} transactions`}
          color="indigo"
        />
        <StatCard
          label="All-Time Spending"
          value={formatCurrency(data.allTime.total)}
          sub={`${data.allTime.count} total purchases`}
          color="purple"
        />
        <StatCard
          label="Biggest Category"
          value={topCategories[0]?.category ?? "—"}
          sub={
            topCategories[0]
              ? formatCurrency(topCategories[0].amount) + " this month"
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
              {topCategories.map(({ category: cat, amount }) => {
                const pct = totalMonth > 0 ? (amount / totalMonth) * 100 : 0;
                const color = CATEGORY_COLORS[cat];
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
            {formatDate(purchase.date)}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-900">
        {formatCurrency(purchase.amount)}
      </span>
    </div>
  );
}
