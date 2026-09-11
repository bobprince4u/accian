import { Metadata } from "next";
import PrivacyPolicy from "@/views/PrivacyPolicy";

export const metadata: Metadata = {
  title: "ACCIAN Limited — Global IT, Cybersecurity & Digital Solutions",
  description:
    "ACCIAN is a UK-registered technology and cybersecurity company delivering secure, scalable, and intelligent",
};

export default function Page() {
  return <PrivacyPolicy />;
}
