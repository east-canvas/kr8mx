import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { CartProvider } from "@/lib/cart/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KR8MX — Performance. Elevated.",
    template: "%s — KR8MX",
  },
  description:
    "KR8MX. One brand, two worlds — a premium performance line and a precision tablet line. Built for what's next.",
  metadataBase: new URL("https://kr8mx.com"),
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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
