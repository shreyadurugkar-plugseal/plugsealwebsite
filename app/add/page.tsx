"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPurchase, generateId } from "@/lib/storage";
import { CATEGORIES, Category } from "@/lib/types";
import { getAlternatives } from "@/lib/alternatives";

export default function AddPurchase() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food & Dining");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isImpulse, setIsImpulse] = useState(false);
  const [saved, setSaved] = useState(false);

  const alternatives = name.trim()
    ? getAlternatives(category, name)
    : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    addPurchase({
      id: generateId(),
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim() || undefined,
      isImpulse,
    });
    setSaved(true);
    setTimeout(() => router.push("/history"), 1000);
  }

  return (
    <div className="max-w-lg mx-auto pt-2">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Add Purchase</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <Field label="What did you buy?">
          <input
            required
            type="text"
            placeholder="e.g. Starbucks latte, Netflix subscription…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount ($)">
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Note (optional)">
          <input
            type="text"
            placeholder="Any extra context…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isImpulse}
            onChange={(e) => setIsImpulse(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <span className="text-sm text-gray-700">
            This was an impulse / unplanned purchase
          </span>
        </label>

        <button
          type="submit"
          disabled={saved}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saved ? "✓ Saved! Redirecting…" : "Save Purchase"}
        </button>
      </form>

      {/* Cheaper alternatives panel */}
      {alternatives.length > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="font-semibold text-green-800 mb-3">
            💡 Cheaper Alternatives
          </h2>
          <div className="space-y-3">
            {alternatives.map((alt, i) => (
              <div key={i} className="bg-white rounded-lg border border-green-100 p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-gray-800">
                    {alt.suggestion}
                  </p>
                  <span className="ml-3 flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Save ~{alt.savingPercent}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">{alt.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
