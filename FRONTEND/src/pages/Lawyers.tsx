import { useEffect, useState } from "react";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  bio: string;
  experienceYears: number;
  location: string;
  rating: number;
};

import { API_BASE } from "@/lib/apiBase";

export default function Lawyers() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/lawyers`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setLawyers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Find a lawyer</h1>
      <p className="mt-2 text-stone-600">
        Browse lawyers by specialization and location.
      </p>

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {lawyers.map((l) => (
          <div
            key={l._id}
            className="rounded-lg border border-stone-200 bg-white p-6"
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
          </div>
        ))}
      </div>
    </div>
  );
}
