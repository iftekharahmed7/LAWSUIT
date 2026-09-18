import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  function handleSignOut() {
    setOpen(false);
    signOut();
    navigate("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-stone-400 px-3 py-1.5 text-sm text-stone-100 transition-colors hover:border-amber-400 hover:text-amber-400"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-emerald-950">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {user.name}
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          <Link
            to="/bookings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-950"
          >
            My Bookings
          </Link>
          {user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-950"
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
