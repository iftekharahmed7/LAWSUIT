import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/apiBase";

type Term = { _id: string; term: string; definition: string; category?: string };

export default function Glossary() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const url = query
        ? `${API_BASE}/api/glossary/search?q=${encodeURIComponent(query)}`
        : `${API_BASE}/api/glossary`;

      setLoading(true);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Server responded ${res.status}`);
          return res.json();
        })
        .then(setTerms)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Legal glossary</h1>
      <p className="mt-2 text-stone-600">Legal jargon, decoded in plain language.</p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a term…"
        className="mt-6 w-full rounded-md border border-stone-300 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
      />

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}
      {!loading && !error && terms.length === 0 && (
        <p className="mt-8 text-stone-400">
          {query ? `No terms match "${query}".` : "No glossary terms yet."}
        </p>
      )}

      <dl className="mt-8 divide-y divide-stone-200">
        {terms.map((t) => (
          <div key={t._id} className="py-4">
            <div className="flex items-center gap-2">
              <dt className="font-medium text-emerald-950">{t.term}</dt>
              {t.category && (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                  {t.category}
                </span>
              )}
            </div>
            <dd className="mt-1 text-stone-600">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
