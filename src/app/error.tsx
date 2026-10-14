"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-paper pb-24 pt-44 text-center">
      <div className="container-x">
        <p className="eyebrow">Noe gikk galt</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Beklager, en feil oppstod</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Prøv igjen. Hvis det vedvarer, ta kontakt, så hjelper vi deg.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-dark">Prøv igjen</button>
          <Link href="/" className="btn border border-line bg-white hover:bg-mist">Til forsiden</Link>
        </div>
      </div>
    </div>
  );
}
