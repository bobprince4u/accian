/**
 * Client-side validation for the pre-consultation form.
 *
 * Pure functions over `FormState`. Nothing here touches the DOM, React or
 * `window`, which is what makes the rules directly testable and is why the
 * step-navigation logic lives here rather than inside the component.
 *
 * This is a convenience layer, not a security boundary. The API validates the
 * same submission again and is the authority; everything here exists so an
 * applicant is told about a problem before they wait for a round trip.
 *
 * The rule set is deliberately small. The source form says blanks are fine and
 * half-formed ideas are useful, so only the fields that make a submission
 * actionable are enforced: who you are, a CV to read, and recorded consent.
 */

import {
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_REQUIRED_FIELDS,
  isPreConsultationOption,
} from "@accian/types";

import {
  ALL_FIELDS,
  REVIEW_STEP_INDEX,
  STEPS,
  type FieldDef,
  type FormState,
  maxLength,
} from "./schema";
import { validateDocuments } from "./files";

/** Error keys that belong to the documents section. */
const DOCUMENT_FIELDS: ReadonlySet<string> = new Set([
  ...PRE_CONSULTATION_DOCUMENTS.map((slot) => slot.field),
  // `validateDocuments` keys the aggregate-size failure here, because no
  // single slot is at fault.
  "documents",
]);

/** Field name to message. A field absent from the map is valid. */
export type FieldErrors = Record<string, string>;

/**
 * Email check.
 *
 * Kept intentionally loose — one `@`, a dot in the domain, no whitespace. A
 * stricter pattern rejects addresses that are perfectly valid, and the only
 * thing that can truly confirm an address is delivery. Characters that could
 * break an email header are rejected because the API rejects them too, so
 * catching them here saves a pointless round trip.
 */
export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) &&
  value.trim().length <= 160 &&
  !/[\r\n,;<>]/.test(value);

/** `YYYY-MM-DD`, and a date that exists. Matches the API's rule exactly. */
export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Rejects 2026-02-31, which Date would roll forward into March.
  return parsed.toISOString().slice(0, 10) === value;
};

/** Human label for a field, used in error messages. */
const labelFor = (name: string): string =>
  ALL_FIELDS.find((field) => field.name === name)?.label ?? name;

/**
 * Validate one field in isolation.
 *
 * Returns `null` when there is nothing to say. A field that is empty and not
 * required is always valid — this function never invents a rule the schema did
 * not declare.
 */
export const validateField = (field: FieldDef, state: FormState): string | null => {
  // A hidden field cannot be corrected, so it cannot be in error.
  if (field.showWhen && !field.showWhen(state)) return null;

  if (field.kind === "checkbox") {
    const selected = state.choices[field.name] ?? [];
    const unknown = selected.filter(
      (value) => !isPreConsultationOption(field.options ?? [], value),
    );
    if (unknown.length > 0) return "Please choose from the options listed.";
    return null;
  }

  const value = (state.values[field.name] ?? "").trim();

  if (field.required && value === "") {
    return `${field.label} is required.`;
  }

  if (value === "") return null;

  if (value.length > maxLength(field.name)) {
    return `Please keep this under ${maxLength(field.name)} characters.`;
  }

  if (field.kind === "email" && !isValidEmail(value)) {
    return "Enter a valid email address, for example name@example.com.";
  }

  if (field.kind === "date" && !isValidDate(value)) {
    return "Enter a valid date.";
  }

  if (field.kind === "radio" && !isPreConsultationOption(field.options ?? [], value)) {
    return "Please choose one of the options listed.";
  }

  return null;
};

/** The consent checkbox, which has no entry in the schema's field list. */
const validateDeclaration = (state: FormState): FieldErrors => {
  if (state.values.declarationAccepted === "true") return {};
  return {
    declarationAccepted:
      "Please confirm the declaration before submitting your form.",
  };
};

/**
 * Validate everything on one step.
 *
 * The documents step also validates uploads, and the declaration step also
 * validates the consent checkbox — neither is an ordinary schema field, so
 * both are added explicitly rather than inferred.
 */
export const validateStep = (stepIndex: number, state: FormState): FieldErrors => {
  const step = STEPS[stepIndex];
  if (!step) return {};

  const errors: FieldErrors = {};

  for (const section of step.sections) {
    for (const field of section.fields) {
      const message = validateField(field, state);
      if (message) errors[field.name] = message;
    }
    if (section.documents) {
      Object.assign(errors, validateDocuments(state.documents));
    }
  }

  if (step.id === "declaration") {
    Object.assign(errors, validateDeclaration(state));
  }

  return errors;
};

/**
 * Validate the whole submission.
 *
 * Used before the final submit, so that a required answer skipped on an
 * earlier step cannot be reached only by the server rejecting it. Also used by
 * the review screen to decide whether to offer the submit button.
 */
export const validateAll = (state: FormState): FieldErrors => {
  const errors: FieldErrors = {};

  for (let index = 0; index < STEPS.length; index += 1) {
    Object.assign(errors, validateStep(index, state));
  }

  // Belt and braces: the contract's required list is the authority on what is
  // mandatory, and a field could in principle be listed there without being
  // marked required in the schema.
  for (const name of PRE_CONSULTATION_REQUIRED_FIELDS) {
    if (name === "declarationAccepted") continue;
    if (!(state.values[name] ?? "").trim() && !errors[name]) {
      errors[name] = `${labelFor(name)} is required.`;
    }
  }

  Object.assign(errors, validateDeclaration(state));
  Object.assign(errors, validateDocuments(state.documents));

  return errors;
};

/** True when nothing on this step is blocking. */
export const canLeaveStep = (stepIndex: number, state: FormState): boolean =>
  Object.keys(validateStep(stepIndex, state)).length === 0;

/**
 * The step a given field lives on.
 *
 * The review screen needs this so that "fix this" can send the applicant back
 * to the right place, and so a server-side error can be shown where the field
 * actually is rather than on whichever step happened to be open.
 *
 * Document slots are matched by name against the contract. Treating the
 * documents section as a catch-all instead would swallow every later field —
 * the declaration sits after it — and send the applicant to the wrong step.
 */
export const stepIndexForField = (name: string): number => {
  if (name === "declarationAccepted") {
    return STEPS.findIndex((step) => step.id === "declaration");
  }

  for (let index = 0; index < STEPS.length; index += 1) {
    const step = STEPS[index];
    const matches = step.sections.some(
      (section) =>
        section.fields.some((field) => field.name === name) ||
        (section.documents === true && DOCUMENT_FIELDS.has(name)),
    );
    if (matches) return index;
  }

  return 0;
};

/**
 * How far an applicant may navigate forward.
 *
 * Going back is always allowed and never loses an answer. Going forward is
 * allowed as far as the first step that is blocking, so the progress indicator
 * cannot be used to skip a required field — while still letting someone jump
 * freely around the parts they have already completed.
 */
export const furthestAllowedStep = (state: FormState): number => {
  for (let index = 0; index < STEPS.length; index += 1) {
    if (!canLeaveStep(index, state)) return index;
  }
  return REVIEW_STEP_INDEX;
};
