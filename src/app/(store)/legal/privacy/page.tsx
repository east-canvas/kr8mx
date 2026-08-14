import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How KR8MX handles your information. 21+ adult use only.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <p>
        This Privacy Policy describes how KR8MX collects, uses, and protects the
        information you provide when you visit the site or place an order.
        Placeholder content, pending counsel review.
      </p>
      <p>
        We collect only the information necessary to process orders, verify age
        eligibility, and operate the site. We do not sell your personal
        information. To be completed.
      </p>
    </LegalDoc>
  );
}
