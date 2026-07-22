import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { AdminLogin } from "./AdminLogin";
import { logoutAction } from "./actions";
import { Wordmark } from "@/components/brand/Wordmark";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="min-h-screen lg:grid lg:grid-cols-[224px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-hairline p-5 lg:flex">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <Wordmark height={18} href={null} />
            <span className="type-kicker text-muted">Console</span>
          </div>
          <AdminNav orientation="sidebar" />
        </div>
        <form action={logoutAction}>
          <button className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary">
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile top bar + scrollable section nav */}
      <div className="sticky top-0 z-30 border-b border-hairline bg-bg/90 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Wordmark height={16} href={null} />
            <span className="type-kicker text-muted">Console</span>
          </div>
          <form action={logoutAction}>
            <button className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary">
              Sign out
            </button>
          </form>
        </div>
        <div className="border-t border-hairline">
          <AdminNav orientation="mobile" />
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
