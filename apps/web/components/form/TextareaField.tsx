"use client";

import type { ReactNode } from "react";

import FieldError from "./FieldError";
import {
  describedBy,
  fieldIds,
  helpClass,
  inputClass,
  labelClass,
} from "./fieldSupport";

export interface TextareaFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  required?: boolean;
  help?: ReactNode;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

/**
 * A multi-line answer.
 *
 * The counter appears only once the applicant is within 200 characters of the
 * limit. Shown permanently it reads as a target to fill, which is the opposite
 * of what this form wants — the source form's own instruction is that
 * half-formed ideas are useful.
 *
 * `aria-live="polite"` on the counter means the warning is announced when it
 * starts to matter, rather than on every keystroke.
 */
export default function TextareaField({
  name,
  label,
  value,
  onChange,
  onBlur,
  rows = 4,
  required = false,
  help,
  placeholder,
  maxLength,
  error,
}: TextareaFieldProps) {
  const ids = fieldIds(name);
  const remaining = maxLength ? maxLength - value.length : null;
  const showCounter = remaining !== null && remaining <= 200;

  return (
    <div>
      <label htmlFor={ids.input} className={labelClass}>
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
      </label>

      <textarea
        id={ids.input}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, Boolean(help), Boolean(error))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${inputClass(Boolean(error))} resize-y min-h-24 leading-relaxed`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {help && (
            <p id={ids.help} className={helpClass}>
              {help}
            </p>
          )}
          <FieldError id={ids.error} message={error} />
        </div>

        {showCounter && (
          <p
            aria-live="polite"
            className={`mt-1.5 shrink-0 text-xs font-light tabular-nums ${
              remaining <= 0 ? "text-red-600" : "text-[#666666]"
            }`}
          >
            {remaining <= 0
              ? "Character limit reached"
              : `${remaining} characters left`}
          </p>
        )}
      </div>
    </div>
  );
}
