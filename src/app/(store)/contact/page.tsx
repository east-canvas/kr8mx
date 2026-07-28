import type { Metadata } from "next";
import { SlashX } from "@/components/brand/SlashX";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { ContactForm } from "@/components/site/ContactForm";
import { TrustBadges } from "@/components/site/TrustBadges";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with KR8MX for wholesale, retail, and general inquiries. Premium 21+ kratom-derived tablets, built with the proprietary MitraGen+™ formula.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact KR8MX",
    description:
      "Wholesale, retail, and general inquiries for KR8MX Tablets. 21+.",
    url: "/contact",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="flex items-center gap-2.5 text-muted">
        <SlashX size={16} accent />
        <span className="type-kicker">Get In Touch</span>
      </div>
      <h1 className="type-display mt-5 max-w-[18ch] text-primary text-4xl sm:text-5xl">
        Let us talk.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-secondary sm:text-base">
        Wholesale, retail, or a general question. Tell us a bit about you and our
        team will reach out. 21+ adult use only.
      </p>

      <div className="mt-8">
        <TrustBadges />
      </div>

      <HairlineRule className="my-10" />

      <ContactForm />
    </div>
  );
}
