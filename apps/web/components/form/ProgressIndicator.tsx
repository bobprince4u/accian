"use client";

import { Check } from "lucide-react";

export interface ProgressIndicatorProps {
  steps: { id: string; shortTitle: string }[];
  /** Zero-based. Equal to `steps.length` on the review screen. */
  current: number;
  /** Furthest step the applicant may jump to. */
  furthest: number;
  onJump: (index: number) => void;
}

/**
 * Step progress, as a list of numbered stops.
 *
 * Built for screen readers as well as eyes. The container is a `<nav>` with a
 * visible-to-AT status line that states "Step 3 of 8: Research", because a row
 * of coloured dots communicates nothing when read aloud — and the brief asks
 * for a screen-reader-friendly indicator specifically.
 *
 * A stop is a real `<button>` when it can be reached and a `disabled` one when
 * it cannot, so the keyboard cannot tab into a step that would be refused.
 * `aria-current="step"` marks where the applicant is.
 *
 * On narrow screens the labels are dropped and the row becomes a compact
 * scrollable strip of numbers; the status line above still names the step, so
 * nothing is lost.
 */
export default function ProgressIndicator({
  steps,
  current,
  furthest,
  onJump,
}: ProgressIndicatorProps) {
  const total = steps.length;
  const onReview = current >= total;
  const label = onReview ? "Review" : steps[current]?.shortTitle;

  return (
    <nav aria-label="Form progress">
      <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-[#666666]">
        <span aria-hidden="true">
          Step {Math.min(current + 1, total + 1)} of {total + 1} · {label}
        </span>
        <span className="sr-only">
          {onReview
            ? `Final step of ${total + 1}: review your answers`
            : `Step ${current + 1} of ${total + 1}: ${label}`}
        </span>
      </p>

      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        {steps.map((step, index) => {
          const complete = index < current;
          const active = index === current;
          const reachable = index <= furthest;

          return (
            <li key={step.id} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => reachable && onJump(index)}
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.shortTitle}${
                  complete ? " (completed)" : ""
                }`}
                className={[
                  "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold",
                  "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40",
                  active
                    ? "border-[#1B4FFF] bg-[#1B4FFF] text-white"
                    : complete
                      ? "border-[#1B4FFF]/30 bg-[#1B4FFF]/[0.08] text-[#1B4FFF] hover:bg-[#1B4FFF]/15"
                      : reachable
                        ? "border-[#D8D3C9] bg-white text-[#666666] hover:border-[#0D0D0D]/40"
                        : "cursor-not-allowed border-[#E8E4DC] bg-[#EDE9E0] text-[#999999]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 items-center justify-center tabular-nums"
                >
                  {complete ? <Check size={12} strokeWidth={3} /> : index + 1}
                </span>
                <span className="hidden sm:inline">{step.shortTitle}</span>
              </button>

              {index < total - 1 && (
                <span
                  aria-hidden="true"
                  className={`hidden h-px w-3 sm:block ${
                    complete ? "bg-[#1B4FFF]/40" : "bg-[#D8D3C9]"
                  }`}
                />
              )}
            </li>
          );
        })}

        <li className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span
            aria-hidden="true"
            className={`hidden h-px w-3 sm:block ${
              onReview ? "bg-[#1B4FFF]/40" : "bg-[#D8D3C9]"
            }`}
          />
          <span
            aria-current={onReview ? "step" : undefined}
            className={[
              "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold",
              onReview
                ? "border-[#1B4FFF] bg-[#1B4FFF] text-white"
                : "border-[#E8E4DC] bg-[#EDE9E0] text-[#999999]",
            ].join(" ")}
          >
            <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center">
              {total + 1}
            </span>
            <span className="hidden sm:inline">Review</span>
          </span>
        </li>
      </ol>
    </nav>
  );
}
