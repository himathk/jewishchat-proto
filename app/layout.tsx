import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

// `wght` is the default axis and must NOT be listed in `axes`.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JewishChat — Find the WhatsApp groups your community is already in",
  description:
    "A curated directory of WhatsApp groups for Jewish businesses, shuls, learning, chesed and community life. Ask in plain language and get ranked results.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${GeistSans.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
