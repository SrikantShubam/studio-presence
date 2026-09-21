"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { DashboardView } from "./types";

const views: DashboardView[] = ["overview", "enquiries", "analytics", "website", "calculator", "card", "settings", "integrations"];
const aliases: Record<string, DashboardView> = { leads: "enquiries", sections: "website", estimate: "calculator" };

function subscribeNavigation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener("studio-navigation", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("studio-navigation", onChange);
  };
}
function navigationSnapshot(): DashboardView {
  const hash = window.location.hash.slice(1);
  return aliases[hash] || views.find((view) => view === hash) || "overview";
}
const serverNavigationSnapshot = (): DashboardView => "overview";
export function useDashboardView() {
  return useSyncExternalStore(subscribeNavigation, navigationSnapshot, serverNavigationSnapshot);
}
export function navigateDashboard(view: DashboardView) {
  if (window.location.hash !== `#${view}`) {
    window.history.pushState(null, "", `#${view}`);
    window.dispatchEvent(new Event("studio-navigation"));
  }
}

function subscribeTheme(onChange: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (event.key === "studio-theme") {
      document.documentElement.classList.toggle("dark", event.newValue === "dark");
      onChange();
    }
  };
  window.addEventListener("storage", storageChanged);
  window.addEventListener("studio-theme", onChange);
  return () => { window.removeEventListener("storage", storageChanged); window.removeEventListener("studio-theme", onChange); };
}
const themeSnapshot = () => document.documentElement.classList.contains("dark");
const serverThemeSnapshot = () => false;
export function useStudioTheme() {
  const dark = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot);
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", localStorage.getItem("studio-theme") === "dark");
      window.dispatchEvent(new Event("studio-theme"));
    } catch { /* The theme remains usable without persistent storage. */ }
  }, []);
  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("studio-theme", next ? "dark" : "light"); } catch { /* Persistence is optional. */ }
    window.dispatchEvent(new Event("studio-theme"));
  }
  return { dark, toggleTheme };
}

const subscribeOrigin = () => () => {};
const cardSnapshot = () => `${window.location.origin}/card`;
const serverCardSnapshot = () => "/card";
export function useCardURL() {
  return useSyncExternalStore(subscribeOrigin, cardSnapshot, serverCardSnapshot);
}
