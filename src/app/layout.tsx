import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { fontVariables } from "@/lib/fonts";
import { CartProvider } from "@/lib/cart/CartProvider";
import { resolveBaseUrl, SITE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KR8MX | Pure Science.",
    template: "%s | KR8MX",
  },
  applicationName: SITE.name,
  description: SITE.description,
  metadataBase: new URL(resolveBaseUrl()),
  alternates: { canonical: "/" },
  keywords: [
    "KR8MX",
    "Kr8Mx",
    "KR8MX Tablets",
    "kratom tablets",
    "kratom brand",
    "MitraGen+",
    "Mitragen Labs",
    "Grape",
    "Lemon",
    "Peach",
    "Strawberry",
    "Blue Razz",
  ],
  category: "Health & Personal Care",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "KR8MX | Pure Science.",
    description: SITE.description,
    url: "/",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KR8MX | Pure Science.",
    description: SITE.description,
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
    <ViewTransitions>
      <html lang="en" data-theme="precision" className={fontVariables}>
        <body>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteJsonLd()),
            }}
          />
          <CartProvider>{children}</CartProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
