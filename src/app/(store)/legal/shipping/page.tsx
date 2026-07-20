import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";
import { allRestrictedStates } from "@/lib/compliance/shipping-restrictions";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  const restricted = allRestrictedStates();
  return (
    <LegalDoc title="Shipping Policy">
      <p>
        Orders are processed and shipped to serviced states only. An adult 21 or
        older must be available to receive the delivery. Placeholder content —
        pending counsel review.
      </p>
      <p>
        We currently cannot ship to the following states:{" "}
        <span className="text-primary">{restricted.join(", ")}</span>. This list
        is maintained as data and may change without notice.
      </p>
    </LegalDoc>
  );
}
