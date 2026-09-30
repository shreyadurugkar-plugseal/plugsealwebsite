export const CATEGORIES = [
  "Food & Dining",
  "Coffee & Drinks",
  "Groceries",
  "Subscriptions",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health & Fitness",
  "Utilities",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Purchase {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  note?: string;
  isImpulse: boolean;
  createdAt: string;
}

export interface NewPurchase {
  name: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
  isImpulse?: boolean;
}

export interface Alternative {
  suggestion: string;
  savingPercent: number;
  tip: string;
}

export interface CategoryTotal {
  category: Category;
  amount: number;
}

export interface MoneyLeak extends CategoryTotal {
  advice: string;
}

export interface DashboardData {
  month: { total: number; count: number; byCategory: CategoryTotal[] };
  allTime: { total: number; count: number };
  leaks: MoneyLeak[];
  recent: Purchase[];
}

export interface AnalyticsData {
  monthly: { month: string; label: string; amount: number }[];
  averagePerMonth: number;
  totalCount: number;
  byCategory: CategoryTotal[];
  topExpenses: Purchase[];
  impulse: { total: number; count: number; items: Purchase[] };
}

export const CATEGORY_COLORS: Record<Category, string> = {
  "Food & Dining": "#f97316",
  "Coffee & Drinks": "#a16207",
  Groceries: "#16a34a",
  Subscriptions: "#7c3aed",
  Transport: "#0284c7",
  Shopping: "#db2777",
  Entertainment: "#dc2626",
  "Health & Fitness": "#059669",
  Utilities: "#6b7280",
  Other: "#94a3b8",
};
