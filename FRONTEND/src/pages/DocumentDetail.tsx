import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";

type Doc = {
  _id: string;
  title: string;
  category: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
};

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/documents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Document not found" : `Server responded ${res.status}`);
        return res.json();
      })
      .then(setDoc)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/documents" className="text-sm text-amber-600 hover:underline">
        ← Back to Documents
      </Link>

      {loading && <p className="mt-8 text-stone-400">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {doc && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="font-serif text-3xl text-emerald-950">{doc.title}</h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
              {doc.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-400">
            Added {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {doc.fileUrl && (
            
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-amber-600 hover:underline"
            >
              View original file →
            </a>
          )}

          <div className="mt-6 whitespace-pre-wrap rounded-lg border border-stone-200 bg-white p-6 text-stone-800">
            {doc.content}
          </div>
        </>
      )}
    </div>
  );
}
