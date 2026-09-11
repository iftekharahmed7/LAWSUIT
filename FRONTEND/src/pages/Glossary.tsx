import { useEffect, useState } from "react";

type Term = { _id: string; term: string; definition: string };

const API_BASE = "http://localhost:5000";

export default function Glossary() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/glossary`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setTerms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Legal glossary</h1>
      <p className="mt-2 text-stone-600">Legal jargon, decoded in plain language.</p>

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}
      {!loading && !error && terms.length === 0 && (
        <p className="mt-8 text-stone-400">No glossary terms yet.</p>
      )}

      <dl className="mt-8 divide-y divide-stone-200">
        {terms.map((t) => (
          <div key={t._id} className="py-4">
            <dt className="font-medium text-emerald-950">{t.term}</dt>
            <dd className="mt-1 text-stone-600">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
