import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { API_BASE } from "@/lib/apiBase";
import Markdown from "@/components/Markdown";

type Message = { role: "user" | "assistant"; content: string };

const MAX_QUESTION_CHARS = 2000;

export default function AskAI() {
  const { token } = useAuth();
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;

    const history = messages; // everything said before this question
    setMessages([...history, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`; // signed-in users get a higher limit

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({ question, language: lang, history }),
        });
      } catch {
        throw new Error(t("Couldn't reach the server. Please check your connection and try again.", "সার্ভারের সাথে সংযোগ করা যায়নি। আপনার ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।"));
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");

      setMessages([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: data.answer || "No answer was returned." },
      ]);
    } catch (err) {
      // Put the question back so nothing is lost and it can be resent.
      setMessages(history);
      setInput(question);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-emerald-950">{t("Ask a legal question", "আইনি প্রশ্ন জিজ্ঞাসা করুন")}</h1>
          <p className="mt-2 text-stone-600">{t("Answers are general information, not legal advice.", "উত্তরগুলো সাধারণ তথ্য, আইনি পরামর্শ নয়।")}</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError("");
            }}
            disabled={loading}
            className="shrink-0 text-sm text-stone-500 underline hover:text-stone-700 disabled:opacity-50"
          >
            {t("New conversation", "নতুন কথোপকথন")}
          </button>
        )}
      </div>

      <div className="mt-8 flex max-h-[60vh] min-h-[300px] flex-col gap-4 overflow-y-auto rounded-lg border border-stone-200 bg-white p-6">
        {messages.length === 0 && !loading && (
          <p className="text-stone-400">{t("Your conversation will appear here.", "আপনার কথোপকথন এখানে দেখা যাবে।")}</p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-emerald-950 px-4 py-2 text-stone-100"
            >
              {m.content}
            </div>
          ) : (
            <div key={i} className="mr-auto max-w-[90%] rounded-lg bg-stone-100 px-4 py-3 text-stone-800">
              <Markdown>{m.content}</Markdown>
            </div>
          )
        )}
        {loading && <p className="text-stone-400">{t("Thinking…", "ভাবছি…")}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          maxLength={MAX_QUESTION_CHARS}
          placeholder={t("e.g. My landlord won't return my deposit, what can I do?", "যেমন: বাড়িওয়ালা আমার জামানত ফেরত দিচ্ছেন না, আমি কী করতে পারি?")}
          className="flex-1 rounded-md border border-stone-300 px-4 py-2 focus:border-amber-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-md bg-amber-500 px-6 py-2 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {t("Send", "পাঠান")}
        </button>
      </div>
    </div>
  );
}
