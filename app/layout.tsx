import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "BudgetSeal — Track Your Spending",
  description: "Track spending habits, spot money leaks, and get cheaper alternatives",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 pb-12">{children}</main>
      </body>
    </html>
  );
}
