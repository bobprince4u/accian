/**
 * Client-side document checks.
 *
 * These mirror the API's rules so an applicant learns about an 11MB scan
 * before uploading it over a slow connection, not after. The API repeats every
 * check and additionally inspects each file's bytes, which a browser cannot do
 * cheaply — so passing here is not permission, just early feedback.
 *
 * Limits come from `@accian/types`, the same constants the API validates
 * against, so the two cannot drift.
 */

import {
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_FILE_LIMITS,
} from "@accian/types";

import type { FieldErrors } from "./validation";

/** Sizes as a person reads them, for hints and error messages. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const maxFileLabel = formatBytes(PRE_CONSULTATION_FILE_LIMITS.maxFileBytes);
const maxTotalLabel = formatBytes(PRE_CONSULTATION_FILE_LIMITS.maxTotalBytes);

/** Lowercase extension including the dot, or `""` when there is none. */
export const extensionOf = (filename: string): string => {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
};

/**
 * Check one file.
 *
 * Returns `null` when the file is acceptable. The declared MIME type is not
 * consulted: browsers report `.doc` and `.docx` inconsistently, and on some
 * platforms send `application/octet-stream` for both, so the extension is the
 * only signal available here that is worth acting on.
 */
export const validateFile = (file: File): string | null => {
  const extension = extensionOf(file.name);

  if (!PRE_CONSULTATION_FILE_LIMITS.allowedExtensions.includes(extension)) {
    return `“${file.name}” is not a PDF, DOC or DOCX file.`;
  }

  if (file.size === 0) {
    return `“${file.name}” appears to be empty.`;
  }

  if (file.size > PRE_CONSULTATION_FILE_LIMITS.maxFileBytes) {
    return `“${file.name}” is ${formatBytes(file.size)}. The limit is ${maxFileLabel} per file.`;
  }

  return null;
};

/** The `accept` attribute for an upload control. */
export const ACCEPT_ATTRIBUTE = PRE_CONSULTATION_FILE_LIMITS.allowedExtensions.join(",");

/** Hint text shown beneath every upload control. */
export const ACCEPT_HINT = `PDF, DOC or DOCX, up to ${maxFileLabel} each`;

/**
 * Check every uploaded document together.
 *
 * Errors are keyed by document slot so they render against the control that
 * caused them. The aggregate-size failure is keyed to `documents`, because no
 * single file is at fault.
 */
export const validateDocuments = (
  documents: Record<string, File[]>,
): FieldErrors => {
  const errors: FieldErrors = {};
  let total = 0;
  let count = 0;

  for (const slot of PRE_CONSULTATION_DOCUMENTS) {
    const files = documents[slot.field] ?? [];

    if (slot.required && files.length === 0) {
      errors[slot.field] = `${slot.label} is required.`;
      continue;
    }

    if (files.length > slot.maxFiles) {
      errors[slot.field] =
        slot.maxFiles === 1
          ? `Please attach one file here.`
          : `Please attach no more than ${slot.maxFiles} files here.`;
      continue;
    }

    for (const file of files) {
      const message = validateFile(file);
      if (message) {
        errors[slot.field] = message;
        break;
      }
      total += file.size;
      count += 1;
    }
  }

  if (count > PRE_CONSULTATION_FILE_LIMITS.maxFiles) {
    errors.documents = `Please attach no more than ${PRE_CONSULTATION_FILE_LIMITS.maxFiles} documents in total.`;
  }

  if (total > PRE_CONSULTATION_FILE_LIMITS.maxTotalBytes) {
    errors.documents = `Your documents come to ${formatBytes(total)}. The total limit is ${maxTotalLabel}.`;
  }

  return errors;
};

/** Bytes across every attached document. */
export const totalDocumentBytes = (documents: Record<string, File[]>): number =>
  Object.values(documents)
    .flat()
    .reduce((sum, file) => sum + file.size, 0);

/** How many documents are attached in total. */
export const documentCount = (documents: Record<string, File[]>): number =>
  Object.values(documents).flat().length;
