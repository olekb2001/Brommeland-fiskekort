import type { Metadata } from "next";
import { AdminDashboard, AdminLogin } from "@/components/AdminPanel";
import { adminEnabled, isAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const enabled = adminEnabled();
  const loggedIn = enabled && (await isAdmin());

  return (
    <div className="bg-paper pb-24 pt-32 md:pt-40">
      <div className="container-x">
        {!enabled ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-8">
            <h1 className="font-display text-3xl font-semibold">Admin er ikke slått på</h1>
            <p className="mt-3 text-ink/70">
              Legg inn <code className="rounded bg-mist px-1.5 py-0.5">ADMIN_PASSWORD=...</code> i <code className="rounded bg-mist px-1.5 py-0.5">.env.local</code> (og i Vercel), og start serveren på nytt.
            </p>
          </div>
        ) : loggedIn ? (
          <AdminDashboard />
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
}
