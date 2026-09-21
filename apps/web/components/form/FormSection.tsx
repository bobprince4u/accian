"use client";

import type { ReactNode } from "react";

/**
 * A numbered section of the form.
 *
 * The heading style mirrors the printed Pre-Consultation Form — a number, the
 * title, and a rule beneath — but in the site's own palette rather than the
 * PDF's navy and gold, so the page sits with the rest of accian.co.uk.
 *
 * The number is decorative for assistive technology: it is already announced
 * by the heading text and the step position, and a bare digit read before
 * every heading is noise.
 */
export default function FormSection({
  number,
  title,
  intro,
  children,
}: {
  number: number;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`section-${number}`} className="scroll-mt-28">
      <div className="mb-5 border-b border-[#D8D3C9] pb-3">
        <h3
          id={`section-${number}`}
          className="flex items-baseline gap-2.5 text-base font-bold tracking-tight text-[#0D0D0D]"
        >
          <span
            aria-hidden="true"
            className="text-xs font-bold tabular-nums text-[#1B4FFF]"
          >
            {String(number).padStart(2, "0")}
          </span>
          {title}
        </h3>
        {intro && (
          <p className="mt-1.5 text-xs font-light italic leading-relaxed text-[#666666]">
            {intro}
          </p>
        )}
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}
