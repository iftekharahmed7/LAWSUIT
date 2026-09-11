export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl text-emerald-950">{title}</h1>
      <p className="mt-4 text-stone-600">{description}</p>
      <p className="mt-8 inline-block rounded-md border border-dashed border-stone-300 px-6 py-3 text-sm text-stone-400">
        This page is coming soon.
      </p>
    </div>
  );
}
