"use client";

import type { PreConsultationOption } from "@accian/types";

import FieldError from "./FieldError";
import { fieldIds, helpClass } from "./fieldSupport";

export interface RadioGroupProps {
  name: string;
  label: string;
  options: readonly PreConsultationOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  help?: string;
  error?: string;
}

/**
 * A single choice, rendered as selectable tiles.
 *
 * A real `<fieldset>` and `<legend>`, so the group's question is announced
 * once before the options rather than repeated into each label. The native
 * radio is kept in the accessibility tree and visually present — hiding it
 * would take keyboard focus and arrow-key navigation with it — and the tile
 * shows focus with `focus-within`.
 *
 * The source form asks the applicant to "delete all other options and leave
 * only the one applicable", which is a radio group on paper.
 */
export default function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
  help,
  error,
}: RadioGroupProps) {
  const ids = fieldIds(name);

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [help ? ids.help : null, error ? ids.error : null].filter(Boolean).join(" ") ||
        undefined
      }
    >
      <legend className="block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-3">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-[#1B4FFF]">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={[
                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer",
                "transition-colors duration-150",
                "focus-within:ring-2 focus-within:ring-[#1B4FFF]/30 focus-within:border-[#1B4FFF]",
                selected
                  ? "border-[#1B4FFF] bg-[#1B4FFF]/[0.06]"
                  : error
                    ? "border-red-300 bg-white hover:border-red-400"
                    : "border-[#D8D3C9] bg-white hover:border-[#0D0D0D]/40",
              ].join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 shrink-0 accent-[#1B4FFF] cursor-pointer"
              />
              <span
                className={`text-sm leading-snug ${
                  selected ? "font-medium text-[#0D0D0D]" : "font-light text-[#0D0D0D]"
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
