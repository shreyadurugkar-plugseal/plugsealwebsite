"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency as fmt } from "@/lib/format";
import { AnalyticsData, Category, CATEGORY_COLORS } from "@/lib/types";

const formatCurrency = (n: number) => fmt(n, { whole: true });

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.analytics().then(setData, (e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="pt-2 text-sm text-red-600">Couldn&apos;t load analytics: {error}</p>;
  if (!data) return <p className="pt-2 text-sm text-gray-400">Loading…</p>;

  const monthlyData = data.monthly;
  const pieData = data.byCategory.map((c) => ({ name: c.category, value: c.amount }));
  const avg = data.averagePerMonth;
  const hasData = data.totalCount > 0;
  const impulseTotal = data.impulse.total;
  const topExpenses = data.topExpenses;

  return (
    <div className="pt-2 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Analytics</h1>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat
          label="Avg / Month"
          value={formatCurrency(avg)}
          note="last 6 months"
        />
        <MiniStat
          label="Total Purchases"
          value={String(data.totalCount)}
          note="all time"
        />
        <MiniStat
          label="Impulse Spending"
          value={formatCurrency(impulseTotal)}
          note={`${data.impulse.count} impulse buys`}
        />
        <MiniStat
          label="Categories Used"
          value={String(data.byCategory.length)}
          note="distinct categories"
        />
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          Monthly Spending (Last 6 Months)
        </h2>
        {!hasData ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={50}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v ?? 0)), "Spent"]}
                contentStyle={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Spending by Category (All Time)
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        CATEGORY_COLORS[entry.name as Category] || "#94a3b8"
                      }
                    />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span style={{ fontSize: 11, color: "#374151" }}>{v}</span>
                  )}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), "Total"]}
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Top 5 Biggest Purchases
          </h2>
          {topExpenses.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topExpenses.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-xs font-bold text-gray-400 w-4">
                    {i + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[p.category] || "#94a3b8",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impulse buy detail */}
      {data.impulse.count > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h2 className="font-semibold text-yellow-800 mb-3">
            ⚡ Impulse Purchases You Made
          </h2>
          <p className="text-sm text-yellow-700 mb-3">
            You&apos;ve marked {data.impulse.count} purchases as impulse
            buys, totalling{" "}
            <strong>{formatCurrency(impulseTotal)}</strong>. These are prime
            candidates for cutting back.
          </p>
          <div className="space-y-1.5">
            {data.impulse.items.map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm bg-white rounded border border-yellow-100 px-3 py-1.5"
              >
                <span className="text-gray-700">{p.name}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{note}</p>
    </div>
  );
}
