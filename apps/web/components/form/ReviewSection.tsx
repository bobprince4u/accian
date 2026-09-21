"use client";

import { Pencil } from "lucide-react";
import {
  PRE_CONSULTATION_DECLARATION,
  PRE_CONSULTATION_DOCUMENTS,
  labelForOption,
} from "@accian/types";

import { formatBytes } from "../../lib/preConsultation/files";
import type {
  FieldDef,
  FormState,
  SectionDef,
} from "../../lib/preConsultation/schema";

export interface ReviewSectionProps {
  section: SectionDef;
  state: FormState;
  /** Sends the applicant back to the step this section sits on. */
  onEdit: () => void;
  /** Field names that failed the final check, so the review can mark them. */
  errors?: Record<string, string>;
}

const NOT_PROVIDED = "Not provided";

/** One answer, ready to render. `text` is empty when nothing was given. */
interface Row {
  key: string;
  label: string;
  text: string;
  /** Preserve line breaks — long answers were typed with them. */
  multiline?: boolean;
  /** Render as a bulleted list rather than a paragraph. */
  items?: string[];
}

const rowForField = (field: FieldDef, state: FormState): Row => {
  if (field.kind === "checkbox") {
    const selected = state.choices[field.name] ?? [];
    return {
      key: field.name,
      label: field.label,
      text: selected.length > 0 ? "" : NOT_PROVIDED,
      items: selected.map((value) => labelForOption(field.options ?? [], value)),
    };
  }

  const value = (state.values[field.name] ?? "").trim();

  if (field.kind === "radio") {
    return {
      key: field.name,
      label: field.label,
      text: value ? labelForOption(field.options ?? [], value) : NOT_PROVIDED,
    };
  }

  return {
    key: field.name,
    label: field.label,
    text: value || NOT_PROVIDED,
    multiline: field.kind === "textarea",
  };
};

const documentRows = (state: FormState): Row[] =>
  PRE_CONSULTATION_DOCUMENTS.map((slot) => {
    const files = state.documents[slot.field] ?? [];
    return {
      key: slot.field,
      label: slot.label,
      text: files.length > 0 ? "" : NOT_PROVIDED,
      items: files.map((file) => `${file.name} (${formatBytes(file.size)})`),
    };
  });

/**
 * One section of the form, shown back to the applicant before they submit.
 *
 * Every field appears, including the ones left blank — those read
 * "Not provided", the same wording the notification email uses. Hiding empty
 * answers would make the review screen disagree with what is actually sent,
 * and it is exactly the blank someone meant to fill that a review is for.
 *
 * Fields hidden by a `showWhen` rule are the one exception: an answer the form
 * never asked for is not an answer withheld.
 *
 * Laid out as a `<dl>`, so a screen reader announces each label with its value
 * rather than reading two disconnected columns.
 */
export default function ReviewSection({
  section,
  state,
  onEdit,
  errors = {},
}: ReviewSectionProps) {
  const rows: Row[] = [
    ...section.fields
      .filter((field) => !field.showWhen || field.showWhen(state))
      .map((field) => rowForField(field, state)),
    ...(section.documents ? documentRows(state) : []),
  ];

  if (section.declaration) {
    rows.push({
      key: "declarationAccepted",
      label: "Declaration confirmed",
      text:
        state.values.declarationAccepted === "true"
          ? PRE_CONSULTATION_DECLARATION
          : NOT_PROVIDED,
      multiline: true,
    });
  }

  const sectionErrors = rows.filter((row) => errors[row.key]);

  return (
    <section
      aria-labelledby={`review-${section.number}`}
      className="rounded-xl border border-[#E8E4DC] bg-white p-5 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#E8E4DC] pb-3">
        <h3
          id={`review-${section.number}`}
          className="flex items-baseline gap-2.5 text-sm font-bold tracking-tight text-[#0D0D0D]"
        >
          <span aria-hidden="true" className="text-xs font-bold tabular-nums text-[#1B4FFF]">
            {String(section.number).padStart(2, "0")}
          </span>
          {section.title}
        </h3>

        <button
          type="button"
          onClick={onEdit}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B4FFF] transition-colors hover:bg-[#1B4FFF]/[0.08] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
        >
          <Pencil size={12} aria-hidden="true" />
          Edit
          <span className="sr-only"> {section.title}</span>
        </button>
      </div>

      {sectionErrors.length > 0 && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
          <span aria-hidden="true">⚠</span>
          <span>
            {sectionErrors.length === 1
              ? "One answer in this section still needs attention."
              : `${sectionErrors.length} answers in this section still need attention.`}
          </span>
        </p>
      )}

      <dl className="space-y-3.5">
        {rows.map((row) => {
          const invalid = Boolean(errors[row.key]);
          const blank = row.text === NOT_PROVIDED;

          return (
            <div key={row.key} className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
              <dt className="text-xs font-semibold tracking-wide uppercase text-[#666666]">
                {row.label}
              </dt>
              <dd
                className={[
                  "min-w-0 text-sm leading-relaxed",
                  invalid
                    ? "font-medium text-red-700"
                    : blank
                      ? "font-light italic text-[#999999]"
                      : "font-light text-[#0D0D0D]",
                ].join(" ")}
              >
                {row.items && row.items.length > 0 ? (
                  <ul className="space-y-1">
                    {row.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="text-[#1B4FFF]">
                          •
                        </span>
                        <span className="min-w-0 break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={row.multiline ? "whitespace-pre-wrap break-words" : "break-words"}>
                    {row.text}
                  </span>
                )}

                {invalid && (
                  <span className="mt-1 block text-xs font-medium text-red-700">
                    ⚠ {errors[row.key]}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
