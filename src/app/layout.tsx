import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import FeedbackFooter from "@/components/FeedbackFooter";

// Design DNA type pair (Source Institutional, FP49): serif headings, sans body and figures.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

const TITLE = "GTHA Winter Maintenance Spending by Municipality";
const DESCRIPTION =
  "Compare winter road maintenance spending, snowfall and service levels across 26 GTHA municipalities, 2015 to 2026, from public financial data.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Describes only what is visible on the page: the site, its language, and its subject.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GTHA Winter Maintenance",
  description: DESCRIPTION,
  inLanguage: "en-CA",
  about: {
    "@type": "Thing",
    name: "Winter road maintenance in the Greater Toronto and Hamilton Area",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${sourceSerif.variable} ${sourceSans.variable}`}>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before hydration; ignore those mismatches. */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <FeedbackFooter />
      </body>
    </html>
  );
}
