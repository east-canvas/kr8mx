import { Archivo, Inter } from "next/font/google";

/**
 * Two-font editorial system:
 *  - Archivo (display): a wide grotesque set uppercase + wide-tracked for
 *    headlines — sharp, controlled, elevated.
 *  - Inter (body): a refined neutral sans for reading text and UI.
 *
 * Exposed as CSS variables consumed by tokens.css (--font-display / --font-body).
 */
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  variable: "--font-archivo",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const fontVariables = `${archivo.variable} ${inter.variable}`;
