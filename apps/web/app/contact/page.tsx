import { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
export const metadata: Metadata = {
  title: "Contact ACCIAN — Enquiries & Consultation",
  description: "Contact ACCIAN about technology services or research support. Send an enquiry, email info@accian.co.uk or call our UK team.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact ACCIAN — Enquiries & Consultation", description: "Contact ACCIAN about technology services or research support. Send an enquiry, email info@accian.co.uk or call our UK team.", url: "/contact", type: "website" },
};

export default function Page() {
  return <ContactPage />;
}
