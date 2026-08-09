import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CookieConsent } from "@/components/layout/CookieConsent";
import "./globals.css";

// `wght` is the default axis and must NOT be listed in `axes`.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jewishchat.example"),
  title: {
    default: "JewishChat — Find the WhatsApp groups your community is already in",
    template: "%s · JewishChat",
  },
  description:
    "A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and everyday community life. Ask in plain language and get results ranked by relevance.",
  keywords: [
    "Jewish WhatsApp groups",
    "frum WhatsApp groups",
    "community directory",
    "Lakewood",
    "Boro Park",
    "Jerusalem",
  ],
  openGraph: {
    type: "website",
    siteName: "JewishChat",
    title: "Find the group your community is already in",
    description:
      "3,961 WhatsApp groups across 46 cities — business, learning, shuls, chesed and community life.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "JewishChat",
    description: "Find the WhatsApp group your community is already in.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${GeistSans.variable}`}>
      <body>
        <SmoothScroll>
          {children}
          <CookieConsent />
        </SmoothScroll>
      </body>
    </html>
  );
}
