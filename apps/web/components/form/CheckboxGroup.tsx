"use client";

import type { PreConsultationOption } from "@accian/types";

import FieldError from "./FieldError";
import { fieldIds, helpClass } from "./fieldSupport";

export interface CheckboxGroupProps {
  name: string;
  label: string;
  options: readonly PreConsultationOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  help?: string;
  error?: string;
  /** Hide the legend when the section heading already asks the question. */
  hideLabel?: boolean;
}

/**
 * Several choices, rendered as selectable tiles.
 *
 * Toggling preserves the order declared in the contract rather than the order
 * the applicant clicked, so the notification email lists options in the same
 * sequence as the paper form regardless of how they were ticked.
 */
export default function CheckboxGroup({
  name,
  label,
  options,
  selected,
  onChange,
  help,
  error,
  hideLabel = false,
}: CheckboxGroupProps) {
  const ids = fieldIds(name);

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((entry) => entry !== value)
      : [...selected, value];
    onChange(options.filter((option) => next.includes(option.value)).map((o) => o.value));
  };

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [help ? ids.help : null, error ? ids.error : null].filter(Boolean).join(" ") ||
        undefined
      }
    >
      <legend
        className={
          hideLabel
            ? "sr-only"
            : "block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-3"
        }
      >
        {label}
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={[
                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer",
                "transition-colors duration-150",
                "focus-within:ring-2 focus-within:ring-[#1B4FFF]/30 focus-within:border-[#1B4FFF]",
                checked
                  ? "border-[#1B4FFF] bg-[#1B4FFF]/[0.06]"
                  : "border-[#D8D3C9] bg-white hover:border-[#0D0D0D]/40",
              ].join(" ")}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 shrink-0 rounded accent-[#1B4FFF] cursor-pointer"
              />
              <span
                className={`text-sm leading-snug ${
                  checked ? "font-medium text-[#0D0D0D]" : "font-light text-[#0D0D0D]"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {help && (
        <p id={ids.help} className={helpClass}>
          {help}
        </p>
      )}
      <FieldError id={ids.error} message={error} />
    </fieldset>
  );
}
