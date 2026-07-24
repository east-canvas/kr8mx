"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** Copies the given text to the clipboard, for pasting an order into another tool. */
export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "rounded-sm border border-hairline px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:border-secondary",
        className,
      )}
    >
      {done ? "Copied" : label}
    </button>
  );
}
