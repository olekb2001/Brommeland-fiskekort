import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatus } from "@/components/OrderStatus";

export const metadata: Metadata = {
  title: "Takk for bestillingen",
  robots: { index: false, follow: false },
};

export default async function Takk({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const valid = session_id && /^cs_[A-Za-z0-9_]{10,200}$/.test(session_id);

  return (
    <div className="bg-paper pb-24 pt-36 md:pt-44">
      <div className="container-x">
        {valid ? (
          <OrderStatus sessionId={session_id} />
        ) : (
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-4xl font-semibold">Fant ikke bestillingen</h1>
            <p className="mt-4 text-ink/70">Lenken ser ikke riktig ut. Har du betalt, kommer fiskekortet på e-post.</p>
            <Link href="/fiskekort" className="btn btn-dark mt-8">Til fiskekort</Link>
          </div>
        )}
      </div>
    </div>
  );
}
