import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/lib/apiBase";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setMessage(data.message);
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16">
        <h1 className="font-serif text-3xl text-emerald-950">Reset password</h1>
        <p className="mt-4 text-stone-600">
          This link is missing its reset token. Please use the link from your email, or{" "}
          <Link to="/forgot-password" className="text-amber-600 hover:underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Reset password</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-stone-600">New password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-600">Confirm new password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
