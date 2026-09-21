/**
 * `POST /api/pre-consultation`.
 *
 * Accepts the PhD Research Pathway pre-consultation form, validates it,
 * attaches the applicant's documents to a notification email and delivers it
 * to the consultancy inbox.
 *
 * Two decisions here differ from the contact controller next door, both
 * deliberate:
 *
 *   - Nothing is written to the database. The submission carries an
 *     applicant's academic history, funding position and personal
 *     circumstances, and the declaration shown to them promises it is used to
 *     advise on their application and can be deleted on request. Storing it in
 *     a table that no screen reads, and that no deletion path covers, would
 *     make that promise false. The email is the record; `email_logs` records
 *     that it was sent, and holds none of its content.
 *
 *   - The send is awaited. The contact form answers 201 and sends in the
 *     background, which is reasonable when a lost email costs an enquiry. Here
 *     the applicant is given a reference and told their application is with
 *     us, so the brief requires that this is not claimed unless the provider
 *     has actually accepted the message.
 */

import { NextFunction, Request, Response } from "express";

import {
  PreConsultationDocument,
  sendPreConsultationSubmission,
} from "../services/preConsultationEmail";
import {
  FieldError,
  buildAttachmentFilename,
  detectDocumentType,
  extensionMatchesType,
  generateReferenceId,
  sanitizeOriginalFilename,
  totalBytes,
  validateSubmission,
} from "../utils/preConsultation";
import {
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_FILE_LIMITS,
} from "../utils/preConsultationContract";
import path from "path";

/** `multer.fields()` shape. */
type UploadedFiles = Record<string, Express.Multer.File[]> | undefined;

const CONTENT_TYPE_FOR_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** Flatten the per-field upload map into one list, preserving slot order. */
const collectFiles = (
  files: UploadedFiles,
): { slotField: string; file: Express.Multer.File }[] => {
  if (!files) return [];
  return PRE_CONSULTATION_DOCUMENTS.flatMap((slot) =>
    (files[slot.field] ?? []).map((file) => ({ slotField: slot.field, file })),
  );
};

/**
 * Inspect every uploaded file.
 *
 * `multer` has already bounded each file's size and rejected obviously wrong
 * extensions, but neither tells us what a file actually is. Here the bytes are
 * read: a `.pdf` whose content is an HTML page, a `.docx` that is a renamed
 * ZIP of something else, and an empty file that passed every other check are
 * all rejected at this point and nowhere earlier.
 */
const validateFiles = (
  entries: { slotField: string; file: Express.Multer.File }[],
): FieldError[] => {
  const errors: FieldError[] = [];

  const required = PRE_CONSULTATION_DOCUMENTS.filter((slot) => slot.required);
  for (const slot of required) {
    if (!entries.some((entry) => entry.slotField === slot.field)) {
      errors.push({
        field: slot.field,
        message: `${slot.label} is required.`,
      });
    }
  }

  const aggregate = totalBytes(entries.map((entry) => entry.file));
  if (aggregate > PRE_CONSULTATION_FILE_LIMITS.maxTotalBytes) {
    const limit = Math.floor(
      PRE_CONSULTATION_FILE_LIMITS.maxTotalBytes / (1024 * 1024),
    );
    errors.push({
      field: "documents",
      message: `Your documents come to more than ${limit}MB in total. Please upload smaller files.`,
    });
  }

  for (const { slotField, file } of entries) {
    const slot = PRE_CONSULTATION_DOCUMENTS.find((s) => s.field === slotField);
    const label = slot?.label ?? slotField;
    const name = sanitizeOriginalFilename(file.originalname || "");

    if (!file.buffer || file.size === 0) {
      errors.push({
        field: slotField,
        message: `“${name}” is empty. Please upload the ${label} again.`,
      });
      continue;
    }

    const detected = detectDocumentType(file.buffer);
    if (!detected) {
      errors.push({
        field: slotField,
        message: `“${name}” is not a readable PDF, DOC or DOCX file.`,
      });
      continue;
    }

    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!extensionMatchesType(extension, detected)) {
      errors.push({
        field: slotField,
        message: `“${name}” does not match its file type. Please re-save it as a PDF, DOC or DOCX and try again.`,
      });
    }
  }

  return errors;
};

/** Shape errors the way every other endpoint in this API shapes them. */
const respondWithErrors = (
  res: Response,
  errors: FieldError[],
  message: string,
): void => {
  res.status(400).json({
    success: false,
    message,
    errors: errors.map((error) => ({ path: error.field, msg: error.message })),
  });
};

export const submitPreConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { errors: fieldErrors, value } = validateSubmission(
      (req.body ?? {}) as Record<string, unknown>,
    );

    const entries = collectFiles(req.files as UploadedFiles);
    const fileErrors = validateFiles(entries);

    const allErrors = [...fieldErrors, ...fileErrors];
    if (allErrors.length > 0) {
      // Nothing about the applicant is logged here. The field names are enough
      // to diagnose a client bug; the values are the sensitive part.
      console.warn(
        `Pre-consultation submission rejected: ${allErrors
          .map((error) => error.field)
          .join(", ")}`,
      );
      respondWithErrors(
        res,
        allErrors,
        "Some answers need your attention before we can submit this form.",
      );
      return;
    }

    const submittedAt = new Date();
    const referenceId = generateReferenceId(submittedAt);
    const applicantName = value.text.fullName;

    const documents: PreConsultationDocument[] = PRE_CONSULTATION_DOCUMENTS.flatMap(
      (slot) => {
        const inSlot = entries.filter((entry) => entry.slotField === slot.field);
        return inSlot.map(({ file }, index) => {
          const extension = path.extname(file.originalname || "").toLowerCase();
          return {
            field: slot.field,
            filename: buildAttachmentFilename(
              applicantName,
              slot.label,
              extension,
              index,
              inSlot.length,
            ),
            originalName: sanitizeOriginalFilename(file.originalname || ""),
            size: file.size,
            contentType:
              CONTENT_TYPE_FOR_EXTENSION[extension] ?? "application/octet-stream",
            content: file.buffer,
          };
        });
      },
    );

    const outcome = await sendPreConsultationSubmission({
      referenceId,
      submittedAt,
      text: value.text,
      choices: value.choices,
      documents,
    });

    if (!outcome.success) {
      // 502: the request was well formed and this application is healthy; the
      // dependency it relies on to deliver the submission is not. The reason
      // has already been redacted and logged by the email service, and is not
      // repeated to the applicant.
      res.status(502).json({
        success: false,
        message:
          "We couldn't submit your form right now. Please try again in a few moments.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Your pre-consultation information has been submitted.",
      data: {
        referenceId,
        submittedAt: submittedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    // Reaches the shared error handler, which decides what may be disclosed.
    // The submission's contents never travel with it.
    next(error);
  }
};

export default { submitPreConsultation };
