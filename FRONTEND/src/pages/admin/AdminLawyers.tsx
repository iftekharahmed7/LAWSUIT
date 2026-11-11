import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { capitalize } from "@/lib/bookings";

const SPECIALIZATIONS = ["family", "property", "criminal", "labor", "consumer", "corporate", "general"];

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  bio?: string;
  experienceYears?: number;
  location?: string;
  rating?: number;
  contact?: { phone?: string; email?: string };
  user?: { _id: string; name: string; email: string } | null;
};

type FormValues = {
  name: string;
  specialization: string;
  location: string;
  experienceYears: string;
  rating: string;
  bio: string;
  phone: string;
  email: string;
};

const EMPTY_FORM: FormValues = {
  name: "",
  specialization: "general",
  location: "",
  experienceYears: "0",
  rating: "0",
  bio: "",
  phone: "",
  email: "",
};

function toForm(l: Lawyer): FormValues {
  return {
    name: l.name,
    specialization: l.specialization,
    location: l.location ?? "",
    experienceYears: String(l.experienceYears ?? 0),
    rating: String(l.rating ?? 0),
    bio: l.bio ?? "",
    phone: l.contact?.phone ?? "",
    email: l.contact?.email ?? "",
  };
}

function toPayload(v: FormValues) {
  return {
    name: v.name.trim(),
    specialization: v.specialization,
    location: v.location.trim(),
    experienceYears: Number(v.experienceYears) || 0,
    rating: Number(v.rating) || 0,
    bio: v.bio.trim(),
    contact: { phone: v.phone.trim(), email: v.email.trim() },
  };
}

const inputClass =
  "w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none";

function LawyerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: FormValues;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<FormValues>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-amber-300 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-stone-600">
          Name *
          <input value={v.name} onChange={set("name")} required maxLength={100} className={`mt-1 ${inputClass}`} />
        </label>
        <label className="block text-sm text-stone-600">
          Specialization
          <select value={v.specialization} onChange={set("specialization")} className={`mt-1 ${inputClass}`}>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-stone-600">
          Location
          <input value={v.location} onChange={set("location")} placeholder="e.g. Dhanmondi, Dhaka" className={`mt-1 ${inputClass}`} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-stone-600">
            Years of experience
            <input type="number" min={0} max={70} value={v.experienceYears} onChange={set("experienceYears")} className={`mt-1 ${inputClass}`} />
          </label>
          <label className="block text-sm text-stone-600">
            Rating (0–5)
            <input type="number" min={0} max={5} step={0.1} value={v.rating} onChange={set("rating")} className={`mt-1 ${inputClass}`} />
          </label>
        </div>
        <label className="block text-sm text-stone-600">
          Contact phone
          <input value={v.phone} onChange={set("phone")} placeholder="+8801…" className={`mt-1 ${inputClass}`} />
        </label>
        <label className="block text-sm text-stone-600">
          Contact email
          <input type="email" value={v.email} onChange={set("email")} className={`mt-1 ${inputClass}`} />
        </label>
      </div>
      <label className="block text-sm text-stone-600">
        Bio
        <textarea rows={3} value={v.bio} onChange={set("bio")} maxLength={1000} className={`mt-1 ${inputClass}`} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-950 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 px-5 py-2 text-sm text-stone-700 hover:bg-stone-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AccountLink({
  lawyer,
  onChange,
}: {
  lawyer: Lawyer;
  onChange: (updated: Lawyer) => void;
}) {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function link(value: string | null) {
    if (value === null && !window.confirm(`Unlink ${lawyer.user?.email} from ${lawyer.name}? That account will lose access to the lawyer dashboard.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch<{ lawyer: Lawyer }>(`/api/admin/lawyers/${lawyer._id}/link`, {
        method: "PATCH",
        token,
        body: { email: value },
      });
      onChange({ ...lawyer, user: value === null ? null : data.lawyer.user });
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-md bg-stone-50 p-3 text-sm">
      <p className="text-xs uppercase tracking-wide text-stone-500">Sign-in account</p>
      {lawyer.user ? (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-emerald-950">
            {lawyer.user.name} <span className="text-stone-500">({lawyer.user.email})</span>
          </p>
          <button
            disabled={busy}
            onClick={() => link(null)}
            className="text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            Unlink
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) link(email.trim());
          }}
          className="mt-2 flex gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email of the lawyer's LawSuite account"
            className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-amber-400 disabled:opacity-50"
          >
            Link
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminLawyers() {
  const { token } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Lawyer[]>("/api/admin/lawyers", { token })
      .then(setLawyers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const replace = (updated: Lawyer) =>
    setLawyers((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));

  async function addLawyer(values: FormValues) {
    const data = await apiFetch<{ lawyer: Lawyer }>("/api/lawyers", { method: "POST", token, body: toPayload(values) });
    setLawyers((prev) => [...prev, { ...data.lawyer, user: null }].sort((a, b) => a.name.localeCompare(b.name)));
    setAdding(false);
  }

  async function saveLawyer(l: Lawyer, values: FormValues) {
    const data = await apiFetch<{ item: Lawyer }>(`/api/admin/lawyers/${l._id}`, { method: "PUT", token, body: toPayload(values) });
    replace({ ...data.item, user: l.user }); // keep the populated account details
    setEditingId(null);
  }

  async function deleteLawyer(l: Lawyer) {
    if (!window.confirm(`Delete ${l.name}? This removes them from the lawyer directory.`)) return;
    setDeletingId(l._id);
    setError("");
    try {
      await apiFetch(`/api/admin/lawyers/${l._id}`, { method: "DELETE", token });
      setLawyers((prev) => prev.filter((x) => x._id !== l._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone-600">
          To give a lawyer their own dashboard, have them sign up on LawSuite, then link that account to their profile here.
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-amber-400"
          >
            Add a lawyer
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-6">
          <LawyerForm initial={EMPTY_FORM} submitLabel="Add lawyer" onSubmit={addLawyer} onCancel={() => setAdding(false)} />
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-stone-400">Loading…</p>}
      {!loading && !error && lawyers.length === 0 && <p className="mt-6 text-stone-400">No lawyers yet.</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {lawyers.map((l) =>
          editingId === l._id ? (
            <div key={l._id} className="lg:col-span-2">
              <LawyerForm
                initial={toForm(l)}
                submitLabel="Save changes"
                onSubmit={(values) => saveLawyer(l, values)}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div key={l._id} className="flex flex-col rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-emerald-950">{l.name}</h3>
                  <p className="text-sm text-stone-500">
                    {capitalize(l.specialization)}
                    {l.location ? ` · ${l.location}` : ""}
                    {` · ${l.experienceYears ?? 0} yrs · ★ ${l.rating ?? 0}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button onClick={() => setEditingId(l._id)} className="text-emerald-950 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLawyer(l)}
                    disabled={deletingId === l._id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {l.bio && <p className="mt-3 line-clamp-2 text-sm text-stone-600">{l.bio}</p>}
              <AccountLink lawyer={l} onChange={replace} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
