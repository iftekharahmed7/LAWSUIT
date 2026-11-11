import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminOverview from "./AdminOverview";
import AdminBookings from "./AdminBookings";
import AdminUsers from "./AdminUsers";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "users", label: "Users" },
] as const;

export type AdminTab = (typeof TABS)[number]["id"];

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl text-emerald-950">{title}</h1>
      <p className="mt-4 text-stone-600">{children}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [params, setParams] = useSearchParams();

  const requested = params.get("tab");
  const tab: AdminTab = TABS.some((t) => t.id === requested) ? (requested as AdminTab) : "overview";

  function openTab(id: AdminTab, extra: Record<string, string> = {}) {
    setParams({ tab: id, ...extra });
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-stone-400">Loading…</div>;
  }
  if (!user) {
    return (
      <Gate title="Admin dashboard">
        <Link to="/signin" className="text-amber-600 hover:underline">Sign in</Link> with an admin account to continue.
      </Gate>
    );
  }
  // The server checks the role on every request too; this just avoids
  // showing an empty dashboard to someone who can't use it.
  if (user.role !== "admin") {
    return (
      <Gate title="Not authorized">
        This page is only available to administrators.{" "}
        <Link to="/" className="text-amber-600 hover:underline">Back to home</Link>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-3xl text-emerald-950">Admin dashboard</h1>
      <p className="mt-1 text-sm text-stone-500">Signed in as {user.email}</p>

      <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => openTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-amber-500 text-emerald-950"
                : "border-transparent text-stone-500 hover:text-emerald-950"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && <AdminOverview onOpen={openTab} />}
        {tab === "bookings" && <AdminBookings />}
        {tab === "users" && <AdminUsers />}
      </div>
    </div>
  );
}
