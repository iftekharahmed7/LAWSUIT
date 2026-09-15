const helplines = [
  {
    number: "999",
    name: "National Emergency Service",
    desc: "Police, fire, and ambulance. For anything urgent or physically dangerous, start here.",
  },
  {
    number: "16430",
    name: "National Legal Aid Services (NLASO)",
    desc: "Government legal aid helpline - free legal advice and support if you can't afford a lawyer.",
  },
  {
    number: "109",
    name: "Violence Against Women & Children",
    desc: "Government helpline for abuse, harassment, and child marriage - connects you to counselors, police, and legal support.",
  },
  {
    number: "333",
    name: "National Helpline (General)",
    desc: "General government information and social services helpline for a wide range of issues.",
  },
];

export default function Helpline() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Emergency helpline</h1>
      <p className="mt-2 text-stone-600">
        Numbers that answer now. Free to call from any network in Bangladesh.
      </p>

      <div className="mt-8 space-y-4">
        {helplines.map((h) => (
            <a
            key={h.number}
            href={`tel:${h.number}`}
            className="flex items-center gap-5 rounded-lg border border-stone-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-md"
          >
            <span className="font-serif text-3xl font-semibold text-emerald-950">{h.number}</span>
            <div>
              <p className="font-medium text-emerald-950">{h.name}</p>
              <p className="mt-1 text-sm text-stone-600">{h.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-10 text-xs text-stone-400">
        If you're in immediate physical danger, call 999 first. These are general government and
        legal-aid helplines - not a substitute for professional legal advice for your specific case.
      </p>
    </div>
  );
}
