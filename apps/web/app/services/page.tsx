import { Metadata } from "next";
import ServicesPage from "@/views/ServicesPage";
export const metadata: Metadata = {
  title: "Services — IT Consulting, Software & Data | ACCIAN",
  description: "Explore ACCIAN’s IT consulting, software development, training, social care and data science services. See what each service includes and discuss your requirements.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Services — IT Consulting, Software & Data | ACCIAN", description: "Explore ACCIAN’s IT consulting, software development, training, social care and data science services. See what each service includes and discuss your requirements.", url: "/services", type: "website" },
};

export default function Page() {
  return <ServicesPage />;
}
