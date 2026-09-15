import { Link } from "react-router-dom";

const stats = [
  { value: "18", label: "FEATURES SHIPPED" },
  { value: "2", label: "LANGUAGES" },
  { value: "0 ৳", label: "TO GET STARTED" },
];

const features = [
  { icon: "📖", title: "Know your rights", desc: "Tenant, labour, consumer", to: "/rights" },
  { icon: "🔍", title: "Legal glossary", desc: "Jargon, decoded", to: "/glossary" },
  { icon: "📄", title: "Summarise a document", desc: "Paste it, understand it", to: "/summarise" },
  { icon: "📰", title: "Legal news", desc: "What changed this month", to: "/news" },
  { icon: "🆘", title: "Emergency helpline", desc: "Numbers that answer now", to: "/helpline" },
  { icon: "🖊", title: "Smart document filler", desc: "Guided, then downloaded", to: "/templates" },
];

export default function Home() {
  return (
    <div className="bg-stone-50">
      {/* Hero */}
      <section className="bg-emerald-950 text-stone-100">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h1 className="max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
            Know where you stand,{" "}
            <span className="text-amber-400">before you pay anyone.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-stone-300">
            Evicted without notice? Fired without dues? Handed a contract you
            don't understand? LawSuite explains your rights under
            Bangladeshi law in plain language — in English or Bangla, free,
            and without an account.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/ask"
              className="rounded-md bg-amber-500 px-6 py-3 font-medium text-emerald-950 transition-colors hover:bg-amber-400"
            >
              Ask a legal question →
            </Link>
            <Link
              to="/lawyers"
              className="rounded-md border border-stone-400 px-6 py-3 font-medium transition-colors hover:border-amber-400 hover:text-amber-400"
            >
              Find a lawyer
            </Link>
          </div>

          <dl className="mt-16 grid max-w-lg grid-cols-3 gap-8 border-t border-stone-700 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl text-amber-400">{s.value}</dt>
                <dd className="mt-1 text-xs tracking-wide text-stone-400">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-serif text-3xl text-emerald-950">
          Everything else you might need
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-400 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-medium text-emerald-950">{f.title}</p>
                  <p className="text-sm text-stone-500">{f.desc}</p>
                </div>
              </div>
              <span className="text-stone-400">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-stone-200 bg-stone-100 py-20 text-center">
        <h2 className="font-serif text-3xl text-emerald-950">
          Start with a question. It costs nothing.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Anonymous mode is on by default — ask without signing up. Create
          an account only when you want your conversations saved.
        </p>
        <Link
          to="/ask"
          className="mt-8 inline-block rounded-md bg-emerald-950 px-8 py-3 font-medium text-amber-400 transition-colors hover:bg-emerald-900"
        >
          Open the assistant →
        </Link>
      </section>
    </div>
  );
}
