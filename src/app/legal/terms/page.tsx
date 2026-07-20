import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service">
      <p>
        These Terms of Service govern your access to and use of the KR8MX website
        and your purchase of products. By entering the site you confirm that you
        are 21 years of age or older. Full terms are pending counsel review.
      </p>
      <p>
        Products are intended for adult use only (21+). Availability is limited by
        state and subject to change. Placeholder content — to be completed.
      </p>
    </LegalDoc>
  );
}
