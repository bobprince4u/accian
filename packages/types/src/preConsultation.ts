/**
 * Pre-consultation contract.
 *
 * The PhD Research Pathway pre-consultation form is submitted by an applicant
 * before their consultation call. It replaces the download-fill-email flow the
 * Research Support page used to describe.
 *
 * This module is the single source of truth for three things that `apps/web`
 * and `apps/api` must agree on exactly:
 *
 *   - the field names carried by the multipart body,
 *   - the permitted values of every choice field,
 *   - the document slots, and the file limits applied to them.
 *
 * Choice fields carry an ASCII `value` and a human `label`. The value is what
 * crosses the wire and what the API validates against; the label is what the
 * consultant reads in the notification email. Keeping them apart means the
 * wording of an option can be corrected without invalidating submissions that
 * are already in flight, and means no option value depends on an em dash
 * surviving a round trip.
 *
 * As with the rest of this package: types are erased at runtime, so none of
 * this is a substitute for the API's own validation. The backend stays
 * authoritative.
 */

/** One selectable option. `value` crosses the wire; `label` is displayed. */
export interface PreConsultationOption {
  readonly value: string;
  readonly label: string;
}

/** Section 5 — research methods the applicant has actually used. */
export const RESEARCH_METHODS: readonly PreConsultationOption[] = [
  { value: "quantitative", label: "Quantitative" },
  { value: "qualitative", label: "Qualitative" },
  { value: "mixed-methods", label: "Mixed methods" },
  { value: "systematic-review", label: "Systematic review" },
  { value: "lab-or-fieldwork", label: "Lab or fieldwork" },
  { value: "none-yet", label: "None yet" },
] as const;

/** Section 7 — intended programme. Single choice. */
export const INTENDED_PROGRAMMES: readonly PreConsultationOption[] = [
  { value: "phd-direct", label: "PhD (direct entry)" },
  { value: "mphil-to-phd", label: "MPhil leading to PhD" },
  { value: "mres-then-phd", label: "MRes then PhD" },
  { value: "msc-by-research", label: "MSc by Research" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

/** Section 7 — preferred mode of study. Single choice. */
export const STUDY_MODES: readonly PreConsultationOption[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "either", label: "Open to either" },
] as const;

/** Section 7 — countries the applicant would study in. Multiple choice. */
export const STUDY_COUNTRIES: readonly PreConsultationOption[] = [
  { value: "uk", label: "United Kingdom" },
  { value: "ireland", label: "Ireland" },
  { value: "europe", label: "Europe" },
  { value: "usa", label: "United States" },
  { value: "canada", label: "Canada" },
  { value: "anz", label: "Australia or New Zealand" },
] as const;

/** Section 8 — what the applicant needs covered. Multiple choice. */
export const FUNDING_NEEDS: readonly PreConsultationOption[] = [
  { value: "full-funding", label: "Full funding only (fees and stipend)" },
  { value: "fees-only", label: "Fees only — can support myself" },
  { value: "partial", label: "Would consider partial funding" },
  { value: "self-funded", label: "Self-funded" },
  { value: "sponsored", label: "Sponsored (employer or government)" },
  { value: "undecided", label: "Not yet decided" },
] as const;

/**
 * Section 9 — support required.
 *
 * These map to the phases of the Research Pathway package, which is why the
 * order is fixed and matches the package's own sequence.
 */
export const SUPPORT_AREAS: readonly PreConsultationOption[] = [
  { value: "topic-identification", label: "Identifying a research topic" },
  { value: "idea-refinement", label: "Refining an existing research idea" },
  { value: "supervisor-matching", label: "Supervisor matching" },
  { value: "proposal-development", label: "Proposal development" },
  { value: "application-guidance", label: "Application guidance" },
  { value: "interview-preparation", label: "Interview preparation" },
] as const;

/** Section 6 — whether the applicant has conducted research before. */
export const RESEARCH_EXPERIENCE_ANSWERS: readonly PreConsultationOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

/** Look up an option's label, falling back to the raw value. */
export const labelForOption = (
  options: readonly PreConsultationOption[],
  value: string,
): string => options.find((o) => o.value === value)?.label ?? value;

/** True when `value` is one of `options`. */
export const isPreConsultationOption = (
  options: readonly PreConsultationOption[],
  value: unknown,
): boolean =>
  typeof value === "string" && options.some((o) => o.value === value);

// ── Documents ────────────────────────────────────────────────────────────────

/** A document the applicant may (or must) enclose. */
export interface PreConsultationDocumentSlot {
  /** Multipart field name. Also the key used in the email's document list. */
  readonly field: string;
  readonly label: string;
  readonly required: boolean;
  /** Upper bound on files accepted in this slot. */
  readonly maxFiles: number;
  /** Supporting text shown beneath the control. */
  readonly help?: string;
}

/**
 * Section 11 — documents enclosed.
 *
 * This list drives three things at once: the upload controls rendered by the
 * web form, the `multer` field configuration on the API, and the document
 * section of the notification email. They cannot drift apart because there is
 * only one list.
 */
export const PRE_CONSULTATION_DOCUMENTS: readonly PreConsultationDocumentSlot[] =
  [
    {
      field: "cv",
      label: "CV or academic résumé",
      required: true,
      maxFiles: 1,
    },
    {
      field: "transcripts",
      label: "Degree transcripts",
      required: false,
      maxFiles: 3,
    },
    {
      field: "certificates",
      label: "Degree certificates",
      required: false,
      maxFiles: 3,
    },
    {
      field: "proposal",
      label: "Draft proposal or concept note",
      required: false,
      maxFiles: 1,
    },
    {
      field: "personalStatement",
      label: "Personal statement",
      required: false,
      maxFiles: 1,
    },
    {
      field: "englishTest",
      label: "English language test result",
      required: false,
      maxFiles: 1,
      help: "IELTS, TOEFL, PTE or equivalent — with the date sat.",
    },
  ] as const;

/**
 * File limits, applied on both sides.
 *
 * The aggregate cap matters as much as the per-file one: a transactional email
 * provider rejects an oversized message outright, and base64 encoding inflates
 * attachments by roughly a third on the way out. Ten files at the per-file cap
 * would exceed what can actually be delivered, so the total is bounded too.
 */
export const PRE_CONSULTATION_FILE_LIMITS = {
  /** Per file, in bytes. */
  maxFileBytes: 8 * 1024 * 1024,
  /** Across every uploaded file in one submission, in bytes. */
  maxTotalBytes: 20 * 1024 * 1024,
  /** Across every slot. Equals the sum of the slots' `maxFiles`. */
  maxFiles: 10,
  /** Lowercase, leading dot. */
  allowedExtensions: [".pdf", ".doc", ".docx"] as readonly string[],
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as readonly string[],
} as const;

/** Human description of what may be uploaded, for hint text and errors. */
export const PRE_CONSULTATION_ACCEPT_HINT = "PDF, DOC or DOCX, up to 8MB each";

// ── Submission ───────────────────────────────────────────────────────────────

/**
 * The text fields of a pre-consultation submission.
 *
 * Every field is a string or a string array so that the shape maps directly
 * onto a multipart body, where there are no other types. Multi-choice fields
 * arrive as repeated parts and are normalised to arrays by the API.
 *
 * Only the fields named in `PRE_CONSULTATION_REQUIRED_FIELDS` are mandatory.
 * The source form is explicit that blanks are acceptable, and the web form
 * does not require what the paper form did not.
 */
export interface PreConsultationSubmission {
  // 1 — Personal information
  fullName: string;
  nationality?: string;
  residence?: string;
  email: string;
  phone?: string;
  bestTimeToCall?: string;

  // 2 — Academic background
  highestQualification?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  finalGrade?: string;
  dissertationTitle?: string;
  keySubjects?: string;
  recordExplanation?: string;

  // 3 — Professional and relevant experience
  currentRole?: string;
  yearsOfExperience?: string;
  relevantExperience?: string;

  // 4 — Research interests
  broadArea?: string;
  researchIdea?: string;
  realWorldArea?: string;
  avoidAreas?: string;

  // 5 — Skills and technical background
  analyticalSkills?: string;
  toolsAndSoftware?: string;
  researchMethods?: string[];

  // 6 — Research experience
  hasConductedResearch?: string;
  researchDescription?: string;
  publications?: string;

  // 7 — Study intentions
  intendedProgramme?: string;
  studyMode?: string;
  studyCountries?: string[];
  preferredStartDate?: string;
  targetInstitutions?: string;
  academicsContacted?: string;
  studyConstraints?: string;

  // 8 — Funding
  fundingNeeds?: string[];
  scholarshipsApplied?: string;

  // 9 — Support required
  supportAreas?: string[];
  deadline?: string;

  // 10 — Motivation and goals
  motivation?: string;
  fiveYearGoal?: string;

  // 12 — Additional information
  additionalInformation?: string;

  // 13 — Declaration
  declarationAccepted: string;
  declarationName: string;
  declarationSignature?: string;
  declarationDate: string;
}

/**
 * Fields without which a submission is rejected.
 *
 * Deliberately short. The brief is explicit that not every field should be
 * mandatory; these six are what make a submission actionable — someone to
 * contact, a CV to read, and a recorded consent to act on it.
 *
 * `cv` is not in this list because it is a file, not a text field; it is
 * required separately by its document slot.
 */
export const PRE_CONSULTATION_REQUIRED_FIELDS = [
  "fullName",
  "email",
  "declarationAccepted",
  "declarationName",
  "declarationDate",
] as const;

export type PreConsultationRequiredField =
  (typeof PRE_CONSULTATION_REQUIRED_FIELDS)[number];

/** Maximum accepted length per text field, by field name. */
export const PRE_CONSULTATION_MAX_LENGTHS: Readonly<Record<string, number>> = {
  fullName: 120,
  nationality: 100,
  residence: 160,
  email: 160,
  phone: 40,
  bestTimeToCall: 200,
  highestQualification: 160,
  fieldOfStudy: 160,
  institution: 160,
  graduationYear: 12,
  finalGrade: 80,
  dissertationTitle: 300,
  keySubjects: 2000,
  recordExplanation: 2000,
  currentRole: 160,
  yearsOfExperience: 40,
  relevantExperience: 3000,
  broadArea: 300,
  researchIdea: 5000,
  realWorldArea: 3000,
  avoidAreas: 2000,
  analyticalSkills: 2000,
  toolsAndSoftware: 2000,
  hasConductedResearch: 10,
  researchDescription: 3000,
  publications: 3000,
  // Single-choice fields are read back out of the sanitised text map, so they
  // must appear here or they would always sanitise to an empty string — and a
  // value that is never populated can never be validated either.
  intendedProgramme: 60,
  studyMode: 40,
  preferredStartDate: 60,
  targetInstitutions: 2000,
  academicsContacted: 3000,
  studyConstraints: 2000,
  scholarshipsApplied: 2000,
  deadline: 200,
  motivation: 5000,
  fiveYearGoal: 3000,
  additionalInformation: 5000,
  declarationAccepted: 10,
  declarationName: 120,
  declarationSignature: 120,
  declarationDate: 40,
};

/** The declaration the applicant must confirm before submitting. */
export const PRE_CONSULTATION_DECLARATION =
  "I confirm that the information provided is accurate to the best of my " +
  "knowledge, and I consent to Accian Limited using it to provide research " +
  "consultancy support.";

/** How the submission is handled, shown alongside the declaration. */
export const PRE_CONSULTATION_PRIVACY_NOTICE =
  "Your answers and documents are held by Accian Limited solely to advise on " +
  "your application, shared only with the consultant assigned to you, and " +
  "never sent to a university without your agreement. You may ask us to " +
  "delete them at any time.";

/** What `POST /api/pre-consultation` returns inside its success envelope. */
export interface PreConsultationResult {
  /** Quoted back to the applicant, e.g. `ACC-PC-2026-7F3K9Q`. */
  referenceId: string;
  /** ISO 8601, set by the server. */
  submittedAt: string;
}
