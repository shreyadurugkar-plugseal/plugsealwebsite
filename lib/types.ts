export type Category =
  | "Food & Dining"
  | "Coffee & Drinks"
  | "Groceries"
  | "Subscriptions"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Health & Fitness"
  | "Utilities"
  | "Other";

export interface Purchase {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // ISO date string
  note?: string;
  isImpulse?: boolean;
}

export interface Alternative {
  suggestion: string;
  estimatedSaving: number;
  savingPercent: number;
  tip: string;
}

export const CATEGORIES: Category[] = [
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
];

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
