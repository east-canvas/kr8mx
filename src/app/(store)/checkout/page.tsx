"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartProvider";
import { placeOrder } from "./actions";
import { Button } from "@/components/ui/Button";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatCents } from "@/db/money";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

const inputCls =
  "w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none focus-visible:border-accent";

export default function CheckoutPage() {
  const { items, subtotalCents, count, clear } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setBusy(true);
    const res = await placeOrder({
      email,
      state,
      items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
    });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    if (res.redirectUrl) {
      window.location.href = res.redirectUrl; // Stripe hosted checkout
      return;
    }
    clear();
    router.push(`/order/${res.orderNumber}`);
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading kicker="Checkout" title="Your cart is empty" as="h1" />
        <div className="mt-8">
          <Button href="/drinks" variant="outline">
            Explore Drinks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading kicker="Checkout" title="Checkout" as="h1" />
      <HairlineRule className="my-8" />

      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        {/* details */}
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="type-kicker text-muted">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="type-kicker text-muted">Ship to state</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={inputCls}
            >
              <option value="">Select a state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <p className="text-2xs text-muted">
            21+ adult use only. An adult must be available to receive the
            delivery. Some states are restricted.
          </p>

          {error ? (
            <p className="rounded-md border border-strawberry/40 px-4 py-3 text-sm text-strawberry">
              {error}
            </p>
          ) : null}

          <Button
            variant="solid"
            size="lg"
            onClick={submit}
            className="w-full"
            {...(busy ? { disabled: true } : {})}
          >
            {busy ? "Placing order…" : "Place order"}
          </Button>
          <p className="text-2xs text-muted">
            Shipping and tax are calculated before payment. Prices are
            placeholders pending final pricing.
          </p>
        </div>

        {/* summary */}
        <aside className="flex flex-col gap-4 rounded-lg border border-hairline p-5">
          <span className="type-kicker text-muted">Order summary</span>
          <ul className="flex flex-col gap-3">
            {items.map((i) => (
              <li key={i.sku} className="flex justify-between gap-3 text-sm">
                <span className="text-secondary">
                  {i.name}
                  <span className="text-muted"> × {i.quantity}</span>
                </span>
                <span className="shrink-0 text-primary">
                  {formatCents(i.unitPriceCents * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <HairlineRule />
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-primary">{formatCents(subtotalCents)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
