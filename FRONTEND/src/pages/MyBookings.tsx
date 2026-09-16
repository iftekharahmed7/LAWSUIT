import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/apiBase";

type Booking = {
  _id: string;
  lawyer: { name: string; specialization: string; contact?: { phone?: string; email?: string } };
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
};

const statusColor: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-600",
  completed: "bg-blue-100 text-blue-800",
};

export default function MyBookings() {
  const { token, user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  async function cancelBooking(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Couldn't cancel booking");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-3xl text-emerald-950">My bookings</h1>
        <p className="mt-4 text-stone-600">
          <a href="/signin" className="text-amber-600 hover:underline">
            Sign in
          </a>{" "}
          to see your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">My bookings</h1>

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="mt-8 text-stone-400">
          No bookings yet —{" "}
          <a href="/lawyers" className="text-amber-600 hover:underline">
            find a lawyer
          </a>{" "}
          to get started.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-emerald-950">{b.lawyer?.name ?? "Lawyer"}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[b.status]}`}>
                {b.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">{b.lawyer?.specialization}</p>
            <p className="mt-3 text-sm text-stone-700">
              {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              {b.timeSlot}
            </p>
            {b.notes && <p className="mt-2 text-sm text-stone-600">{b.notes}</p>}

            {(b.status === "pending" || b.status === "confirmed") && (
              <button
                onClick={() => cancelBooking(b._id)}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Cancel booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
