import * as React from "react";
import { translations, type Language } from "./translations";

const STORAGE_KEY = "lawsuite-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  /** Dot-path translator, e.g. t("nav.home") */
  t: (key: string) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(
  null,
);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "bn") return stored;
  return "en";
}

function resolve(key: string, lang: Language): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = translations[lang];
  for (const part of parts) {
    node = node?.[part];
  }
  return typeof node === "string" ? node : key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(
    getInitialLanguage,
  );

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "en" ? "bn" : "en");
  }, [language, setLanguage]);

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = React.useCallback(
    (key: string) => resolve(key, language),
    [language],
  );

  const value = React.useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}