import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { API_BASE } from "@/lib/apiBase";
import Markdown from "@/components/Markdown";

export default function SummariseDocument() {
  const { token } = useAuth();
  const { lang, t } = useLang();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarise() {
    if (text.trim().length < 30) {
      setError(t("Paste at least a few sentences of the document.", "ডকুমেন্টের অন্তত কয়েকটি বাক্য পেস্ট করুন।"));
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`; // signed-in users get a higher limit

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/summarize`, {
          method: "POST",
          headers,
          body: JSON.stringify({ text, language: lang }),
        });
      } catch {
        throw new Error(t("Couldn't reach the server. Please check your connection and try again.", "সার্ভারের সাথে সংযোগ করা যায়নি। আপনার ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।"));
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">{t("Summarise a document", "ডকুমেন্টের সারসংক্ষেপ")}</h1>
      <p className="mt-2 text-stone-600">
        {t("Paste a contract, notice, or agreement and get a plain-language summary.", "চুক্তি, নোটিশ বা সম্মতিপত্র পেস্ট করুন এবং সহজ ভাষায় সারসংক্ষেপ পান।")}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={t("Paste the document text here...", "ডকুমেন্টের লেখা এখানে পেস্ট করুন...")}
        className="mt-8 w-full rounded-md border border-stone-300 px-4 py-3 focus:border-amber-400 focus:outline-none"
      />

      <button
        onClick={handleSummarise}
        disabled={loading}
        className="mt-4 rounded-md bg-amber-500 px-6 py-2 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? t("Summarising…", "সারসংক্ষেপ তৈরি হচ্ছে…") : t("Summarise", "সারসংক্ষেপ করুন")}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-stone-800">
          <Markdown>{summary}</Markdown>
        </div>
      )}

      <p className="mt-8 text-xs text-stone-400">
        {t("This summary is general information, not legal advice. It may miss details — always read the full document yourself before signing.", "এই সারসংক্ষেপ সাধারণ তথ্য, আইনি পরামর্শ নয়। কিছু বিষয় বাদ পড়তে পারে — স্বাক্ষরের আগে সম্পূর্ণ ডকুমেন্টটি নিজে পড়ুন।")}
      </p>
    </div>
  );
}
