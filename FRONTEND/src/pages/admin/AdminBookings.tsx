import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { BOOKING_STATUSES, BookingStatus, NEXT_ACTIONS, capitalize, formatBookingDate } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";

type AdminBooking = {
  _id: string;
  user: { name: string; email: string } | null;
  lawyer: { name: string; specialization: string; location?: string } | null;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
};

export default function AdminBookings() {
  const { token } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get("status") || "";
  const status = BOOKING_STATUSES.includes(requested as BookingStatus) ? requested : "";

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch<AdminBooking[]>(`/api/admin/bookings${status ? `?status=${status}` : ""}`, { token })
      .then((data) => !cancelled && setBookings(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, token]);

  function setFilter(next: string) {
    setParams(next ? { tab: "bookings", status: next } : { tab: "bookings" });
  }

  async function changeStatus(b: AdminBooking, next: BookingStatus) {
    if (
      next === "cancelled" &&
      !window.confirm(`Cancel ${b.user?.name ?? "this client"}'s booking with ${b.lawyer?.name ?? "this lawyer"}?`)
    ) {
      return;
    }
    setBusyId(b._id);
    setError("");
    try {
      await apiFetch(`/api/bookings/${b._id}/status`, { method: "PATCH", token, body: { status: next } });
      setBookings((prev) =>
        status && status !== next
          ? prev.filter((x) => x._id !== b._id) // no longer matches the filter
          : prev.map((x) => (x._id === b._id ? { ...x, status: next } : x))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the booking.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["", ...BOOKING_STATUSES].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm ${
              status === s ? "bg-emerald-950 text-white" : "border border-stone-300 text-stone-600 hover:border-stone-400"
            }`}
          >
            {s ? capitalize(s) : "All"}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-stone-400">Loading…</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="mt-6 text-stone-400">{status ? `No ${status} bookings.` : "No bookings yet."}</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Lawyer</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <tr key={b._id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="text-emerald-950">{formatBookingDate(b.date)}</p>
                    <p className="text-stone-500">{b.timeSlot}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-emerald-950">{b.user?.name ?? "Deleted account"}</p>
                    {b.user && <p className="text-stone-500">{b.user.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-emerald-950">{b.lawyer?.name ?? "Removed lawyer"}</p>
                    {b.lawyer && <p className="text-stone-500">{capitalize(b.lawyer.specialization)}</p>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-stone-600">
                    {b.notes ? <p className="line-clamp-3" title={b.notes}>{b.notes}</p> : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      {(NEXT_ACTIONS[b.status] ?? []).map((a) => (
                        <button
                          key={a.to}
                          disabled={busyId === b._id}
                          onClick={() => changeStatus(b, a.to)}
                          className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                            a.to === "cancelled"
                              ? "border border-stone-300 text-red-600 hover:bg-red-50"
                              : "bg-emerald-950 text-white hover:bg-emerald-900"
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                      {!NEXT_ACTIONS[b.status] && <span className="text-xs text-stone-400">No actions</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
