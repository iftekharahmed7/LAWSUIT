import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Create an account</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-stone-600">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
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
        <div>
          <label className="mb-1 block text-sm text-stone-600">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-500 px-6 py-2.5 font-medium text-emerald-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-600">
        Already have an account?{" "}
        <Link to="/signin" className="text-amber-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
