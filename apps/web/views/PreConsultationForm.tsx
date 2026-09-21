"use client";

/**
 * The PhD Research Pathway pre-consultation form.
 *
 * Replaces the download-fill-email flow the Research Support page used to
 * describe: the applicant completes this, attaches their documents, and the
 * API delivers the submission to the team.
 *
 * Structure of the state:
 *
 *   - `state` holds every answer and is never cleared by navigation, so going
 *     back and forward loses nothing,
 *   - `errors` holds only what is currently being shown. An error is added on
 *     blur or on a refused Continue, and removed the moment the field changes,
 *     so a corrected field stops complaining immediately,
 *   - `result` is set only once the API has confirmed the submission.
 *
 * The rules themselves live in `lib/preConsultation/`, not here. This
 * component decides when to ask; it does not decide what is valid.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import {
  PRE_CONSULTATION_DECLARATION,
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_PRIVACY_NOTICE,
} from "@accian/types";

import CheckboxGroup from "@/components/form/CheckboxGroup";
import FieldError from "@/components/form/FieldError";
import FileUpload from "@/components/form/FileUpload";
import FormSection from "@/components/form/FormSection";
import ProgressIndicator from "@/components/form/ProgressIndicator";
import RadioGroup from "@/components/form/RadioGroup";
import ReviewSection from "@/components/form/ReviewSection";
import SubmissionSuccess from "@/components/form/SubmissionSuccess";
import TextField from "@/components/form/TextField";
import TextareaField from "@/components/form/TextareaField";
import { fieldIds } from "@/components/form/fieldSupport";
import {
  ALL_SECTIONS,
  REVIEW_STEP_INDEX,
  STEPS,
  maxLength,
  type FieldDef,
  type FormState,
  type SectionDef,
} from "@/lib/preConsultation/schema";
import {
  furthestAllowedStep,
  stepIndexForField,
  validateAll,
  validateField,
  validateStep,
  type FieldErrors,
} from "@/lib/preConsultation/validation";
import {
  initialFormState,
  submitPreConsultation,
  type SubmissionSuccess as SubmissionResult,
} from "@/lib/preConsultation/payload";
import { documentCount, totalDocumentBytes, formatBytes } from "@/lib/preConsultation/files";

/** Today as `YYYY-MM-DD`, in the applicant's own timezone. */
const todayISO = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

/** The server has no timezone worth trusting, so it contributes no date. */
const serverToday = (): string => "";

/** The date only changes at midnight; nothing needs to push an update. */
const subscribeToNothing = () => () => {};

/** Which step each section belongs to, so "Edit" on the review screen lands. */
const stepIndexForSection = (section: SectionDef): number =>
  STEPS.findIndex((step) => step.sections.includes(section));

export default function PreConsultationForm() {
  const [state, setState] = useState<FormState>(initialFormState);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  /** Suppresses the scroll-and-focus effect on first paint. */
  const mounted = useRef(false);

  const onReview = step >= REVIEW_STEP_INDEX;
  const currentStep = STEPS[step];

  // The latest date the declaration may be dated.
  //
  // A clock reading cannot be taken during render — the server renders this
  // component too, and its answer would disagree with the browser's. Read as
  // an external store instead, which is precisely the case `useSyncExternalStore`
  // exists for: the server snapshot is empty, the browser's is today, and
  // React reconciles the two after hydration without a mismatch.
  const today = useSyncExternalStore(subscribeToNothing, todayISO, serverToday);

  const dirty = useMemo(
    () =>
      Object.values(state.values).some((value) => value.trim() !== "") ||
      Object.values(state.choices).some((selected) => selected.length > 0) ||
      documentCount(state.documents) > 0,
    [state],
  );

  // A long form is easy to lose to a stray Back or a closed tab. The browser
  // shows its own wording here; all we control is whether it asks at all.
  useEffect(() => {
    if (!dirty || result) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, result]);

  // Moving between steps replaces the whole screen. Focus follows, or a
  // keyboard user is left at the bottom of a page that no longer exists.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    headingRef.current?.focus();
  }, [step]);

  const setValue = useCallback((name: string, value: string) => {
    setState((previous) => ({
      ...previous,
      values: { ...previous.values, [name]: value },
    }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }, []);

  const setChoices = useCallback((name: string, selected: string[]) => {
    setState((previous) => ({
      ...previous,
      choices: { ...previous.choices, [name]: selected },
    }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }, []);

  const setDocuments = useCallback((slot: string, files: File[]) => {
    setState((previous) => ({
      ...previous,
      documents: { ...previous.documents, [slot]: files },
    }));
    setErrors((previous) => {
      if (!previous[slot] && !previous.documents) return previous;
      const next = { ...previous };
      delete next[slot];
      delete next.documents;
      return next;
    });
  }, []);

  /**
   * Blur is when a field first becomes eligible to show a message.
   *
   * Reads `state` from the closure rather than from a state updater: the
   * component re-renders on every keystroke, so by the time a blur fires the
   * closure already holds the committed value — and a validation call inside
   * an updater would be a side effect in a function React may run twice.
   */
  const checkOnBlur = (field: FieldDef) => {
    const message = validateField(field, state);
    setErrors((current) => {
      if (!message) {
        if (!current[field.name]) return current;
        const next = { ...current };
        delete next[field.name];
        return next;
      }
      return { ...current, [field.name]: message };
    });
  };

  const goTo = (index: number) => {
    setFormError(null);
    setStep(index);
  };

  const back = () => goTo(Math.max(0, step - 1));

  const continueForward = () => {
    const found = validateStep(step, state);
    if (Object.keys(found).length > 0) {
      setErrors((previous) => ({ ...previous, ...found }));
      // Focus the summary rather than the first bad field: it names every
      // problem at once, and each entry links to its field.
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    goTo(Math.min(REVIEW_STEP_INDEX, step + 1));
  };

  const submit = async () => {
    const found = validateAll(state);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError(
        "Some answers still need attention before your form can be submitted.",
      );
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const outcome = await submitPreConsultation(state);

    if (outcome.ok) {
      // Cleared before the success screen renders, so the unload guard is
      // already gone by the time the applicant navigates away from it.
      setErrors({});
      setResult(outcome);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setFormError(outcome.message);

    if (outcome.fieldErrors) {
      setErrors(outcome.fieldErrors);
      const firstField = Object.keys(outcome.fieldErrors)[0];
      const target = stepIndexForField(firstField);
      if (target !== step) setStep(target);
    }

    window.requestAnimationFrame(() => summaryRef.current?.focus());
  };

  if (result) {
    return (
      <div className="bg-[#F5F3EE] px-5 py-16 sm:px-8 sm:py-24">
        <SubmissionSuccess
          referenceId={result.referenceId}
          submittedAt={result.submittedAt}
        />
      </div>
    );
  }

  // ── Field rendering ────────────────────────────────────────────────────────

  const renderField = (field: FieldDef) => {
    const error = errors[field.name];
    const limit = maxLength(field.name);

    switch (field.kind) {
      case "checkbox":
        return (
          <CheckboxGroup
            name={field.name}
            label={field.label}
            options={field.options ?? []}
            selected={state.choices[field.name] ?? []}
            onChange={(selected) => setChoices(field.name, selected)}
            help={field.help}
            error={error}
          />
        );

      case "radio":
        return (
          <RadioGroup
            name={field.name}
            label={field.label}
            options={field.options ?? []}
            value={state.values[field.name] ?? ""}
            onChange={(value) => setValue(field.name, value)}
            required={field.required}
            help={field.help}
            error={error}
          />
        );

      case "textarea":
        return (
          <TextareaField
            name={field.name}
            label={field.label}
            value={state.values[field.name] ?? ""}
            onChange={(value) => setValue(field.name, value)}
            onBlur={() => checkOnBlur(field)}
            rows={field.rows}
            required={field.required}
            help={field.help}
            placeholder={field.placeholder}
            maxLength={limit}
            error={error}
          />
        );

      default:
        return (
          <TextField
            name={field.name}
            label={field.label}
            value={state.values[field.name] ?? ""}
            onChange={(value) => setValue(field.name, value)}
            onBlur={() => checkOnBlur(field)}
            type={field.kind === "text" ? "text" : field.kind}
            required={field.required}
            help={field.help}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            maxLength={limit}
            max={field.kind === "date" ? today || undefined : undefined}
            error={error}
          />
        );
    }
  };

  const renderSection = (section: SectionDef) => {
    const visible = section.fields.filter(
      (field) => !field.showWhen || field.showWhen(state),
    );

    return (
      <FormSection
        key={section.number}
        number={section.number}
        title={section.title}
        intro={section.intro}
      >
        {visible.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {visible.map((field) => (
              <div key={field.name} className={field.half ? "min-w-0" : "min-w-0 sm:col-span-2"}>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        {section.documents && renderDocuments()}
        {section.declaration && renderDeclaration()}
      </FormSection>
    );
  };

  const renderDocuments = () => {
    const attached = documentCount(state.documents);
    const bytes = totalDocumentBytes(state.documents);

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PRE_CONSULTATION_DOCUMENTS.map((slot) => (
            <div key={slot.field} className="min-w-0">
              <FileUpload
                name={slot.field}
                label={slot.label}
                files={state.documents[slot.field] ?? []}
                onChange={(files) => setDocuments(slot.field, files)}
                required={slot.required}
                maxFiles={slot.maxFiles}
                help={slot.help}
                error={errors[slot.field]}
              />
            </div>
          ))}
        </div>

        {attached > 0 && (
          <p aria-live="polite" className="text-xs font-light text-[#666666]">
            {attached} {attached === 1 ? "document" : "documents"} attached ·{" "}
            {formatBytes(bytes)} in total
          </p>
        )}

        <FieldError id="pc-documents-error" message={errors.documents} />
      </div>
    );
  };

  const renderDeclaration = () => {
    const ids = fieldIds("declarationAccepted");
    const accepted = state.values.declarationAccepted === "true";
    const error = errors.declarationAccepted;

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E8E4DC] bg-[#F5F3EE] px-5 py-5">
          <p className="text-sm font-light leading-relaxed text-[#0D0D0D]">
            {PRE_CONSULTATION_DECLARATION}
          </p>
          <p className="mt-3 border-t border-[#D8D3C9] pt-3 text-xs font-light leading-relaxed text-[#666666]">
            {PRE_CONSULTATION_PRIVACY_NOTICE}
          </p>
        </div>

        <label
          htmlFor={ids.input}
          className={[
            "flex items-start gap-3 rounded-lg border px-4 py-3.5 cursor-pointer",
            "transition-colors duration-150",
            "focus-within:ring-2 focus-within:ring-[#1B4FFF]/30 focus-within:border-[#1B4FFF]",
            accepted
              ? "border-[#1B4FFF] bg-[#1B4FFF]/[0.06]"
              : error
                ? "border-red-400 bg-red-50/40"
                : "border-[#D8D3C9] bg-white hover:border-[#0D0D0D]/40",
          ].join(" ")}
        >
          <input
            id={ids.input}
            name="declarationAccepted"
            type="checkbox"
            checked={accepted}
            onChange={(event) =>
              setValue("declarationAccepted", event.target.checked ? "true" : "")
            }
            required
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ids.error : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#1B4FFF] cursor-pointer"
          />
          <span className="text-sm font-light leading-relaxed text-[#0D0D0D]">
            I confirm the declaration above.
            <span aria-hidden="true" className="text-[#1B4FFF]"> *</span>
          </span>
        </label>

        <FieldError id={ids.error} message={error} />
      </div>
    );
  };

  // ── Error summary ──────────────────────────────────────────────────────────

  const visibleErrors = onReview
    ? errors
    : Object.fromEntries(
        Object.entries(errors).filter(
          ([name]) => stepIndexForField(name) === step,
        ),
      );
  const errorEntries = Object.entries(visibleErrors);

  const jumpToField = (name: string) => {
    const target = stepIndexForField(name);
    if (target !== step) {
      setStep(target);
      // The field does not exist in the DOM until the new step has painted.
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() =>
          document.getElementById(fieldIds(name).input)?.focus(),
        ),
      );
      return;
    }
    document.getElementById(fieldIds(name).input)?.focus();
  };

  const errorSummary = (errorEntries.length > 0 || formError) && (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      className="mb-7 rounded-xl border border-red-300 bg-red-50 p-5 focus:outline-none focus:ring-2 focus:ring-red-400/40"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-red-900">
        <AlertCircle size={16} aria-hidden="true" />
        {formError ?? "Please check the answers below"}
      </h3>

      {errorEntries.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {errorEntries.map(([name, message]) => (
            <li key={name} className="text-sm font-light text-red-800">
              <button
                type="button"
                onClick={() => jumpToField(name)}
                className="text-left underline decoration-red-400 underline-offset-2 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400/40 rounded"
              >
                {message}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // ── Screen ─────────────────────────────────────────────────────────────────

  const furthest = furthestAllowedStep(state);

  return (
    <div className="bg-[#F5F3EE]">
      <div ref={topRef} className="scroll-mt-24" />

      {/* Intro */}
      <header className="border-b border-[#E8E4DC] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1B4FFF]">
            PhD Research Pathway
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#0D0D0D] sm:text-4xl">
            Pre-consultation form
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[#666666] sm:text-base">
            This form gives your consultant the background they need before your
            call, so the time is spent on your research rather than on
            paperwork. It takes around fifteen minutes.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[#666666]">
            Only your name, email, CV and the declaration are required.
            Everything else is optional — leave anything blank if you are not
            sure, and say so on the call. Half-formed ideas are genuinely useful
            to us.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <ProgressIndicator
            steps={STEPS}
            current={step}
            furthest={furthest}
            onJump={goTo}
          />
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (onReview) void submit();
            else continueForward();
          }}
        >
          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 sm:p-8">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mb-7 text-xl font-bold tracking-tight text-[#0D0D0D] focus:outline-none sm:text-2xl"
            >
              {onReview ? "Review your answers" : currentStep.title}
            </h2>

            {errorSummary}

            {onReview ? (
              <>
                <p className="mb-6 text-sm font-light leading-relaxed text-[#666666]">
                  This is everything that will be sent to the Accian team.
                  Answers you left blank are shown as “Not provided” — that is
                  fine, and you can go back and add anything you want to.
                </p>
                <div className="space-y-4">
                  {ALL_SECTIONS.map((section) => (
                    <ReviewSection
                      key={section.number}
                      section={section}
                      state={state}
                      errors={errors}
                      onEdit={() => goTo(stepIndexForSection(section))}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-10">
                {currentStep.sections.map(renderSection)}
              </div>
            )}
          </div>

          {/* Back / Continue / Submit */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8D3C9] px-6 py-3 text-sm font-semibold text-[#0D0D0D] transition-colors hover:border-[#0D0D0D] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#D8D3C9] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D0D0D] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B4FFF] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : onReview ? (
                <>
                  <Send size={15} aria-hidden="true" />
                  Submit application
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          <p aria-live="polite" className="sr-only">
            {submitting ? "Submitting your form. Please wait." : ""}
          </p>

          <p className="mt-6 text-xs font-light leading-relaxed text-[#999999]">
            Your answers stay in this browser until you submit. Nothing is sent
            to us before you press Submit application.
          </p>
        </form>
      </div>
    </div>
  );
}
