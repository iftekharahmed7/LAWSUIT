import { useState } from "react";
import { API_BASE } from "@/lib/apiBase";

export default function SummariseDocument() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarise() {
    if (text.trim().length < 30) {
      setError("Paste at least a few sentences of the document.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch(`${API_BASE}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server responded ${res.status}`);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Summarise a document</h1>
      <p className="mt-2 text-stone-600">
        Paste a contract, notice, or agreement and get a plain-language summary.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste the document text here..."
        className="mt-8 w-full rounded-md border border-stone-300 px-4 py-3 focus:border-amber-400 focus:outline-none"
      />

      <button
        onClick={handleSummarise}
        disabled={loading}
        className="mt-4 rounded-md bg-amber-500 px-6 py-2 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Summarising…" : "Summarise"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error} — check that the backend server is running and ANTHROPIC_API_KEY is set.
        </p>
      )}

      {summary && (
        <div className="mt-8 whitespace-pre-wrap rounded-lg border border-stone-200 bg-white p-6 text-stone-800">
          {summary}
        </div>
      )}

      <p className="mt-8 text-xs text-stone-400">
        This summary is general information, not legal advice. It may miss details — always read the full document yourself before signing.
      </p>
    </div>
  );
}
