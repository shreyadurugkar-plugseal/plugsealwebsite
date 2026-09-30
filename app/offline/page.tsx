"use client";

export default function Offline() {
  return (
    <div className="max-w-sm mx-auto pt-16 text-center">
      <p className="text-4xl mb-4" aria-hidden>
        📡
      </p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
      <p className="text-sm text-gray-500 mb-6">
        BudgetSeal needs a connection to load your purchases. Check your signal
        and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}
