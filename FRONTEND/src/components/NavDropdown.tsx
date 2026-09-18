import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Item {
  to: string;
  label: string;
}

interface Props {
  label: string;
  items: Item[];
}

export default function NavDropdown({ label, items }: Props) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap text-stone-200 transition-colors hover:text-amber-400"
      >
        {label}
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
