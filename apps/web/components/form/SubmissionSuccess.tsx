"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Copy } from "lucide-react";

export interface SubmissionSuccessProps {
  referenceId: string;
  /** ISO 8601, as returned by the API. */
  submittedAt?: string;
}

const formatSubmittedAt = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

/**
 * The confirmation screen.
 *
 * Reached only after the API has returned a reference id, which it issues only
 * once the mail provider has accepted the message. Nothing here tells the
 * applicant more than that: the wording confirms the submission was received,
 * not that anyone has read it.
 *
 * The heading takes focus on mount. Swapping a long form for a short panel is
 * obvious on screen and completely silent to a screen reader otherwise, and a
 * `role="status"` region announces the reference number alongside it.
 */
export default function SubmissionSuccess({
  referenceId,
  submittedAt,
}: SubmissionSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const timestamp = formatSubmittedAt(submittedAt);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
    } catch {
      // Clipboard access can be refused — over plain HTTP, or by permission.
      // The reference is on screen and selectable either way, so there is
      // nothing to report and nothing the applicant needs to do differently.
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-2xl rounded-2xl border border-[#E8E4DC] bg-white p-7 text-center sm:p-10"
    >
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4FFF]/[0.08]">
        <CheckCircle2 size={26} className="text-[#1B4FFF]" aria-hidden="true" />
      </span>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight text-[#0D0D0D] focus:outline-none sm:text-3xl"
      >
        Application received
      </h1>

      <p className="mt-3 text-sm font-light leading-relaxed text-[#666666] sm:text-base">
        Thank you. Your pre-consultation information has been submitted
        successfully.
      </p>

      <div className="mt-6 rounded-xl border border-[#D8D3C9] bg-[#F5F3EE] px-5 py-5">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#666666]">
          Your reference number
        </p>
        <p className="mt-2 text-xl font-bold tracking-tight text-[#0D0D0D] tabular-nums sm:text-2xl">
          {referenceId}
        </p>

        <button
          type="button"
          onClick={copy}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#D8D3C9] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D0D0D] transition-colors hover:border-[#1B4FFF] hover:text-[#1B4FFF] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
        >
          {copied ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <Copy size={12} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy reference"}
        </button>

        {timestamp && (
          <p className="mt-3 text-xs font-light text-[#666666]">
            Submitted {timestamp}
          </p>
        )}
      </div>

      <p className="mt-6 text-sm font-light leading-relaxed text-[#666666]">
        The Accian team will review your information before your consultation.
      </p>

      <p className="mt-2 text-xs font-light leading-relaxed text-[#999999]">
        Please keep your reference number — quote it if you need to send us
        anything else.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/research-support"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D0D0D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B4FFF] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
        >
          Back to Research Support
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-[#D8D3C9] px-6 py-3 text-sm font-semibold text-[#0D0D0D] transition-colors hover:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
