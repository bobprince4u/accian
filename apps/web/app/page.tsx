import { Metadata } from "next";
import HomePage from "@/views/HomePage";
export const metadata: Metadata = {
  title: "ACCIAN Limited — Technology Consulting & Research Support",
  description: "UK technology consulting, software development, data services and research application support. Explore our services or contact ACCIAN about your needs.",
  alternates: { canonical: "/" },
  openGraph: { title: "ACCIAN Limited — Technology Consulting & Research Support", description: "UK technology consulting, software development, data services and research application support. Explore our services or contact ACCIAN about your needs.", url: "/", type: "website" },
};
export default function Page() {
  return <HomePage />;
}
