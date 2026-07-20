import { cookies } from "next/headers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AgeGate } from "@/components/compliance/AgeGate";
import {
  AGE_GATE_COOKIE,
  isAgeConfirmedValue,
} from "@/lib/compliance/age-gate";

/**
 * Storefront shell: header, footer, and the 21+ age gate. The gate cookie is
 * read server-side so confirmed visitors never see a flash. Admin routes live
 * outside this group and get none of this chrome.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const ageConfirmed = isAgeConfirmedValue(
    cookieStore.get(AGE_GATE_COOKIE)?.value,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AgeGate initiallyConfirmed={ageConfirmed} />
    </div>
  );
}
