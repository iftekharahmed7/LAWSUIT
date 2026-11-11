import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-serif text-6xl text-amber-500">404</p>
      <h1 className="mt-4 font-serif text-3xl text-emerald-950">Page not found</h1>
      <p className="mt-4 text-stone-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-md bg-emerald-950 px-6 py-3 font-medium text-amber-400 transition-colors hover:bg-emerald-900"
      >
        Back to home
      </Link>
    </div>
  );
}
