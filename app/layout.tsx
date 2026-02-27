import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpha Reset — Live Like The 1%",
  description: "A quarterly 3-day water-fasting + life review challenge. Starve the body to feed the spirit and soul.",
  openGraph: {
    title: "Alpha Reset — Live Like The 1%",
    description: "A quarterly 3-day water-fasting + life review challenge.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
