import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "bn";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  /** Pick the English or Bengali version of a string. */
  t: (en: string, bn: string) => string;
}

const STORAGE_KEY = "lawsuite_lang";
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable (private mode etc.) - the choice just won't persist
    }
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "bn" : "en"));
  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
