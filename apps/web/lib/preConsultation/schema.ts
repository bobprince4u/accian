/**
 * The pre-consultation form, described as data.
 *
 * Every field the applicant sees is declared here once, and the view renders
 * whatever this file says. The alternative — thirteen hand-written sections of
 * JSX — would put the same label, name and validation rule in three places and
 * let them drift.
 *
 * The section numbering and wording follow the printed Pre-Consultation Form
 * exactly. Where the paper form asks a question in a particular way, that
 * phrasing is reproduced rather than improved: a consultant reads the answers
 * against the form they already know.
 *
 * Option values and field names come from `@accian/types`, so the web form and
 * the API cannot disagree about what a submission looks like.
 */

import {
  FUNDING_NEEDS,
  INTENDED_PROGRAMMES,
  PRE_CONSULTATION_MAX_LENGTHS,
  RESEARCH_EXPERIENCE_ANSWERS,
  RESEARCH_METHODS,
  STUDY_COUNTRIES,
  STUDY_MODES,
  SUPPORT_AREAS,
  type PreConsultationOption,
} from "@accian/types";

export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "textarea"
  | "radio"
  | "checkbox";

/** The values the form holds while it is being filled in. */
export interface FormState {
  /** Single-valued answers, keyed by field name. */
  values: Record<string, string>;
  /** Multi-choice answers, keyed by field name. */
  choices: Record<string, string[]>;
  /** Uploaded documents, keyed by document slot. */
  documents: Record<string, File[]>;
}

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Supporting text rendered beneath the control. */
  help?: string;
  placeholder?: string;
  rows?: number;
  options?: readonly PreConsultationOption[];
  /** Hint for the browser's autofill. */
  autoComplete?: string;
  /** Half-width on desktop, full width on mobile. */
  half?: boolean;
  /**
   * Render only when this returns true.
   *
   * Used for section 6, where the description of previous research is only
   * asked once the applicant has said there was some.
   */
  showWhen?: (state: FormState) => boolean;
}

export interface SectionDef {
  number: number;
  title: string;
  /** Italic note beneath the section heading, as on the paper form. */
  intro?: string;
  fields: FieldDef[];
  /** Marks the documents section, which renders upload controls instead. */
  documents?: boolean;
  /**
   * Marks the declaration section, which carries the consent checkbox and the
   * privacy notice alongside its ordinary fields.
   *
   * A flag rather than a check on `number === 13`, so renumbering the form
   * cannot quietly detach the consent from the section it belongs to.
   */
  declaration?: boolean;
}

export interface StepDef {
  id: string;
  /** Shown as the step heading. */
  title: string;
  /** Shown in the progress indicator, where space is tight. */
  shortTitle: string;
  sections: SectionDef[];
}

const maxLength = (name: string): number =>
  PRE_CONSULTATION_MAX_LENGTHS[name] ?? 1000;

/** The longest answers get the tallest boxes; the brief asks for this. */
const rowsFor = (name: string): number => {
  const limit = maxLength(name);
  if (limit >= 5000) return 8;
  if (limit >= 3000) return 6;
  return 4;
};

const textarea = (
  name: string,
  label: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({
  name,
  label,
  kind: "textarea",
  rows: rowsFor(name),
  ...extra,
});

// ── Sections 1-13 ────────────────────────────────────────────────────────────

const personalInformation: SectionDef = {
  number: 1,
  title: "Personal information",
  fields: [
    {
      name: "fullName",
      label: "Full name",
      kind: "text",
      required: true,
      autoComplete: "name",
      half: true,
    },
    {
      name: "nationality",
      label: "Nationality",
      kind: "text",
      autoComplete: "country-name",
      half: true,
    },
    {
      name: "residence",
      label: "Country and city of residence",
      kind: "text",
      half: true,
    },
    {
      name: "email",
      label: "Email address",
      kind: "email",
      required: true,
      autoComplete: "email",
      half: true,
    },
    {
      name: "phone",
      label: "Phone number",
      kind: "tel",
      help: "Include your country code, for example +44.",
      autoComplete: "tel",
      half: true,
    },
    {
      name: "bestTimeToCall",
      label: "Best days and times to call",
      kind: "text",
      placeholder: "Weekday mornings, UK time",
      half: true,
    },
  ],
};

const academicBackground: SectionDef = {
  number: 2,
  title: "Academic background",
  intro: "Your CV covers much of this. These fields capture what a CV usually leaves out.",
  fields: [
    {
      name: "highestQualification",
      label: "Highest qualification completed",
      kind: "text",
      half: true,
    },
    { name: "fieldOfStudy", label: "Field of study", kind: "text", half: true },
    { name: "institution", label: "Institution", kind: "text", half: true },
    {
      name: "graduationYear",
      label: "Year of graduation",
      kind: "text",
      placeholder: "2021",
      half: true,
    },
    {
      name: "finalGrade",
      label: "Final grade or classification",
      kind: "text",
      half: true,
    },
    {
      name: "dissertationTitle",
      label: "Dissertation or thesis title",
      kind: "text",
      half: true,
    },
    textarea("keySubjects", "Key subjects or areas studied"),
    textarea(
      "recordExplanation",
      "Anything in your record that may need explaining",
      { help: "Study gaps, a resit, a change of field." },
    ),
  ],
};

const professionalExperience: SectionDef = {
  number: 3,
  title: "Professional and relevant experience",
  fields: [
    { name: "currentRole", label: "Current role", kind: "text", half: true },
    {
      name: "yearsOfExperience",
      label: "Years of experience",
      kind: "text",
      half: true,
    },
    textarea("relevantExperience", "Relevant experience", {
      help: "Teaching, research, clinical, industry or voluntary.",
    }),
  ],
};

const researchInterests: SectionDef = {
  number: 4,
  title: "Research interests",
  intro:
    "This is the part your consultant will spend the most time on. Half-formed ideas are useful — write what you have.",
  fields: [
    {
      name: "broadArea",
      label: "Broad area of interest",
      kind: "text",
      placeholder: "Health informatics, education policy, renewable energy…",
    },
    textarea(
      "researchIdea",
      "What would you like to research, in your own words?",
    ),
    textarea("realWorldArea", "Real-world area you want the research to relate to"),
    textarea("avoidAreas", "Areas, methods or topics you would rather avoid"),
  ],
};

const skills: SectionDef = {
  number: 5,
  title: "Skills and technical background",
  fields: [
    textarea("analyticalSkills", "Analytical and technical skills"),
    textarea("toolsAndSoftware", "Tools and software you can use", {
      placeholder: "SPSS, R, Python, NVivo, Stata…",
    }),
    {
      name: "researchMethods",
      label: "Research methods you have actually used",
      kind: "checkbox",
      options: RESEARCH_METHODS,
    },
  ],
};

const researchExperience: SectionDef = {
  number: 6,
  title: "Research experience",
  fields: [
    {
      name: "hasConductedResearch",
      label: "Have you previously conducted research?",
      kind: "radio",
      options: RESEARCH_EXPERIENCE_ANSWERS,
    },
    textarea("researchDescription", "Briefly describe the research or project", {
      // Section 6 on the paper form reads "If yes, briefly describe…", so the
      // field appears only once that answer has been given.
      showWhen: (state) => state.values.hasConductedResearch === "yes",
    }),
    textarea("publications", "Publications, conference papers or posters"),
  ],
};

const studyIntentions: SectionDef = {
  number: 7,
  title: "Study intentions",
  fields: [
    {
      name: "intendedProgramme",
      label: "Intended programme",
      kind: "radio",
      options: INTENDED_PROGRAMMES,
    },
    {
      name: "studyMode",
      label: "Preferred mode of study",
      kind: "radio",
      options: STUDY_MODES,
    },
    {
      name: "studyCountries",
      label: "Countries you would study in",
      kind: "checkbox",
      options: STUDY_COUNTRIES,
    },
    {
      name: "preferredStartDate",
      label: "Preferred start date",
      kind: "text",
      placeholder: "September 2027",
      half: true,
    },
    textarea("targetInstitutions", "Universities or locations you already have in mind"),
    textarea("academicsContacted", "Academics you have already contacted", {
      help: "Name, university, and their response.",
    }),
    textarea("studyConstraints", "Anything that limits where you can study", {
      help: "Family, work, care responsibilities.",
    }),
  ],
};

const funding: SectionDef = {
  number: 8,
  title: "Funding",
  fields: [
    {
      name: "fundingNeeds",
      label: "What you need covered",
      kind: "checkbox",
      options: FUNDING_NEEDS,
    },
    textarea(
      "scholarshipsApplied",
      "Scholarships or studentships already applied for, and the outcome",
    ),
  ],
};

const supportRequired: SectionDef = {
  number: 9,
  title: "Support required",
  intro: "Tick all that apply. These map to the phases of our Research Pathway package.",
  fields: [
    {
      name: "supportAreas",
      label: "Support required",
      kind: "checkbox",
      options: SUPPORT_AREAS,
    },
    {
      name: "deadline",
      label: "Any deadline you are working towards",
      kind: "text",
    },
  ],
};

const motivation: SectionDef = {
  number: 10,
  title: "Motivation and goals",
  fields: [
    textarea(
      "motivation",
      "Why do you want to pursue postgraduate research, and why now?",
    ),
    textarea("fiveYearGoal", "What do you want to be doing five years after finishing?"),
  ],
};

const documents: SectionDef = {
  number: 11,
  title: "Documents enclosed",
  intro: "Your CV is required. Everything else is optional — send what you have.",
  documents: true,
  fields: [],
};

const additionalInformation: SectionDef = {
  number: 12,
  title: "Additional information",
  fields: [
    textarea(
      "additionalInformation",
      "Anything else you would like us to know before the call",
    ),
  ],
};

const declaration: SectionDef = {
  number: 13,
  title: "Declaration",
  declaration: true,
  fields: [
    {
      name: "declarationName",
      label: "Full name",
      kind: "text",
      required: true,
      autoComplete: "name",
      half: true,
    },
    {
      name: "declarationSignature",
      label: "Signature",
      kind: "text",
      help: "Type your name to sign.",
      half: true,
    },
    {
      name: "declarationDate",
      label: "Date",
      kind: "date",
      required: true,
      help: "The date you are completing this form.",
      half: true,
    },
  ],
};

// ── Steps ────────────────────────────────────────────────────────────────────

/**
 * The thirteen sections, grouped into steps.
 *
 * Thirteen separate screens would be thirteen Continue clicks for a form whose
 * own instructions say blanks are fine. Related sections are shown together
 * instead, and each keeps its own number and heading so the screen still reads
 * against the paper form.
 *
 * The grouping also keeps the required fields apart: identity on the first
 * step, the CV on the documents step, consent on the last. No middle step can
 * block someone who has nothing to add.
 */
export const STEPS: StepDef[] = [
  {
    id: "personal",
    title: "Personal information",
    shortTitle: "About you",
    sections: [personalInformation],
  },
  {
    id: "background",
    title: "Academic and professional background",
    shortTitle: "Background",
    sections: [academicBackground, professionalExperience],
  },
  {
    id: "research",
    title: "Research interests and experience",
    shortTitle: "Research",
    sections: [researchInterests, skills, researchExperience],
  },
  {
    id: "study",
    title: "Study intentions and funding",
    shortTitle: "Study plans",
    sections: [studyIntentions, funding],
  },
  {
    id: "support",
    title: "Support required, motivation and goals",
    shortTitle: "Support",
    sections: [supportRequired, motivation],
  },
  {
    id: "documents",
    title: "Documents and additional information",
    shortTitle: "Documents",
    sections: [documents, additionalInformation],
  },
  {
    id: "declaration",
    title: "Declaration",
    shortTitle: "Declaration",
    sections: [declaration],
  },
];

/** The review screen sits after the last step; it is not a step itself. */
export const REVIEW_STEP_INDEX = STEPS.length;

/** Every field declared anywhere in the form. */
export const ALL_FIELDS: FieldDef[] = STEPS.flatMap((step) =>
  step.sections.flatMap((section) => section.fields),
);

/** Look up a field's definition by name. */
export const fieldByName = (name: string): FieldDef | undefined =>
  ALL_FIELDS.find((field) => field.name === name);

/** All thirteen sections in their printed order, for the review screen. */
export const ALL_SECTIONS: SectionDef[] = STEPS.flatMap((step) => step.sections);

export { maxLength };
