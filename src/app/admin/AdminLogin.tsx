"use client";

import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { SlashX } from "@/components/brand/SlashX";

export function AdminLogin({ configured }: { configured: boolean }) {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 text-muted">
          <SlashX size={14} accent />
          <span className="type-kicker">Admin</span>
        </div>
        <h1 className="type-display text-primary text-2xl">KR8MX Console</h1>
      </div>

      {!configured ? (
        <div className="rounded-md border border-hairline bg-surface-raised p-5 text-sm text-secondary">
          Admin is locked. Set the{" "}
          <code className="text-primary">ADMIN_PASSWORD</code> environment
          variable to enable sign-in.
        </div>
      ) : (
        <form action={loginAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="type-kicker text-muted">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none focus-visible:border-accent"
            />
          </label>
          {error === "auth" ? (
            <p className="text-xs text-strawberry">Incorrect password.</p>
          ) : null}
          <Button variant="solid" size="md" type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      )}
    </div>
  );
}
