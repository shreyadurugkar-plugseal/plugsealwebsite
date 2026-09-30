"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Alternative,
  Purchase,
  CATEGORIES,
  Category,
  CATEGORY_COLORS,
} from "@/lib/types";

export default function History() {
  const [filtered, setFiltered] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [filterCat, setFilterCat] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .listPurchases({
          category: filterCat === "All" ? undefined : filterCat,
          search: search.trim() || undefined,
        })
        .then(
          (res) => {
            if (cancelled) return;
            setFiltered(res.purchases);
            setTotal(res.total);
            setError(null);
          },
          (e: Error) => !cancelled && setError(e.message)
        );
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filterCat, search, reloadKey]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this purchase?")) return;
    try {
      await api.deletePurchase(id);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="pt-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 flex-1">
          Purchase History
        </h1>
        <span className="text-sm text-gray-500">
          {filtered.length} purchases · {formatCurrency(total)}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search purchases…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-indigo-400"
        />
        <select
          value={filterCat}
          onChange={(e) =>
            setFilterCat(e.target.value as Category | "All")
          }
          className="border border-gray-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-indigo-400"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          No purchases found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((p) => (
            <PurchaseCard
              key={p.id}
              purchase={p}
              isExpanded={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PurchaseCard({
  purchase,
  isExpanded,
  onToggle,
  onDelete,
}: {
  purchase: Purchase;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const color = CATEGORY_COLORS[purchase.category] || "#94a3b8";
  const [fetched, setFetched] = useState<Alternative[] | null>(null);
  const alternatives = isExpanded ? fetched ?? [] : [];

  useEffect(() => {
    if (!isExpanded || fetched) return;
    api.alternatives(purchase.category, purchase.name).then(setFetched, () => setFetched([]));
  }, [isExpanded, fetched, purchase.category, purchase.name]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 truncate">
              {purchase.name}
            </p>
            {purchase.isImpulse && (
              <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                impulse
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {purchase.category} ·{" "}
            {formatDate(purchase.date, true)}
            {purchase.note && ` · ${purchase.note}`}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(purchase.amount)}
          </span>
          <button
            onClick={onToggle}
            aria-label={isExpanded ? "Hide alternatives" : "Show cheaper alternatives"}
            className="text-xs text-indigo-600 hover:underline px-1.5 py-2 sm:p-0"
          >
            {isExpanded ? (
              "Hide"
            ) : (
              <>
                <span className="sm:hidden">💡</span>
                <span className="hidden sm:inline">Alternatives</span>
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete purchase"
            className="text-xs text-red-400 hover:text-red-600 px-1.5 py-2 sm:p-0"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && alternatives.length > 0 && (
        <div className="mt-3 ml-6 bg-green-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-green-800 mb-2">
            💡 Cheaper alternatives for &ldquo;{purchase.name}&rdquo;
          </p>
          {alternatives.map((alt, i) => (
            <div key={i} className="bg-white rounded border border-green-100 p-2.5">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-800 flex-1">
                  {alt.suggestion}
                </p>
                <span className="ml-2 flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  ~{alt.savingPercent}% off
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{alt.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
