import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { BookingStatus, capitalize, formatBookingDate } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";

type Profile = {
  _id: string;
  name: string;
  specialization: string;
  location?: string;
  experienceYears?: number;
  rating?: number;
};

type Booking = {
  _id: string;
  user: { name: string; email: string } | null;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
};

// What a lawyer can do with a booking in each state (the server enforces the same).
const ACTIONS: Partial<Record<BookingStatus, { to: BookingStatus; label: string; confirm?: string }[]>> = {
  pending: [
    { to: "confirmed", label: "Accept" },
    { to: "cancelled", label: "Decline", confirm: "Decline this booking request?" },
  ],
  confirmed: [
    { to: "completed", label: "Mark completed" },
    { to: "cancelled", label: "Cancel", confirm: "Cancel this confirmed consultation? The client will see it as cancelled." },
  ],
};

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl text-emerald-950">{title}</h1>
      <p className="mt-4 text-stone-600">{children}</p>
    </div>
  );
}

function BookingCard({
  booking,
  busy,
  onChange,
}: {
  booking: Booking;
  busy: boolean;
  onChange: (b: Booking, to: BookingStatus, confirm?: string) => void;
}) {
  const actions = ACTIONS[booking.status] ?? [];
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-emerald-950">{formatBookingDate(booking.date)} · {booking.timeSlot}</p>
          <p className="mt-1 text-sm text-stone-600">
            {booking.user ? (
              <>
                {booking.user.name}{" "}
                <a href={`mailto:${booking.user.email}`} className="text-amber-700 hover:underline">
                  {booking.user.email}
                </a>
              </>
            ) : (
              "Deleted account"
            )}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.notes && (
        <p className="mt-3 whitespace-pre-wrap rounded-md bg-stone-50 p-3 text-sm text-stone-700">{booking.notes}</p>
      )}

      {actions.length > 0 && (
        <div className="mt-4 flex gap-2">
          {actions.map((a) => (
            <button
              key={a.to}
              disabled={busy}
              onClick={() => onChange(booking, a.to, a.confirm)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
                a.to === "cancelled"
                  ? "border border-stone-300 text-red-600 hover:bg-red-50"
                  : "bg-emerald-950 text-white hover:bg-emerald-900"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, empty, items, ...rest }: {
  title: string;
  empty: string;
  items: Booking[];
  busyId: string | null;
  onChange: (b: Booking, to: BookingStatus, confirm?: string) => void;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-emerald-950">
        {title} <span className="text-base text-stone-400">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-stone-400">{empty}</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {items.map((b) => (
            <BookingCard key={b._id} booking={b} busy={rest.busyId === b._id} onChange={rest.onChange} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function LawyerDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const isLawyer = user?.role === "lawyer";

  useEffect(() => {
    if (authLoading || !isLawyer) return;
    setLoading(true);
    Promise.all([
      apiFetch<Profile>("/api/lawyer-portal/me", { token }),
      apiFetch<Booking[]>("/api/lawyer-portal/bookings", { token }),
    ])
      .then(([p, b]) => {
        setProfile(p);
        setBookings(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, isLawyer, token]);

  async function changeStatus(b: Booking, to: BookingStatus, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(b._id);
    setError("");
    try {
      await apiFetch(`/api/lawyer-portal/bookings/${b._id}/status`, { method: "PATCH", token, body: { status: to } });
      setBookings((prev) => prev.map((x) => (x._id === b._id ? { ...x, status: to } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the booking.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) return <div className="mx-auto max-w-6xl px-6 py-16 text-stone-400">Loading…</div>;
  if (!user) {
    return (
      <Gate title="Lawyer dashboard">
        <Link to="/signin" className="text-amber-600 hover:underline">Sign in</Link> with your lawyer account to continue.
      </Gate>
    );
  }
  if (!isLawyer) {
    return (
      <Gate title="Not a lawyer account">
        This dashboard is for lawyers listed on LawSuite. If you are one, ask an administrator to link your account to
        your profile.
      </Gate>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled").reverse();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-3xl text-emerald-950">Lawyer dashboard</h1>
      {profile && (
        <p className="mt-1 text-sm text-stone-500">
          {profile.name} · {capitalize(profile.specialization)}
          {profile.location ? ` · ${profile.location}` : ""}
        </p>
      )}

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && !error && <p className="mt-8 text-stone-400">Loading…</p>}

      {!loading && profile && (
        <div className="mt-10 space-y-12">
          <Section
            title="Needs your response"
            empty="No new requests."
            items={pending}
            busyId={busyId}
            onChange={changeStatus}
          />
          <Section
            title="Upcoming consultations"
            empty="Nothing confirmed yet."
            items={upcoming}
            busyId={busyId}
            onChange={changeStatus}
          />
          <section>
            <button onClick={() => setShowPast((s) => !s)} className="font-serif text-xl text-emerald-950 hover:underline">
              Past bookings <span className="text-base text-stone-400">({past.length})</span>{" "}
              <span className="text-sm">{showPast ? "▴" : "▾"}</span>
            </button>
            {showPast && (
              past.length === 0 ? (
                <p className="mt-3 text-sm text-stone-400">No past bookings.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {past.map((b) => (
                    <BookingCard key={b._id} booking={b} busy={false} onChange={changeStatus} />
                  ))}
                </div>
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
