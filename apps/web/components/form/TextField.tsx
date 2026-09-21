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

export interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Blur is when a field is first eligible to show an error. */
  onBlur?: () => void;
  type?: "text" | "email" | "tel" | "date" | "number";
  required?: boolean;
  help?: ReactNode;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  error?: string;
  /** Latest date accepted, for a date input. */
  max?: string;
}

/**
 * A single-line input with its label, help text and error message.
 *
 * `required` renders both an asterisk and the word "required" — the asterisk
 * alone is a convention, not information, and is hidden from assistive
 * technology because `aria-required` already says it.
 */
export default function TextField({
  name,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required = false,
  help,
  placeholder,
  autoComplete,
  maxLength,
  error,
  max,
}: TextFieldProps) {
  const ids = fieldIds(name);

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

      <input
        id={ids.input}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, Boolean(help), Boolean(error))}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        max={max}
        className={inputClass(Boolean(error))}
      />

      {help && (
        <p id={ids.help} className={helpClass}>
          {help}
        </p>
      )}
      <FieldError id={ids.error} message={error} />
    </div>
  );
}
