import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { CartProvider } from "@/lib/cart/CartProvider";
import { resolveBaseUrl, SITE, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KR8MX — Performance. Elevated.",
    template: "%s — KR8MX",
  },
  description:
    "KR8MX. One brand, two worlds — a premium performance line and a precision tablet line. Built for what's next.",
  metadataBase: new URL(resolveBaseUrl()),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "KR8MX — Performance. Elevated.",
    description:
      "One brand, two worlds. Built for what's next.",
    url: "/",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KR8MX — Performance. Elevated.",
    images: ["/brand/og-default.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fafbfc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The site shell is the precision (light) theme by default.
    <html lang="en" data-theme="precision" className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
