import { Metadata } from "next";
import PrivacyPolicy from "@/views/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | ACCIAN Limited",
  description: "Read how ACCIAN uses enquiry details, handles personal information and cookies, and how to contact us about your privacy.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: "Privacy Policy | ACCIAN Limited", description: "Read how ACCIAN uses enquiry details, handles personal information and cookies, and how to contact us about your privacy.", url: "/privacy-policy", type: "website" },
};

export default function Page() {
  return <PrivacyPolicy />;
}
