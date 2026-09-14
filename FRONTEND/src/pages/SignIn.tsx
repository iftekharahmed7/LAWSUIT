import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Sign in</h1>
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
        <div>
          <label className="mb-1 block text-sm text-stone-600">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-500 px-6 py-2.5 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-amber-600 hover:underline">
          Forgot password?
        </Link>
        <Link to="/signup" className="text-stone-600 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
