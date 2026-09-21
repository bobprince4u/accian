/**
 * Turning form state into a request, and back into a result.
 *
 * Kept apart from the component so the payload shape can be tested without
 * rendering anything, and so the component holds no knowledge of the wire
 * format beyond calling `submitPreConsultation`.
 *
 * No secret, credential or recipient address appears here. The browser posts
 * to the API, and the API is the only thing that knows where a submission is
 * delivered or how to authenticate with the mail provider.
 */

import { PRE_CONSULTATION_DOCUMENTS } from "@accian/types";

import { API_URL } from "../../config/api";
import { ALL_FIELDS, type FormState } from "./schema";

/** Multi-choice field names, taken from the schema rather than restated. */
const CHECKBOX_FIELDS = ALL_FIELDS.filter(
  (field) => field.kind === "checkbox",
).map((field) => field.name);

/** A blank form. */
export const initialFormState = (): FormState => ({
  values: {},
  choices: Object.fromEntries(CHECKBOX_FIELDS.map((name) => [name, []])),
  documents: Object.fromEntries(
    PRE_CONSULTATION_DOCUMENTS.map((slot) => [slot.field, [] as File[]]),
  ),
});

/**
 * Build the multipart body.
 *
 * Multi-choice answers are appended once per selection, which is what a native
 * checkbox group would post and what the API's `normalizeToArray` expects.
 *
 * Empty text values are skipped. The API treats a missing field and an empty
 * one identically, and omitting them keeps the request small — a form where
 * most answers are optional would otherwise send forty empty parts.
 */
export const buildFormData = (state: FormState): FormData => {
  const body = new FormData();

  for (const [name, value] of Object.entries(state.values)) {
    const trimmed = (value ?? "").trim();
    if (trimmed !== "") body.append(name, trimmed);
  }

  for (const [name, selected] of Object.entries(state.choices)) {
    for (const value of selected) body.append(name, value);
  }

  for (const slot of PRE_CONSULTATION_DOCUMENTS) {
    for (const file of state.documents[slot.field] ?? []) {
      body.append(slot.field, file, file.name);
    }
  }

  return body;
};

/** What the API returns on success. */
export interface SubmissionSuccess {
  ok: true;
  referenceId: string;
  submittedAt: string;
}

/** What the caller needs in order to explain a failure. */
export interface SubmissionFailure {
  ok: false;
  /** Shown at the top of the form. */
  message: string;
  /** Field name to message, when the API named specific fields. */
  fieldErrors?: Record<string, string>;
}

export type SubmissionOutcome = SubmissionSuccess | SubmissionFailure;

const NETWORK_MESSAGE =
  "We couldn't reach our servers. Please check your connection and try again.";

const GENERIC_MESSAGE =
  "We couldn't submit your form right now. Please try again in a few moments.";

/** Map the API's `errors` array onto field names. */
const readFieldErrors = (payload: unknown): Record<string, string> | undefined => {
  if (!payload || typeof payload !== "object") return undefined;
  const errors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return undefined;

  const mapped: Record<string, string> = {};
  for (const entry of errors) {
    if (!entry || typeof entry !== "object") continue;
    const { path, msg } = entry as { path?: unknown; msg?: unknown };
    if (typeof path === "string" && typeof msg === "string") mapped[path] = msg;
  }

  return Object.keys(mapped).length > 0 ? mapped : undefined;
};

/**
 * Submit the form.
 *
 * Never throws. Every failure mode — a validation rejection, a rate limit, a
 * dead API, an unparseable response — comes back as a `SubmissionFailure` with
 * a message that is safe and useful to show, so the component has one path to
 * render rather than a try/catch around its own state updates.
 *
 * Success is reported only on a 2xx that actually carried a reference. The
 * brief is explicit that an applicant must not be told their submission was
 * received unless the backend confirmed it, and a 200 with an unexpected body
 * is not a confirmation.
 */
export const submitPreConsultation = async (
  state: FormState,
  signal?: AbortSignal,
): Promise<SubmissionOutcome> => {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/pre-consultation`, {
      method: "POST",
      // No Content-Type header: the browser must set the multipart boundary
      // itself, and setting it by hand produces a body the server cannot parse.
      body: buildFormData(state),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, message: "Submission cancelled." };
    }
    return { ok: false, message: NETWORK_MESSAGE };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // A body that is not JSON (an HTML error page from a proxy, say) tells the
    // applicant nothing, so it is not quoted back to them.
    payload = null;
  }

  if (!response.ok) {
    const apiMessage =
      payload && typeof payload === "object"
        ? (payload as { message?: unknown }).message
        : undefined;

    return {
      ok: false,
      message: typeof apiMessage === "string" && apiMessage ? apiMessage : GENERIC_MESSAGE,
      fieldErrors: readFieldErrors(payload),
    };
  }

  const data =
    payload && typeof payload === "object"
      ? (payload as { data?: { referenceId?: unknown; submittedAt?: unknown } }).data
      : undefined;

  if (!data || typeof data.referenceId !== "string") {
    return { ok: false, message: GENERIC_MESSAGE };
  }

  return {
    ok: true,
    referenceId: data.referenceId,
    submittedAt:
      typeof data.submittedAt === "string" ? data.submittedAt : new Date().toISOString(),
  };
};
