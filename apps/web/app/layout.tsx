import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://accian.co.uk"),
  title: "ACCIAN Limited — Technology Consulting & Research Support",
  description:
    "UK-based technology consulting, software development, data solutions and postgraduate research application guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen flex flex-col bg-[#F5F3EE] antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <CookieBanner />
        <Navigation />
        <main id="main-content" tabIndex={-1} className="grow focus:outline-none">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
