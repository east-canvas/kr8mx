"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readAgeCookie, writeAgeCookie } from "@/lib/compliance/age-gate";
import { Button } from "@/components/ui/Button";
import { SlashX } from "@/components/brand/SlashX";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * Full-screen 21+ age gate, precision-themed. Shown on first visit until the
 * visitor confirms; the confirmation cookie persists 30 days. Focus-trapped,
 * with no dismissal path other than confirming (Esc / outside-click do nothing).
 *
 * `initiallyConfirmed` is read from the cookie on the server so returning,
 * already-confirmed visitors never see a flash of the gate.
 */
export function AgeGate({
  initiallyConfirmed = false,
}: {
  initiallyConfirmed?: boolean;
}) {
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);
  const [declined, setDeclined] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // In case SSR rendered the gate but the client already has the cookie.
  useEffect(() => {
    if (!confirmed && readAgeCookie()) setConfirmed(true);
  }, [confirmed]);

  const open = !confirmed;

  // Lock body scroll and trap focus while the gate is open.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const el = dialogRef.current?.querySelector<HTMLElement>(
        "button, [href], input, [tabindex]:not([tabindex='-1'])",
      );
      el?.focus();
    };
    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // No dismissal without confirmation.
        e.preventDefault();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const confirm = useCallback(() => {
    writeAgeCookie();
    setConfirmed(true);
  }, []);

  if (!open) return null;

  return (
    <div
      data-theme="precision"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg px-6"
    >
      <div
        ref={dialogRef}
        className="flex w-full max-w-md flex-col items-center gap-8 text-center"
      >
        <Wordmark height={30} href={null} priority />

        <div className="flex items-center gap-2.5 text-muted">
          <SlashX size={14} accent />
          <span className="type-kicker">21+ Verification</span>
        </div>

        {declined ? (
          <>
            <h1
              id="age-gate-title"
              className="type-display text-primary text-2xl"
            >
              You must be 21 or older
            </h1>
            <p id="age-gate-desc" className="max-w-sm text-sm text-secondary">
              This site and its products are intended for adults 21 and over.
              You may not enter.
            </p>
            <Button variant="ghost" onClick={() => setDeclined(false)}>
              Go back
            </Button>
          </>
        ) : (
          <>
            <h1
              id="age-gate-title"
              className="type-display text-primary text-3xl"
            >
              Are you 21 or older?
            </h1>
            <p id="age-gate-desc" className="max-w-sm text-sm text-secondary">
              You must be 21 years of age or older to enter this site. Not for
              sale to persons under the age of 21.
            </p>
            <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <Button variant="solid" size="lg" onClick={confirm}>
                I am 21 or older
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDeclined(true)}
              >
                I am under 21
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
