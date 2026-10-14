import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-paper pb-24 pt-44 text-center">
      <div className="container-x">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-5xl font-semibold">Her bet det ikke på</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Siden du leter etter finnes ikke, eller har flyttet.</p>
        <Link href="/" className="btn btn-dark mt-8">Til forsiden</Link>
      </div>
    </div>
  );
}
