import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpha Reset — A Personal Invitation",
  description: "A quarterly 3-day water-fasting + life review challenge. Every quarter, become a completely different human being. By choice.",
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
      <body className="paper-texture antialiased">
        {children}
      </body>
    </html>
  );
}
