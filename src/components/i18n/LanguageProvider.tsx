"use client";

import * as React from "react";
import { DEFAULT_LANGUAGE, LANGUAGE_ORDER, resolveMessage, type Language } from "@/lib/i18n/messages";

const STORAGE_KEY = "inferno_language";

interface I18nContextValue {
  language: Language;
  cycleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (path: string) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "EN" || value === "RU" || value === "KZ";
}

function htmlLang(language: Language): string {
  if (language === "RU") return "ru";
  if (language === "KZ") return "kk";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(DEFAULT_LANGUAGE);

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const cycleLanguage = React.useCallback(() => {
    const idx = LANGUAGE_ORDER.indexOf(language);
    const next = LANGUAGE_ORDER[(idx + 1) % LANGUAGE_ORDER.length];
    setLanguage(next);
  }, [language, setLanguage]);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) {
      setLanguageState(saved);
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = htmlLang(language);
  }, [language]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!isLanguage(event.newValue)) return;
      setLanguageState(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      cycleLanguage,
      setLanguage,
      t: (path) => resolveMessage(language, path),
    }),
    [cycleLanguage, language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return ctx;
}
