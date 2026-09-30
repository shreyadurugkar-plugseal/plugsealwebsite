"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { InstallButton } from "@/components/Pwa";

const links = [
  { href: "/", label: "Dashboard", short: "Home" },
  { href: "/add", label: "+ Add Purchase", short: "+ Add" },
  { href: "/history", label: "History", short: "History" },
  { href: "/analytics", label: "Analytics", short: "Stats" },
];

const PUBLIC_PATHS = ["/login", "/offline"];

export default function Nav() {
  const path = usePathname();
  const showLinks = !PUBLIC_PATHS.includes(path);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!showLinks) return;
    let cancelled = false;
    api.me().then((user) => !cancelled && setEmail(user?.email ?? null));
    return () => {
      cancelled = true;
    };
  }, [showLinks]);

  async function logout() {
    await api.logout();
    // Full load drops any of this user's pages held in the client router cache.
    window.location.replace("/login");
  }

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded text-sm font-medium text-center transition-colors ${
      path === href
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
          💰 BudgetSeal
        </Link>
        {showLinks && (
          <div className="hidden sm:flex gap-1 ml-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          <InstallButton />
          {showLinks && email && (
            <>
              <span className="hidden md:inline text-xs text-gray-400 truncate max-w-48">
                {email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
      {showLinks && (
        <div className="sm:hidden grid grid-cols-4 gap-1 px-2 pb-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.short}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
