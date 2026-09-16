import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/apiBase";
import BookingModal from "@/components/BookingModal";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  bio: string;
  experienceYears: number;
  location: string;
  rating: number;
};

const SPECIALIZATIONS = ["family", "property", "criminal", "labor", "consumer", "corporate", "general"];

export default function Lawyers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLawyer, setBookingLawyer] = useState<Lawyer | null>(null);
  const [justBooked, setJustBooked] = useState(false);

  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (specialization) params.set("specialization", specialization);
      if (location) params.set("location", location);
      if (name) params.set("name", name);

      setLoading(true);
      fetch(`${API_BASE}/api/lawyers/search?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Server responded ${res.status}`);
          return res.json();
        })
        .then(setLawyers)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [specialization, location, name]);

  function handleBookClick(lawyer: Lawyer) {
    if (!user) {
      navigate("/signin");
      return;
    }
    setBookingLawyer(lawyer);
  }

  function handleBooked() {
    setBookingLawyer(null);
    setJustBooked(true);
    setTimeout(() => setJustBooked(false), 4000);
  }

  function clearFilters() {
    setSpecialization("");
    setLocation("");
    setName("");
  }

  const hasFilters = specialization || location || name;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Find a lawyer</h1>
      <p className="mt-2 text-stone-600">
        Browse lawyers by specialization and location.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs text-stone-500">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
          >
            <option value="">All</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dhaka"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by name"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-stone-500 underline hover:text-stone-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {justBooked && (
        <p className="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Booking request sent! Check{" "}
          <a href="/bookings" className="underline">
            My Bookings
          </a>{" "}
          for status updates.
        </p>
      )}

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}
      {!loading && !error && lawyers.length === 0 && (
        <p className="mt-8 text-stone-400">No lawyers match those filters.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {lawyers.map((l) => (
          <div
            key={l._id}
            className="flex flex-col rounded-lg border border-stone-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-emerald-950">{l.name}</h2>
              <span className="text-sm text-amber-500">★ {l.rating}</span>
            </div>
            <p className="mt-1 text-sm tracking-wide text-stone-400">
              {l.specialization}
            </p>
            <p className="mt-3 text-sm text-stone-600">{l.bio}</p>
            <p className="mt-3 text-sm text-stone-500">
              {l.experienceYears} years · {l.location}
            </p>
            <button
              onClick={() => handleBookClick(l)}
              className="mt-4 self-start rounded-md bg-emerald-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-900"
            >
              Book consultation
            </button>
          </div>
        ))}
      </div>

      {bookingLawyer && (
        <BookingModal
          lawyerId={bookingLawyer._id}
          lawyerName={bookingLawyer.name}
          onClose={() => setBookingLawyer(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}
