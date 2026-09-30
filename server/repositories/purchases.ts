import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/server/db";
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

function buildWhere(userId: string, filter: PurchaseFilter) {
  const clauses = ["user_id = ?"];
  const params: (string | number)[] = [userId];
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
  return { sql: `WHERE ${clauses.join(" AND ")}`, params };
}

export function listPurchases(userId: string, filter: PurchaseFilter = {}): Purchase[] {
  const where = buildWhere(userId, filter);
  const order =
    filter.orderBy === "amount"
      ? "amount_cents DESC"
      : "date DESC, created_at DESC";
  const limit = filter.limit ? `LIMIT ${Math.floor(filter.limit)}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM purchases ${where.sql} ORDER BY ${order} ${limit}`)
    .all(...where.params) as PurchaseRow[];
  return rows.map(toPurchase);
}

export function getPurchase(userId: string, id: string): Purchase | null {
  const row = getDb()
    .prepare("SELECT * FROM purchases WHERE id = ? AND user_id = ?")
    .get(id, userId) as PurchaseRow | undefined;
  return row ? toPurchase(row) : null;
}

export function insertPurchase(userId: string, input: NewPurchase): Purchase {
  const id = randomUUID();
  getDb().prepare(
    `INSERT INTO purchases (id, user_id, name, amount_cents, category, date, note, is_impulse)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    input.name,
    toCents(input.amount),
    input.category,
    input.date,
    input.note ?? null,
    input.isImpulse ? 1 : 0
  );
  return getPurchase(userId, id)!;
}

export function updatePurchase(
  userId: string,
  id: string,
  patch: Partial<NewPurchase>
): Purchase | null {
  const existing = getPurchase(userId, id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  getDb().prepare(
    `UPDATE purchases
        SET name = ?, amount_cents = ?, category = ?, date = ?, note = ?, is_impulse = ?
      WHERE id = ? AND user_id = ?`
  ).run(
    next.name,
    toCents(next.amount),
    next.category,
    next.date,
    next.note ?? null,
    next.isImpulse ? 1 : 0,
    id,
    userId
  );
  return getPurchase(userId, id);
}

export function deletePurchase(userId: string, id: string): boolean {
  return (
    getDb().prepare("DELETE FROM purchases WHERE id = ? AND user_id = ?").run(id, userId)
      .changes > 0
  );
}

export function summarize(
  userId: string,
  filter: PurchaseFilter = {}
): { total: number; count: number } {
  const where = buildWhere(userId, filter);
  const row = getDb()
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS cents, COUNT(*) AS count
         FROM purchases ${where.sql}`
    )
    .get(...where.params) as { cents: number; count: number };
  return { total: fromCents(row.cents), count: row.count };
}

export function totalsByCategory(
  userId: string,
  filter: PurchaseFilter = {}
): CategoryTotal[] {
  const where = buildWhere(userId, filter);
  const rows = getDb()
    .prepare(
      `SELECT category, SUM(amount_cents) AS cents
         FROM purchases ${where.sql}
        GROUP BY category
        ORDER BY cents DESC`
    )
    .all(...where.params) as { category: Category; cents: number }[];
  return rows.map((r) => ({ category: r.category, amount: fromCents(r.cents) }));
}

export function totalsByMonth(userId: string, fromDate: string): Map<string, number> {
  const where = buildWhere(userId, { from: fromDate });
  const rows = getDb()
    .prepare(
      `SELECT substr(date, 1, 7) AS month, SUM(amount_cents) AS cents
         FROM purchases ${where.sql}
        GROUP BY month`
    )
    .all(...where.params) as { month: string; cents: number }[];
  return new Map(rows.map((r) => [r.month, fromCents(r.cents)]));
}
