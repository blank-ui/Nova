"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, SUPPORTED_LANGUAGES, LanguageOption, getTranslation } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  languages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = (sessionStorage.getItem("nova-locale") || localStorage.getItem("nova-locale")) as Locale | null;
        if (stored && ["en", "hi", "es", "fr", "de", "ja"].includes(stored)) {
          return stored;
        }
      } catch {}
    }
    return "en";
  });

  // Sync document language attribute with active locale
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    try {
      sessionStorage.setItem("nova-locale", newLocale);
      localStorage.setItem("nova-locale", newLocale);
      document.cookie = `nova-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch {}
  }

  function t(key: string, fallback?: string): string {
    return getTranslation(locale, key, fallback);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function T({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useLanguage();
  return <>{t(k, fallback)}</>;
}
