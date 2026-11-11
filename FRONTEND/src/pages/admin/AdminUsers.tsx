import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { capitalize } from "@/lib/bookings";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "lawyer" | "admin";
  createdAt: string;
};

const ROLE_STYLES: Record<AdminUser["role"], string> = {
  admin: "bg-emerald-950 text-amber-400",
  lawyer: "bg-amber-100 text-amber-800",
  user: "bg-stone-100 text-stone-600",
};

export default function AdminUsers() {
  const { token, user: me } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      const q = query.trim();
      apiFetch<AdminUser[]>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`, { token })
        .then((data) => !cancelled && setUsers(data))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, token]);

  async function setRole(u: AdminUser, role: "user" | "admin") {
    const question =
      role === "admin"
        ? `Make ${u.name} (${u.email}) an admin? They will be able to manage everything on the site.`
        : `Remove admin access from ${u.name} (${u.email})?`;
    if (!window.confirm(question)) return;

    setBusyId(u._id);
    setError("");
    try {
      await apiFetch(`/api/admin/users/${u._id}/role`, { method: "PATCH", token, body: { role } });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change the role.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full max-w-md rounded-md border border-stone-300 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
      />

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-stone-400">Loading…</p>}
      {!loading && !error && users.length === 0 && (
        <p className="mt-6 text-stone-400">{query ? `No accounts match "${query}".` : "No accounts yet."}</p>
      )}

      {!loading && users.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const isMe = me?.email === u.email;
                return (
                  <tr key={u._id}>
                    <td className="px-4 py-3 text-emerald-950">{u.name}</td>
                    <td className="px-4 py-3 text-stone-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                        {capitalize(u.role)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {isMe ? (
                        <span className="text-xs text-stone-400">You</span>
                      ) : u.role === "lawyer" ? (
                        <span className="text-xs text-stone-400">Linked to a lawyer profile</span>
                      ) : (
                        <button
                          disabled={busyId === u._id}
                          onClick={() => setRole(u, u.role === "admin" ? "user" : "admin")}
                          className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                            u.role === "admin"
                              ? "border border-stone-300 text-red-600 hover:bg-red-50"
                              : "border border-stone-300 text-emerald-950 hover:bg-stone-50"
                          }`}
                        >
                          {u.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
