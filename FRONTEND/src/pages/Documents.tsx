import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";
import TiltCard from "@/components/TiltCard";

type Doc = {
  _id: string;
  title: string;
  category: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
};

const CATEGORIES = ["contract", "affidavit", "petition", "agreement", "notice", "general"];

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadDocs() {
    setLoading(true);
    fetch(`${API_BASE}/api/documents`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setDocs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadDocs, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (content.trim().length < 20) {
      setSubmitError("Content should be at least 20 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content, fileUrl: fileUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Couldn't add document");
      setTitle("");
      setCategory("general");
      setContent("");
      setFileUrl("");
      setShowForm(false);
      loadDocs();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-emerald-950">Documents</h1>
          <p className="mt-2 text-stone-600">
            Reference documents shared by the community - sample notices, agreements, and forms.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-amber-400"
        >
          {showForm ? "Cancel" : "Add a document"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg border border-stone-200 bg-white p-6"
        >
          <div>
            <label className="mb-1 block text-sm text-stone-600">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-600">Content</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the document text here…"
              className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-600">Link to original file (optional)</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-950 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add document"}
          </button>
        </form>
      )}

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error} — check that the backend server is running on port 5000.
        </p>
      )}
      {!loading && !error && docs.length === 0 && (
        <p className="mt-8 text-stone-400">No documents yet - be the first to add one.</p>
      )}

      <div className="mt-8 space-y-4">
        {docs.map((d) => (
          <TiltCard key={d._id} className="block rounded-lg">
            <Link
              to={`/documents/${d._id}`}
              className="block rounded-lg border border-stone-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <h2 className="font-medium text-emerald-950">{d.title}</h2>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                  {d.category}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-stone-600">{d.content}</p>
            </Link>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
