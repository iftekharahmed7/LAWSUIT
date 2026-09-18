import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavDropdown from "./NavDropdown";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user } = useAuth();

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
            Ask AI
          </Link>
          <NavDropdown
            label="Lawyers"
            items={[
              { to: "/lawyers", label: "Find a Lawyer" },
              { to: "/bookings", label: "My Bookings" },
            ]}
          />
          <NavDropdown
            label="Documents"
            items={[
              { to: "/templates", label: "Templates" },
              { to: "/documents", label: "Documents" },
              { to: "/summarise", label: "Summarise a document" },
            ]}
          />
          <NavDropdown
            label="Resources"
            items={[
              { to: "/rights", label: "Know your rights" },
              { to: "/glossary", label: "Glossary" },
              { to: "/news", label: "Legal news" },
            ]}
          />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <button className="text-sm text-stone-200 transition-colors hover:text-amber-400">
            বাংলা
          </button>

          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/signin"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-amber-400"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
