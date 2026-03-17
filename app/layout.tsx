import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.alphareset.co";

export const metadata: Metadata = {
  title: "Alpha Reset — Live Like The 1%",
  description: "A quarterly 3-day water-fasting + life review challenge. 72 hours. No food. No distractions. Just you, God, and the truth. Every quarter, become a completely different human being. By choice.",
  metadataBase: new URL(siteUrl),
  keywords: ["alpha reset", "water fasting", "72 hour fast", "life review", "quarterly reset", "discipline", "self improvement", "men", "accountability"],
  authors: [{ name: "Kay Akinwunmi" }],
  openGraph: {
    title: "Alpha Reset — Live Like The 1%",
    description: "72 hours. No food. No distractions. A quarterly water-fasting + life review challenge. Join us 7–9 April 2026.",
    url: siteUrl,
    siteName: "Alpha Reset",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Alpha Reset — Live Like The 1%",
        type: "image/png",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha Reset — Live Like The 1%",
    description: "72 hours. No food. No distractions. A quarterly water-fasting + life review challenge.",
    images: ["/og.png"],
    creator: undefined,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="paper-texture antialiased">
        {children}
      </body>
    </html>
  );
}
