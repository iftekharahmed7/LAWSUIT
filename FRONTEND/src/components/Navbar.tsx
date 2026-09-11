import { Link } from "react-router-dom";

const navLinks = [
  { to: "/ask", label: "Ask AI" },
  { to: "/lawyers", label: "Lawyers" },
  { to: "/templates", label: "Templates" },
  { to: "/rights", label: "Know your rights" },
  { to: "/glossary", label: "Glossary" },
  { to: "/news", label: "Legal news" },
  { to: "/summarise", label: "Summarise a document" },
];

export default function Navbar() {
  return (
    <header className="bg-emerald-950 text-stone-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold text-amber-400"
        >
          <span aria-hidden>⚖</span> LawSuite
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap text-stone-200 transition-colors hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <button className="text-sm text-stone-200 transition-colors hover:text-amber-400">
            বাংলা
          </button>
          <button className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-amber-400">
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
