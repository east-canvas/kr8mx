import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SlashX } from "@/components/brand/SlashX";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <Wordmark height={30} />
      <div className="flex items-center gap-2.5 text-muted">
        <SlashX size={14} accent />
        <span className="type-kicker">Error 404</span>
      </div>
      <h1 className="type-display text-primary text-4xl">Off the map.</h1>
      <p className="max-w-sm text-sm text-secondary">
        This page doesn&rsquo;t exist, or it moved. Let&rsquo;s get you back.
      </p>
      <div className="flex gap-3">
        <Button href="/" variant="solid">
          Home
        </Button>
        <Button href="/tablets" variant="outline">
          Tablets
        </Button>
      </div>
    </main>
  );
}
