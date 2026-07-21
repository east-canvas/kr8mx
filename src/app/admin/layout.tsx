import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { AdminLogin } from "./AdminLogin";
import { logoutAction } from "./actions";
import { Wordmark } from "@/components/brand/Wordmark";
import { ADMIN_COOKIE, adminConfigured, isAuthed } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "KR8MX Console",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const authed = isAuthed(store.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <Suspense>
        <AdminLogin configured={adminConfigured()} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Wordmark height={18} href={null} />
            <span className="type-kicker text-muted">Console</span>
          </div>
          <form action={logoutAction}>
            <button className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
