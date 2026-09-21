/**
 * Multipart handling for the pre-consultation form.
 *
 * Storage is in memory, deliberately. The brief is explicit that raw uploads
 * must not be kept, and the documents only need to exist for as long as it
 * takes to attach them to one email. Memory storage means there is no
 * temporary file to leak, to serve by accident, or to forget to delete — the
 * buffers become unreachable when the request ends.
 *
 * The limits below are the first line of defence and are enforced by `multer`
 * while it parses, so an oversized upload is cut off mid-stream rather than
 * buffered in full and rejected afterwards. They are not the last line: the
 * controller re-checks the aggregate size and inspects the bytes of every
 * file, because a per-file limit says nothing about ten files at once and an
 * extension says nothing about content.
 */

import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

import { AppError } from "./errorHandler";
import {
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_FILE_LIMITS,
} from "../utils/preConsultationContract";

const ACCEPT_HINT = "Upload a PDF, DOC or DOCX file.";

/**
 * Cheap pre-checks, run per file as it starts arriving.
 *
 * Only the extension and the declared type are available at this point — the
 * bytes have not been read yet. Both are client-supplied, so a pass here means
 * nothing on its own; it exists to reject the obvious cases before the body is
 * buffered. The authoritative check is `detectDocumentType` in the controller.
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const slot = PRE_CONSULTATION_DOCUMENTS.find((s) => s.field === file.fieldname);
  if (!slot) {
    callback(new AppError(`Unexpected file field: ${file.fieldname}`, 400));
    return;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  if (!PRE_CONSULTATION_FILE_LIMITS.allowedExtensions.includes(extension)) {
    callback(
      new AppError(
        `“${slot.label}” must be a PDF, DOC or DOCX file.`,
        400,
      ),
    );
    return;
  }

  // Browsers occasionally send an empty or generic type for .doc/.docx, so an
  // unrecognised type is not fatal on its own; a type that is recognised and
  // wrong is. `application/octet-stream` is the common generic case.
  const declared = (file.mimetype || "").toLowerCase();
  const isGeneric =
    declared === "" ||
    declared === "application/octet-stream" ||
    declared === "binary/octet-stream";
  if (
    !isGeneric &&
    !PRE_CONSULTATION_FILE_LIMITS.allowedMimeTypes.includes(declared)
  ) {
    callback(new AppError(`“${slot.label}” must be a PDF, DOC or DOCX file.`, 400));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: PRE_CONSULTATION_FILE_LIMITS.maxFileBytes,
    files: PRE_CONSULTATION_FILE_LIMITS.maxFiles,
    // Generous enough for the longest free-text answer the contract permits
    // (5000 characters, which may be multi-byte) and nothing like enough to
    // be used as a buffer.
    fieldSize: 128 * 1024,
    // Roughly forty text fields plus one part per ticked checkbox, with room
    // to spare. A body with hundreds of parts is not this form.
    fields: 200,
    parts: 250,
  },
});

/** Field configuration, derived from the contract so the two cannot diverge. */
const fieldConfig = PRE_CONSULTATION_DOCUMENTS.map((slot) => ({
  name: slot.field,
  maxCount: slot.maxFiles,
}));

const parse = upload.fields(fieldConfig);

/**
 * Translate a `multer` failure into a message an applicant can act on.
 *
 * Left alone, these surface as a 500 with `GENERIC_MESSAGE`, which tells
 * someone whose file was 200KB too large nothing at all. Each case below is
 * mapped to an `AppError`, which the shared error handler is permitted to
 * relay verbatim.
 */
const describeMulterError = (error: multer.MulterError): AppError => {
  const megabytes = Math.floor(
    PRE_CONSULTATION_FILE_LIMITS.maxFileBytes / (1024 * 1024),
  );

  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return new AppError(
        `One of your documents is larger than ${megabytes}MB. Please upload a smaller file.`,
        413,
      );
    case "LIMIT_FILE_COUNT":
      return new AppError(
        `Please upload no more than ${PRE_CONSULTATION_FILE_LIMITS.maxFiles} documents in total.`,
        400,
      );
    case "LIMIT_UNEXPECTED_FILE":
      return new AppError(
        `“${error.field}” is not a document we accept, or you attached more files than that section allows.`,
        400,
      );
    case "LIMIT_FIELD_VALUE":
      return new AppError("One of your answers is too long.", 400);
    case "LIMIT_PART_COUNT":
    case "LIMIT_FIELD_COUNT":
      return new AppError("The form sent more data than we expected.", 400);
    default:
      return new AppError(`We could not read the uploaded form. ${ACCEPT_HINT}`, 400);
  }
};

/**
 * Parse the multipart body, converting parse failures into client errors.
 *
 * A malformed multipart request — a truncated body, a missing boundary —
 * makes `multer` emit a plain `Error`, which would otherwise be reported to
 * the applicant as an internal server error. It is a bad request, and it is
 * reported as one.
 */
export const parsePreConsultationUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  parse(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      next(describeMulterError(error));
      return;
    }

    // `fileFilter` rejections arrive here already shaped for the client.
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError(
        "We could not read your submission. Please check your files and try again.",
        400,
      ),
    );
  });
};
