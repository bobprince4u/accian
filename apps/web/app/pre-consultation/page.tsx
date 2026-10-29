import type { Metadata } from "next";

import PreConsultationForm from "@/views/PreConsultationForm";

export const metadata: Metadata = {
  alternates: { canonical: "/pre-consultation" },
  title: "Research Pre-Consultation Form | ACCIAN Limited",
  description:
    "Complete your research pre-consultation form for MRes, MPhil or PhD application guidance. Share your academic background, research interests and documents so your Accian consultant can prepare before your call.",
  // The form carries personal data and document uploads; there is nothing here
  // worth indexing and a search result would only invite stray submissions.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PreConsultationForm />;
}
