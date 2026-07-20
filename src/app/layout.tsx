import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { fontVariables } from "@/lib/fonts";
import { AgeGate } from "@/components/compliance/AgeGate";
import { Footer } from "@/components/site/Footer";
import {
  AGE_GATE_COOKIE,
  isAgeConfirmedValue,
} from "@/lib/compliance/age-gate";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the age-gate cookie server-side so confirmed visitors never see a flash.
  const cookieStore = await cookies();
  const ageConfirmed = isAgeConfirmedValue(
    cookieStore.get(AGE_GATE_COOKIE)?.value,
  );

  return (
    // The site shell is the precision (light) theme by default.
    <html lang="en" data-theme="precision" className={fontVariables}>
      <body>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <AgeGate initiallyConfirmed={ageConfirmed} />
      </body>
    </html>
  );
}
