import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { capitalize } from "@/lib/bookings";

type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "url";
  required?: boolean;
  options?: string[];
  rows?: number;
};

type ContentType = {
  id: string;
  label: string;
  singular: string;
  listPath: string; // public list endpoint
  createPath: string; // admin-only POST
  adminPath: string; // admin PUT/DELETE base
  createKey: string; // key of the created record in the POST response
  fields: Field[];
  primary: string; // field shown as the card title
  secondary: string; // field shown as the card text
};

type Item = { _id: string; [key: string]: unknown };

export const CONTENT_TYPES: ContentType[] = [
  {
    id: "documents",
    label: "Documents",
    singular: "document",
    listPath: "/api/documents",
    createPath: "/api/documents",
    adminPath: "/api/admin/documents",
    createKey: "document",
    primary: "title",
    secondary: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["contract", "affidavit", "petition", "agreement", "notice", "general"] },
      { name: "content", label: "Content", type: "textarea", required: true, rows: 10 },
      { name: "fileUrl", label: "Link to original file (optional)", type: "url" },
    ],
  },
  {
    id: "glossary",
    label: "Glossary",
    singular: "term",
    listPath: "/api/glossary",
    createPath: "/api/glossary",
    adminPath: "/api/admin/glossary",
    createKey: "term",
    primary: "term",
    secondary: "definition",
    fields: [
      { name: "term", label: "Term", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["family", "property", "criminal", "labor", "consumer", "general"] },
      { name: "definition", label: "Plain-language definition", type: "textarea", required: true, rows: 4 },
    ],
  },
  {
    id: "news",
    label: "Legal news",
    singular: "news item",
    listPath: "/api/legal-news",
    createPath: "/api/legal-news",
    adminPath: "/api/admin/legal-news",
    createKey: "item",
    primary: "title",
    secondary: "summary",
    fields: [
      { name: "title", label: "Headline", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["labor", "property", "consumer", "family", "criminal", "general"] },
      { name: "publishedDate", label: "Published on", type: "date", required: true },
      { name: "summary", label: "Plain-language summary", type: "textarea", required: true, rows: 5 },
      { name: "sourceName", label: "Source name (optional)", type: "text" },
      { name: "sourceUrl", label: "Source link (optional)", type: "url" },
    ],
  },
];

const inputClass =
  "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none";

function toFormValues(type: ContentType, item?: Item): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of type.fields) {
    const raw = item?.[f.name];
    if (f.type === "date") {
      values[f.name] = typeof raw === "string" ? raw.slice(0, 10) : new Date().toISOString().slice(0, 10);
    } else if (f.type === "select") {
      values[f.name] = typeof raw === "string" ? raw : "general";
    } else {
      values[f.name] = typeof raw === "string" ? raw : "";
    }
  }
  return values;
}

function ItemForm({
  type,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  type: ContentType;
  initial: Record<string, string>;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = type.fields.find((f) => f.required && !values[f.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
      await onSubmit(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-amber-300 bg-white p-5">
      {type.fields.map((f) => (
        <label key={f.name} className="block text-sm text-stone-600">
          {f.label}
          {f.required && " *"}
          {f.type === "textarea" ? (
            <textarea
              rows={f.rows ?? 4}
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className={inputClass}
            />
          ) : f.type === "select" ? (
            <select
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className={inputClass}
            >
              {f.options!.map((o) => (
                <option key={o} value={o}>{capitalize(o)}</option>
              ))}
            </select>
          ) : (
            <input
              type={f.type}
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              placeholder={f.type === "url" ? "https://…" : undefined}
              className={inputClass}
            />
          )}
        </label>
      ))}

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

function ContentList({ type }: { type: ContentType }) {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setAdding(false);
    setEditingId(null);
    setFilter("");
    apiFetch<Item[]>(type.listPath)
      .then((data) => !cancelled && setItems(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type]);

  async function create(values: Record<string, string>) {
    const data = await apiFetch<Record<string, Item>>(type.createPath, { method: "POST", token, body: values });
    setItems((prev) => [data[type.createKey], ...prev]);
    setAdding(false);
  }

  async function save(item: Item, values: Record<string, string>) {
    const data = await apiFetch<{ item: Item }>(`${type.adminPath}/${item._id}`, { method: "PUT", token, body: values });
    setItems((prev) => prev.map((x) => (x._id === item._id ? data.item : x)));
    setEditingId(null);
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete "${String(item[type.primary])}"? This can't be undone.`)) return;
    setDeletingId(item._id);
    setError("");
    try {
      await apiFetch(`${type.adminPath}/${item._id}`, { method: "DELETE", token });
      setItems((prev) => prev.filter((x) => x._id !== item._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    } finally {
      setDeletingId(null);
    }
  }

  const q = filter.trim().toLowerCase();
  const visible = q
    ? items.filter((i) => String(i[type.primary] ?? "").toLowerCase().includes(q))
    : items;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${type.label.toLowerCase()}…`}
          className="w-full max-w-sm rounded-md border border-stone-300 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
        />
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-amber-400"
          >
            Add a {type.singular}
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-6">
          <ItemForm
            type={type}
            initial={toFormValues(type)}
            submitLabel={`Add ${type.singular}`}
            onSubmit={create}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-stone-400">Loading…</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-6 text-stone-400">{q ? "Nothing matches that filter." : `No ${type.label.toLowerCase()} yet.`}</p>
      )}

      <div className="mt-6 space-y-3">
        {visible.map((item) =>
          editingId === item._id ? (
            <ItemForm
              key={item._id}
              type={type}
              initial={toFormValues(type, item)}
              submitLabel="Save changes"
              onSubmit={(values) => save(item, values)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={item._id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-emerald-950">{String(item[type.primary] ?? "")}</h3>
                    {typeof item.category === "string" && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{item.category}</span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">{String(item[type.secondary] ?? "")}</p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button onClick={() => setEditingId(item._id)} className="text-emerald-950 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item)}
                    disabled={deletingId === item._id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const [params, setParams] = useSearchParams();
  const type = CONTENT_TYPES.find((t) => t.id === params.get("type")) ?? CONTENT_TYPES[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setParams({ tab: "content", type: t.id })}
            className={`rounded-full px-3 py-1 text-sm ${
              t.id === type.id ? "bg-emerald-950 text-white" : "border border-stone-300 text-stone-600 hover:border-stone-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <ContentList type={type} />
      </div>
    </div>
  );
}
