import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "KR8MX refund and return policy. 21+ adult use only.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalDoc title="Refund Policy">
      <p>
        This Refund Policy describes the conditions under which returns and
        refunds may be issued. Placeholder content, pending counsel review.
      </p>
      <p>
        Due to the nature of the products, unopened items may be eligible for
        return within a stated window. Full terms to be completed.
      </p>
    </LegalDoc>
  );
}
