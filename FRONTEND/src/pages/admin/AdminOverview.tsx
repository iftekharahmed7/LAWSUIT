import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { AdminTab } from "./AdminDashboard";

type Stats = {
  users: number;
  lawyers: number;
  documents: number;
  glossaryTerms: number;
  newsItems: number;
  bookings: { total: number; pending: number; confirmed: number; cancelled: number; completed: number };
};

interface Props {
  onOpen: (tab: AdminTab, extra?: Record<string, string>) => void;
}

function StatCard({
  label,
  value,
  highlight,
  onClick,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <p className={`font-serif text-3xl ${highlight ? "text-amber-600" : "text-emerald-950"}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{label}</p>
    </>
  );
  const base = "rounded-lg border bg-white p-5 text-left";
  return onClick ? (
    <button
      onClick={onClick}
      className={`${base} transition hover:border-amber-400 hover:shadow-sm ${
        highlight ? "border-amber-300" : "border-stone-200"
      }`}
    >
      {body}
    </button>
  ) : (
    <div className={`${base} border-stone-200`}>{body}</div>
  );
}

export default function AdminOverview({ onOpen }: Props) {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats", { token })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-stone-400">Loading…</p>;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-xl text-emerald-950">Bookings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Waiting for confirmation"
            value={stats.bookings.pending}
            highlight={stats.bookings.pending > 0}
            onClick={() => onOpen("bookings", { status: "pending" })}
          />
          <StatCard label="Confirmed" value={stats.bookings.confirmed} onClick={() => onOpen("bookings", { status: "confirmed" })} />
          <StatCard label="Completed" value={stats.bookings.completed} onClick={() => onOpen("bookings", { status: "completed" })} />
          <StatCard label="All bookings" value={stats.bookings.total} onClick={() => onOpen("bookings")} />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl text-emerald-950">Platform</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Accounts" value={stats.users} onClick={() => onOpen("users")} />
          <StatCard label="Lawyers" value={stats.lawyers} onClick={() => onOpen("lawyers")} />
          <StatCard label="Documents" value={stats.documents} />
          <StatCard label="Glossary terms" value={stats.glossaryTerms} />
          <StatCard label="News items" value={stats.newsItems} />
        </div>
      </section>
    </div>
  );
}
