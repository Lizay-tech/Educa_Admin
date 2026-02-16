"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fr } from "./fr";
import { ht } from "./ht";
import type { Locale, TranslationKeys } from "./index";

const dictionaries: Record<Locale, TranslationKeys> = { fr, ht };

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  setLocale: () => {},
  t: fr,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("educa-lang") as Locale | null;
    if (saved && (saved === "fr" || saved === "ht")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("educa-lang", newLocale);
  }, []);

  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
