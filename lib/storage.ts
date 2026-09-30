import { Purchase } from "./types";

const KEY = "budget_purchases";

export function getPurchases(): Purchase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePurchases(purchases: Purchase[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(purchases));
  } catch {
    // storage full or unavailable
  }
}

export function addPurchase(purchase: Purchase): Purchase[] {
  const current = getPurchases();
  const updated = [purchase, ...current];
  savePurchases(updated);
  return updated;
}

export function deletePurchase(id: string): Purchase[] {
  const updated = getPurchases().filter((p) => p.id !== id);
  savePurchases(updated);
  return updated;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
