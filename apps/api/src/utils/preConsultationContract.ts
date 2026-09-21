/**
 * The pre-consultation contract, restated for the API's runtime.
 *
 * `@accian/types` is the single definition of this contract, but the API may
 * only import it with `import type`. The reason is documented at length in
 * `utils/serializers.ts`: the API's hosting root is `apps/api`, where the
 * workspace symlink is not guaranteed to exist, so a `require("@accian/types")`
 * in emitted JavaScript passes every local check and then fails in production.
 *
 * The values the API needs at runtime — which option strings are permitted,
 * which document slots exist, what the file limits are — therefore live here,
 * as an ordinary module with no workspace dependency.
 *
 * Two copies of a contract is exactly the drift risk the shared package was
 * created to remove, so the copies are not left to trust:
 * `tests/preConsultationContract.test.ts` imports both and asserts they are
 * identical, field for field. That test runs in the workspace, where
 * `@accian/types` does resolve. A change to one side without the other fails
 * the suite rather than reaching production.
 */

/** One selectable option. `value` crosses the wire; `label` is displayed. */
export interface ContractOption {
  readonly value: string;
  readonly label: string;
}

export const RESEARCH_METHODS: readonly ContractOption[] = [
  { value: "quantitative", label: "Quantitative" },
  { value: "qualitative", label: "Qualitative" },
  { value: "mixed-methods", label: "Mixed methods" },
  { value: "systematic-review", label: "Systematic review" },
  { value: "lab-or-fieldwork", label: "Lab or fieldwork" },
  { value: "none-yet", label: "None yet" },
];

export const INTENDED_PROGRAMMES: readonly ContractOption[] = [
  { value: "phd-direct", label: "PhD (direct entry)" },
  { value: "mphil-to-phd", label: "MPhil leading to PhD" },
  { value: "mres-then-phd", label: "MRes then PhD" },
  { value: "msc-by-research", label: "MSc by Research" },
  { value: "not-sure", label: "Not sure yet" },
];

export const STUDY_MODES: readonly ContractOption[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "either", label: "Open to either" },
];

export const STUDY_COUNTRIES: readonly ContractOption[] = [
  { value: "uk", label: "United Kingdom" },
  { value: "ireland", label: "Ireland" },
  { value: "europe", label: "Europe" },
  { value: "usa", label: "United States" },
  { value: "canada", label: "Canada" },
  { value: "anz", label: "Australia or New Zealand" },
];

export const FUNDING_NEEDS: readonly ContractOption[] = [
  { value: "full-funding", label: "Full funding only (fees and stipend)" },
  { value: "fees-only", label: "Fees only — can support myself" },
  { value: "partial", label: "Would consider partial funding" },
  { value: "self-funded", label: "Self-funded" },
  { value: "sponsored", label: "Sponsored (employer or government)" },
  { value: "undecided", label: "Not yet decided" },
];

export const SUPPORT_AREAS: readonly ContractOption[] = [
  { value: "topic-identification", label: "Identifying a research topic" },
  { value: "idea-refinement", label: "Refining an existing research idea" },
  { value: "supervisor-matching", label: "Supervisor matching" },
  { value: "proposal-development", label: "Proposal development" },
  { value: "application-guidance", label: "Application guidance" },
  { value: "interview-preparation", label: "Interview preparation" },
];

export const RESEARCH_EXPERIENCE_ANSWERS: readonly ContractOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export interface ContractDocumentSlot {
  readonly field: string;
  readonly label: string;
  readonly required: boolean;
  readonly maxFiles: number;
  readonly help?: string;
}

export const PRE_CONSULTATION_DOCUMENTS: readonly ContractDocumentSlot[] = [
  { field: "cv", label: "CV or academic résumé", required: true, maxFiles: 1 },
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
];

export const PRE_CONSULTATION_FILE_LIMITS = {
  maxFileBytes: 8 * 1024 * 1024,
  maxTotalBytes: 20 * 1024 * 1024,
  maxFiles: 10,
  allowedExtensions: [".pdf", ".doc", ".docx"] as readonly string[],
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as readonly string[],
};

export const PRE_CONSULTATION_REQUIRED_FIELDS: readonly string[] = [
  "fullName",
  "email",
  "declarationAccepted",
  "declarationName",
  "declarationDate",
];

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

export const PRE_CONSULTATION_DECLARATION =
  "I confirm that the information provided is accurate to the best of my " +
  "knowledge, and I consent to Accian Limited using it to provide research " +
  "consultancy support.";

export const PRE_CONSULTATION_PRIVACY_NOTICE =
  "Your answers and documents are held by Accian Limited solely to advise on " +
  "your application, shared only with the consultant assigned to you, and " +
  "never sent to a university without your agreement. You may ask us to " +
  "delete them at any time.";

/** Every text field the API accepts, derived from the length table. */
export const PRE_CONSULTATION_TEXT_FIELDS: readonly string[] = Object.keys(
  PRE_CONSULTATION_MAX_LENGTHS,
);

/** Multi-choice fields, and the option list each is validated against. */
export const MULTI_CHOICE_FIELDS: Readonly<
  Record<string, readonly ContractOption[]>
> = {
  researchMethods: RESEARCH_METHODS,
  studyCountries: STUDY_COUNTRIES,
  fundingNeeds: FUNDING_NEEDS,
  supportAreas: SUPPORT_AREAS,
};

/** Single-choice fields, and the option list each is validated against. */
export const SINGLE_CHOICE_FIELDS: Readonly<
  Record<string, readonly ContractOption[]>
> = {
  intendedProgramme: INTENDED_PROGRAMMES,
  studyMode: STUDY_MODES,
  hasConductedResearch: RESEARCH_EXPERIENCE_ANSWERS,
};

/** Look up an option's label, falling back to the raw value. */
export const labelForOption = (
  options: readonly ContractOption[],
  value: string,
): string => options.find((o) => o.value === value)?.label ?? value;
