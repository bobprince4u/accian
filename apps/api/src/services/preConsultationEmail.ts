/**
 * The pre-consultation notification email.
 *
 * This module owns what the email says. It follows the same boundary as
 * `emailServices`: composition, escaping and `email_logs` live here, while
 * `emailProvider` owns how the message leaves the process and is the only
 * place a provider key is read.
 *
 * One rule governs everything below. Every applicant value is escaped exactly
 * once, at the moment it is placed into markup, by `escapeHtml`. The only
 * string that reaches the template as markup is `sections`, and it is built
 * here from already-escaped parts. Nothing else in this file concatenates
 * untrusted text into HTML.
 *
 * Unlike the contact notification, the send is awaited by its caller. The
 * applicant is told their submission was received only once the provider has
 * accepted it, so a delivery failure must be observable rather than logged and
 * forgotten.
 */

import fs from "fs/promises";
import path from "path";

import {
  EmailAttachment,
  EmailMessage,
  getEmailTransport,
  redactProviderMessage,
} from "./emailProvider";
import { logEmail } from "./emailServices";
import {
  ContractOption,
  FUNDING_NEEDS,
  INTENDED_PROGRAMMES,
  PRE_CONSULTATION_DECLARATION,
  PRE_CONSULTATION_DOCUMENTS,
  RESEARCH_EXPERIENCE_ANSWERS,
  RESEARCH_METHODS,
  STUDY_COUNTRIES,
  STUDY_MODES,
  SUPPORT_AREAS,
  labelForOption,
} from "../utils/preConsultationContract";

/** A document as it will be attached and listed. */
export interface PreConsultationDocument {
  /** The slot it was uploaded to. */
  field: string;
  /** Name the attachment is sent under. */
  filename: string;
  /** Name the applicant's own file had, for the body listing. */
  originalName: string;
  size: number;
  contentType: string;
  content: Buffer;
}

export interface PreConsultationEmailData {
  referenceId: string;
  submittedAt: Date;
  text: Record<string, string>;
  choices: Record<string, string[]>;
  documents: PreConsultationDocument[];
}

const NOT_PROVIDED = "Not provided";

/**
 * Escape for interpolation into HTML.
 *
 * Identical in behaviour to the one in `emailServices`, and deliberately not
 * shared: each module escapes what it itself renders, so neither can be made
 * unsafe by a change to the other's rendering.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escape, then render newlines as line breaks. Order matters. */
const escapeMultiline = (value: string): string =>
  escapeHtml(value).replace(/\n/g, "<br />");

const loadTemplate = async (templateName: string): Promise<string> => {
  const templatePath = path.join(
    __dirname,
    "../templates/emailTemplates",
    `${templateName}.html`,
  );
  return fs.readFile(templatePath, "utf-8");
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimestamp = (date: Date): string =>
  date.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "full",
    timeStyle: "short",
  });

// ── Row rendering ────────────────────────────────────────────────────────────

/**
 * One label/value pair.
 *
 * An empty answer renders as "Not provided" rather than being dropped. The
 * brief is explicit about this: silently omitting blank fields makes the email
 * structure vary per submission, so a consultant cannot tell a question that
 * was skipped from one that was never asked.
 *
 * `undefined` is accepted as well as an empty string. Every value reaching
 * here through the controller has been normalised, but a field that exists in
 * this template and not in the contract's length table would otherwise arrive
 * undefined and throw — turning a missing field into a failed delivery, which
 * is the worst possible way to find out about it.
 */
const row = (label: string, value: string | undefined, multiline = false): string => {
  const text = value ?? "";
  const provided = text.trim().length > 0;
  const rendered = provided
    ? multiline
      ? escapeMultiline(text)
      : escapeHtml(text)
    : `<span style="color:#999999;font-style:italic">${NOT_PROVIDED}</span>`;

  return `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f0ede6;vertical-align:top;width:38%">
        <span style="font-size:12px;font-weight:600;color:#555555;line-height:1.5">${escapeHtml(
          label,
        )}</span>
      </td>
      <td style="padding:9px 0 9px 16px;border-bottom:1px solid #f0ede6;vertical-align:top">
        <span style="font-size:13px;color:#0d0d0d;line-height:1.65">${rendered}</span>
      </td>
    </tr>`;
};

/** A multi-choice answer, rendered as a labelled list. */
const choiceRow = (
  label: string,
  values: string[],
  options: readonly ContractOption[],
): string =>
  row(
    label,
    values.length > 0
      ? values.map((value) => `• ${labelForOption(options, value)}`).join("\n")
      : "",
    true,
  );

/** A single-choice answer, resolved to its label. */
const singleChoiceRow = (
  label: string,
  value: string | undefined,
  options: readonly ContractOption[],
): string => row(label, value ? labelForOption(options, value) : "");

/** A numbered section containing rows. */
const section = (number: number, title: string, rows: string): string => `
  <tr>
    <td style="padding:20px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:10px;border-bottom:2px solid #1b4fff">
            <span style="font-size:11px;font-weight:700;color:#1b4fff;letter-spacing:0.1em">${number}</span>
            <span style="font-size:14px;font-weight:700;color:#0d0d0d;letter-spacing:-0.01em;padding-left:8px">${escapeHtml(
              title,
            )}</span>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px">
        ${rows}
      </table>
    </td>
  </tr>`;

/**
 * Build the thirteen sections, in the order of the source form.
 *
 * Kept as one function so the structure of the email can be read against the
 * structure of the paper form side by side.
 */
const buildSections = (data: PreConsultationEmailData): string => {
  const t = data.text;
  const c = data.choices;

  const documentRows =
    data.documents.length > 0
      ? PRE_CONSULTATION_DOCUMENTS.map((slot) => {
          const attached = data.documents.filter((d) => d.field === slot.field);
          return row(
            slot.label,
            attached.length > 0
              ? attached
                  .map(
                    (d) =>
                      `${d.originalName} (${formatBytes(d.size)}) — attached as ${d.filename}`,
                  )
                  .join("\n")
              : "",
            true,
          );
        }).join("")
      : row("Documents", "");

  return [
    section(
      1,
      "Personal information",
      [
        row("Full name", t.fullName),
        row("Nationality", t.nationality),
        row("Country and city of residence", t.residence),
        row("Email address", t.email),
        row("Phone number", t.phone),
        row("Best days and times to call", t.bestTimeToCall),
      ].join(""),
    ),
    section(
      2,
      "Academic background",
      [
        row("Highest qualification completed", t.highestQualification),
        row("Field of study", t.fieldOfStudy),
        row("Institution", t.institution),
        row("Year of graduation", t.graduationYear),
        row("Final grade or classification", t.finalGrade),
        row("Dissertation or thesis title", t.dissertationTitle),
        row("Key subjects or areas studied", t.keySubjects, true),
        row("Anything that may need explaining", t.recordExplanation, true),
      ].join(""),
    ),
    section(
      3,
      "Professional and relevant experience",
      [
        row("Current role", t.currentRole),
        row("Years of experience", t.yearsOfExperience),
        row("Relevant experience", t.relevantExperience, true),
      ].join(""),
    ),
    section(
      4,
      "Research interests",
      [
        row("Broad area of interest", t.broadArea),
        row("What they would like to research", t.researchIdea, true),
        row("Real-world area it should relate to", t.realWorldArea, true),
        row("Areas, methods or topics to avoid", t.avoidAreas, true),
      ].join(""),
    ),
    section(
      5,
      "Skills and technical background",
      [
        row("Analytical and technical skills", t.analyticalSkills, true),
        row("Tools and software", t.toolsAndSoftware, true),
        choiceRow("Research methods used", c.researchMethods ?? [], RESEARCH_METHODS),
      ].join(""),
    ),
    section(
      6,
      "Research experience",
      [
        singleChoiceRow(
          "Previously conducted research",
          t.hasConductedResearch,
          RESEARCH_EXPERIENCE_ANSWERS,
        ),
        row("Description of the research", t.researchDescription, true),
        row("Publications, papers or posters", t.publications, true),
      ].join(""),
    ),
    section(
      7,
      "Study intentions",
      [
        singleChoiceRow("Intended programme", t.intendedProgramme, INTENDED_PROGRAMMES),
        singleChoiceRow("Preferred mode of study", t.studyMode, STUDY_MODES),
        choiceRow("Countries", c.studyCountries ?? [], STUDY_COUNTRIES),
        row("Preferred start date", t.preferredStartDate),
        row("Universities or locations in mind", t.targetInstitutions, true),
        row("Academics already contacted", t.academicsContacted, true),
        row("Constraints on where they can study", t.studyConstraints, true),
      ].join(""),
    ),
    section(
      8,
      "Funding",
      [
        choiceRow("What they need covered", c.fundingNeeds ?? [], FUNDING_NEEDS),
        row("Scholarships applied for, and outcome", t.scholarshipsApplied, true),
      ].join(""),
    ),
    section(
      9,
      "Support required",
      [
        choiceRow("Support required", c.supportAreas ?? [], SUPPORT_AREAS),
        row("Deadline they are working towards", t.deadline),
      ].join(""),
    ),
    section(
      10,
      "Motivation and goals",
      [
        row("Why postgraduate research, and why now", t.motivation, true),
        row("Where they want to be in five years", t.fiveYearGoal, true),
      ].join(""),
    ),
    section(11, "Documents enclosed", documentRows),
    section(
      12,
      "Additional information",
      row("Anything else to know", t.additionalInformation, true),
    ),
    section(
      13,
      "Declaration",
      [
        row("Confirmed", t.declarationAccepted === "true" ? "Yes" : "No"),
        row("Full name", t.declarationName),
        row("Signature", t.declarationSignature),
        row("Date", t.declarationDate),
        row("Declaration text", PRE_CONSULTATION_DECLARATION, true),
      ].join(""),
    ),
  ].join("");
};

/**
 * Substitute the shell template's placeholders.
 *
 * `sections` is passed through as markup because this module built it; every
 * other key is escaped. The distinction is explicit rather than implied by a
 * naming convention, so adding a placeholder cannot accidentally opt it out of
 * escaping.
 */
const renderShell = (
  template: string,
  data: Record<string, string>,
  rawKeys: readonly string[],
): string =>
  template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) => {
    const value = data[key] ?? "";
    return rawKeys.includes(key) ? value : escapeHtml(value);
  });

/** Where submissions are sent. */
const recipient = (): string | undefined =>
  process.env.PRE_CONSULTATION_RECIPIENT || process.env.ADMIN_EMAIL;

const fromEmail = (): string =>
  process.env.RESEND_FROM_EMAIL ||
  process.env.SENDGRID_FROM_EMAIL ||
  process.env.EMAIL_USER ||
  "noreply@accian.co.uk";

/** Build the message without sending it. Exported so tests can inspect it. */
export const buildPreConsultationEmail = async (
  data: PreConsultationEmailData,
): Promise<EmailMessage> => {
  const template = await loadTemplate("preConsultationSubmission");

  const documentSummary =
    data.documents.length === 1
      ? "1 document attached"
      : `${data.documents.length} documents attached`;

  const html = renderShell(
    template,
    {
      referenceId: data.referenceId,
      applicantName: data.text.fullName,
      applicantEmail: data.text.email,
      applicantPhone: data.text.phone || NOT_PROVIDED,
      submittedAt: formatTimestamp(data.submittedAt),
      documentSummary,
      sections: buildSections(data),
    },
    ["sections"],
  );

  const attachments: EmailAttachment[] = data.documents.map((document) => ({
    filename: document.filename,
    content: document.content,
    contentType: document.contentType,
  }));

  const to = recipient();
  if (!to) {
    // Named here rather than left to the provider, which would report it as an
    // undefined recipient and make a configuration error look like an outage.
    throw new Error(
      "PRE_CONSULTATION_RECIPIENT is not set; the submission cannot be delivered",
    );
  }

  return {
    to,
    from: { email: fromEmail(), name: "Accian Pre-Consultation" },
    // Subject format is fixed by the brief so that a consultant can filter on
    // it and find a submission by reference without opening anything.
    subject: `New PhD Pre-Consultation Submission — ${data.text.fullName} — ${data.referenceId}`,
    html,
    // A consultant hitting Reply should reach the applicant, not the noreply
    // address the message is sent from.
    replyTo: data.text.email,
    attachments,
  };
};

/**
 * Send the submission.
 *
 * Resolves only when the provider has accepted the message. The caller turns a
 * rejection into a failed API response, because the applicant must not be told
 * their application was received when it was not.
 */
export const sendPreConsultationSubmission = async (
  data: PreConsultationEmailData,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  let subject = `New PhD Pre-Consultation Submission — ${data.referenceId}`;

  try {
    const message = await buildPreConsultationEmail(data);
    subject = message.subject;

    const { messageId } = await getEmailTransport().send(message);

    await logEmail("pre_consultation", message.to, subject, "sent");
    // Correlated by reference only. The applicant's name, address and answers
    // are not written to stdout at any level.
    console.log(`✅ Pre-consultation submission sent (ref ${data.referenceId})`);

    return { success: true, messageId };
  } catch (error: unknown) {
    const errorMessage = redactProviderMessage(
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      `❌ Failed to send pre-consultation submission (ref ${data.referenceId}):`,
      errorMessage,
    );

    await logEmail("pre_consultation", recipient(), subject, "failed", errorMessage);

    return { success: false, error: errorMessage };
  }
};
