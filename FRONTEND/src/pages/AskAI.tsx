import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const API_BASE = "http://localhost:5000";

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const reply = data.reply || data.message || JSON.stringify(data);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong talking to the assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">
        Ask a legal question
      </h1>
      <p className="mt-2 text-stone-600">
        Answers are general information, not legal advice.
      </p>

      <div className="mt-8 min-h-[300px] space-y-4 rounded-lg border border-stone-200 bg-white p-6">
        {messages.length === 0 && (
          <p className="text-stone-400">Your conversation will appear here.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-lg bg-emerald-950 px-4 py-2 text-stone-100"
                : "mr-auto max-w-[80%] rounded-lg bg-stone-100 px-4 py-2 text-stone-800"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-stone-400">Thinking…</p>}
        {error && (
          <p className="text-sm text-red-600">
            {error} — check that the backend server is running on port
            5000, and that ANTHROPIC_API_KEY is set in your .env.
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="e.g. My landlord won't return my deposit, what can I do?"
          className="flex-1 rounded-md border border-stone-300 px-4 py-2 focus:border-amber-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-md bg-amber-500 px-6 py-2 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
