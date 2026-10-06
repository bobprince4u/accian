import { API_URL } from "../config/api";

export interface ContactValues {
  fullName: string; email: string; companyName: string; phone: string;
  countryCode: string; serviceInterest: string; projectBudget: string;
  projectTimeline: string; message: string; howHeard: string;
}
export const emptyContact = (): ContactValues => ({ fullName: "", email: "", companyName: "", phone: "", countryCode: "+44", serviceInterest: "", projectBudget: "", projectTimeline: "", message: "", howHeard: "" });

/** Preserves existing form requirements; the server owns backend validation. */
export function validateContact(values: ContactValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  else if (values.fullName.length > 100) errors.fullName = "Keep your name within 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter an email address such as name@example.com.";
  if (!values.serviceInterest) errors.serviceInterest = "Choose a service, or select Not Sure Yet.";
  if (!values.message.trim()) errors.message = "Tell us about your enquiry.";
  else if (values.message.length > 1000) errors.message = "Keep your message within 1,000 characters.";
  return errors;
}

export type ContactOutcome = { ok: true; referenceNumber: string } | { ok: false; message: string };

export async function submitContact(values: ContactValues): Promise<ContactOutcome> {
  const securityToken = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Security-Token": securityToken },
      body: JSON.stringify({
        fullName: values.fullName.trim(), email: values.email.trim(), companyName: values.companyName.trim(),
        phone: values.phone ? `${values.countryCode}${values.phone.replace(/\D/g, "")}` : "",
        serviceInterest: values.serviceInterest, projectBudget: values.projectBudget,
        projectTimeline: values.projectTimeline, message: values.message.trim(), howHeard: values.howHeard,
        securityToken, timestamp: Date.now(), userAgent: navigator.userAgent,
      }),
    });
  } catch {
    return { ok: false, message: "We couldn’t confirm your message was received. Your answers are still here. Check your connection, or email info@accian.co.uk before resending." };
  }
  if (!response.ok) {
    return { ok: false, message: response.status === 429
      ? "You’ve sent several enquiries recently. Please try again later, or email info@accian.co.uk. Your answers are still here."
      : response.status === 400
        ? "We couldn’t accept this enquiry. Check your details and try again. Your answers are still here."
        : "We couldn’t confirm your message was received. Your answers are still here. Please email info@accian.co.uk before resending." };
  }
  try {
    const payload = await response.json();
    if (payload.success === true && typeof payload.data?.referenceNumber === "string" && payload.data.referenceNumber.trim()) {
      return { ok: true, referenceNumber: payload.data.referenceNumber };
    }
  } catch { /* Do not display proxy or provider response bodies. */ }
  return { ok: false, message: "We couldn’t confirm your message was received. Please email info@accian.co.uk before resending. Your answers are still here." };
}
