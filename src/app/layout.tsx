import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTHA Snow Plowing Dashboard",
  description:
    "Winter road maintenance spending, snowfall and efficiency indicators for municipalities in the Greater Toronto and Hamilton Area.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
