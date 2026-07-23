"use client";

import { useEffect } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SlashX } from "@/components/brand/SlashX";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire to an error reporter (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <Wordmark height={30} />
      <div className="flex items-center gap-2.5 text-muted">
        <SlashX size={14} accent />
        <span className="type-kicker">Something went wrong</span>
      </div>
      <h1 className="type-display text-primary text-4xl">A brief glitch.</h1>
      <p className="max-w-sm text-sm text-secondary">
        We hit an unexpected error. Try again, if it persists, come back shortly.
      </p>
      <div className="flex gap-3">
        <Button variant="solid" onClick={() => reset()}>
          Try again
        </Button>
        <Button href="/" variant="outline">
          Home
        </Button>
      </div>
    </main>
  );
}
