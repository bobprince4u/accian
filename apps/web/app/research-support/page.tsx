import { Metadata } from "next";
import ResearchSupportPage from "@/views/ResearchSupport";

export const metadata: Metadata = {
  alternates: { canonical: "/research-support" },
  title: "Research Support — PhD Research Pathway | ACCIAN Limited",
  description:
    "Topic identification, supervisor matching, proposal development and application guidance for MRes, MPhil and PhD applicants. Start with a free pre-consultation.",
};

export default function Page() {
  return <ResearchSupportPage />;
}
