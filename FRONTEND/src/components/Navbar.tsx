import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import NavDropdown from "./NavDropdown";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user } = useAuth();
  const { lang, toggleLang, t } = useLang();

  return (
    <header className="bg-emerald-950 text-stone-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold text-amber-400"
        >
          <span aria-hidden>⚖</span> LawSuite
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm lg:flex">
          <Link to="/ask" className="whitespace-nowrap text-stone-200 transition-colors hover:text-amber-400">
            {t("Ask AI", "এআই-কে জিজ্ঞাসা")}
          </Link>
          <NavDropdown
            label={t("Lawyers", "আইনজীবী")}
            items={[
              { to: "/lawyers", label: t("Find a Lawyer", "আইনজীবী খুঁজুন") },
              { to: "/bookings", label: t("My Bookings", "আমার বুকিং") },
            ]}
          />
          <NavDropdown
            label={t("Documents", "ডকুমেন্ট")}
            items={[
              { to: "/templates", label: t("Templates", "টেমপ্লেট") },
              { to: "/documents", label: t("Documents", "ডকুমেন্ট") },
              { to: "/summarise", label: t("Summarise a document", "ডকুমেন্টের সারসংক্ষেপ") },
            ]}
          />
          <NavDropdown
            label={t("Resources", "রিসোর্স")}
            items={[
              { to: "/rights", label: t("Know your rights", "আপনার অধিকার জানুন") },
              { to: "/glossary", label: t("Glossary", "শব্দকোষ") },
              { to: "/news", label: t("Legal news", "আইনি খবর") },
            ]}
          />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={toggleLang}
            aria-label={lang === "en" ? "Switch to Bengali" : "Switch to English"}
            className="text-sm text-stone-200 transition-colors hover:text-amber-400"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>

          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/signin"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-amber-400"
            >
              {t("Sign in", "সাইন ইন")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
