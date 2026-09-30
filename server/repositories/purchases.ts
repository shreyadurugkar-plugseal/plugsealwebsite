import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type { Category, CategoryTotal, NewPurchase, Purchase } from "@/lib/types";

interface PurchaseRow {
  id: string;
  name: string;
  amount_cents: number;
  category: Category;
  date: string;
  note: string | null;
  is_impulse: number;
  created_at: string;
}

export interface PurchaseFilter {
  category?: Category;
  search?: string;
  from?: string;
  to?: string;
  impulseOnly?: boolean;
  orderBy?: "date" | "amount";
  limit?: number;
}

const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (cents: number) => cents / 100;

function toPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    name: row.name,
    amount: fromCents(row.amount_cents),
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    isImpulse: row.is_impulse === 1,
    createdAt: row.created_at,
  };
}

function buildWhere(filter: PurchaseFilter) {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (filter.category) {
    clauses.push("category = ?");
    params.push(filter.category);
  }
  if (filter.search) {
    clauses.push("name LIKE ? ESCAPE '\\'");
    params.push(`%${filter.search.replace(/[\\%_]/g, "\\$&")}%`);
  }
  if (filter.from) {
    clauses.push("date >= ?");
    params.push(filter.from);
  }
  if (filter.to) {
    clauses.push("date <= ?");
    params.push(filter.to);
  }
  if (filter.impulseOnly) clauses.push("is_impulse = 1");
  return {
    sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function listPurchases(filter: PurchaseFilter = {}): Purchase[] {
  const where = buildWhere(filter);
  const order =
    filter.orderBy === "amount"
      ? "amount_cents DESC"
      : "date DESC, created_at DESC";
  const limit = filter.limit ? `LIMIT ${Math.floor(filter.limit)}` : "";
  const rows = db
    .prepare(`SELECT * FROM purchases ${where.sql} ORDER BY ${order} ${limit}`)
    .all(...where.params) as PurchaseRow[];
  return rows.map(toPurchase);
}

export function getPurchase(id: string): Purchase | null {
  const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as
    | PurchaseRow
    | undefined;
  return row ? toPurchase(row) : null;
}

export function insertPurchase(input: NewPurchase): Purchase {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO purchases (id, name, amount_cents, category, date, note, is_impulse)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.name,
    toCents(input.amount),
    input.category,
    input.date,
    input.note ?? null,
    input.isImpulse ? 1 : 0
  );
  return getPurchase(id)!;
}

export function updatePurchase(
  id: string,
  patch: Partial<NewPurchase>
): Purchase | null {
  const existing = getPurchase(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  db.prepare(
    `UPDATE purchases
        SET name = ?, amount_cents = ?, category = ?, date = ?, note = ?, is_impulse = ?
      WHERE id = ?`
  ).run(
    next.name,
    toCents(next.amount),
    next.category,
    next.date,
    next.note ?? null,
    next.isImpulse ? 1 : 0,
    id
  );
  return getPurchase(id);
}

export function deletePurchase(id: string): boolean {
  return db.prepare("DELETE FROM purchases WHERE id = ?").run(id).changes > 0;
}

export function summarize(
  filter: PurchaseFilter = {}
): { total: number; count: number } {
  const where = buildWhere(filter);
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS cents, COUNT(*) AS count
         FROM purchases ${where.sql}`
    )
    .get(...where.params) as { cents: number; count: number };
  return { total: fromCents(row.cents), count: row.count };
}

export function totalsByCategory(
  filter: PurchaseFilter = {}
): CategoryTotal[] {
  const where = buildWhere(filter);
  const rows = db
    .prepare(
      `SELECT category, SUM(amount_cents) AS cents
         FROM purchases ${where.sql}
        GROUP BY category
        ORDER BY cents DESC`
    )
    .all(...where.params) as { category: Category; cents: number }[];
  return rows.map((r) => ({ category: r.category, amount: fromCents(r.cents) }));
}

export function totalsByMonth(fromDate: string): Map<string, number> {
  const rows = db
    .prepare(
      `SELECT substr(date, 1, 7) AS month, SUM(amount_cents) AS cents
         FROM purchases
        WHERE date >= ?
        GROUP BY month`
    )
    .all(fromDate) as { month: string; cents: number }[];
  return new Map(rows.map((r) => [r.month, fromCents(r.cents)]));
}
