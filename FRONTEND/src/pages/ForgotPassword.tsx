import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Forgot password</h1>
      <p className="mt-2 text-stone-600">We'll email you a link to reset it.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-stone-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-500 px-6 py-2.5 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-600">
        <Link to="/signin" className="text-amber-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
