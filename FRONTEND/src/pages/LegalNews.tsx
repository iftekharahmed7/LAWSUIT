import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/apiBase";

type NewsItem = {
  _id: string;
  title: string;
  summary: string;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedDate: string;
};

export default function LegalNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/legal-news`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setNews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Legal news</h1>
      <p className="mt-2 text-stone-600">What changed in Bangladeshi law recently, explained simply.</p>

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}
      {!loading && !error && news.length === 0 && (
        <p className="mt-8 text-stone-400">No news items yet.</p>
      )}

      <div className="mt-8 space-y-6">
        {news.map((item) => (
          <article key={item._id} className="rounded-lg border border-stone-200 bg-white p-6">
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 font-medium uppercase tracking-wide text-amber-400">
                {item.category}
              </span>
              <span className="text-stone-400">
                {new Date(item.publishedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="mt-3 font-serif text-lg text-emerald-950">{item.title}</h2>
            <p className="mt-2 text-stone-700">{item.summary}</p>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-amber-600 hover:underline"
              >
                Read more{item.sourceName ? ` at ${item.sourceName}` : ""} →
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
