"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // In dev, a caching service worker fights hot reload, so only register in production builds.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  }, []);
  return null;
}

const subscribeNoop = () => () => {};

function useIsStandalone() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => true
  );
}

function useIsIOS() {
  return useSyncExternalStore(
    subscribeNoop,
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    () => false
  );
}

export function InstallButton() {
  const standalone = useIsStandalone();
  const isIOS = useIsIOS();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || (!deferred && !isIOS)) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      setShowIOSHelp((v) => !v);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={install}
        className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-full px-3 py-1 hover:bg-indigo-50"
      >
        Install app
      </button>
      {showIOSHelp && (
        <div
          role="dialog"
          className="absolute right-0 top-full mt-2 w-64 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm text-gray-700"
        >
          <p className="font-semibold text-gray-900 mb-2">Install on iPhone</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Tap <strong>Share</strong> (the square with an up arrow) in
              Safari&apos;s toolbar
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>
            </li>
            <li>
              Tap <strong>Add</strong>
            </li>
          </ol>
          <button
            onClick={() => setShowIOSHelp(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
