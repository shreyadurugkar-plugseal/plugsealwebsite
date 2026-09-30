"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/add", label: "+ Add Purchase" },
  { href: "/history", label: "History" },
  { href: "/analytics", label: "Analytics" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-indigo-600 text-lg tracking-tight">
          💰 BudgetSeal
        </span>
        <div className="flex gap-1 ml-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                path === l.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
