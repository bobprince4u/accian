"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";

import FieldError from "./FieldError";
import { fieldIds, helpClass } from "./fieldSupport";
import { ACCEPT_ATTRIBUTE, ACCEPT_HINT, formatBytes } from "../../lib/preConsultation/files";

export interface FileUploadProps {
  name: string;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  required?: boolean;
  maxFiles?: number;
  help?: string;
  error?: string;
}

/**
 * Document upload for one slot.
 *
 * Supports both the file picker and drag-and-drop. Dropping is an addition,
 * never a replacement: the hidden `<input type="file">` is a real focusable
 * control reached by Tab and activated by Enter or Space, so the whole
 * interaction works from the keyboard with no pointer.
 *
 * Two details that are easy to get wrong:
 *
 *   - the input's value is cleared after every selection. A file input will
 *     not fire `change` for a file it already holds, so without this an
 *     applicant who removes a document cannot re-attach the same one.
 *   - selections are appended rather than replacing, up to `maxFiles`, which
 *     is what someone attaching two transcripts in two goes expects.
 */
export default function FileUpload({
  name,
  label,
  files,
  onChange,
  required = false,
  maxFiles = 1,
  help,
  error,
}: FileUploadProps) {
  const ids = fieldIds(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const next = maxFiles === 1 ? Array.from(incoming).slice(0, 1) : [...files, ...Array.from(incoming)];
    onChange(next.slice(0, maxFiles));
    // See the note above: without this, re-selecting the same file is silent.
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    onChange(files.filter((_, position) => position !== index));
  };

  const full = files.length >= maxFiles;

  return (
    <div>
      <label htmlFor={ids.input} className="block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-2">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-[#1B4FFF]">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!full) accept(event.dataTransfer.files);
        }}
        className={[
          "rounded-xl border border-dashed px-4 py-5 text-center transition-colors duration-150",
          "focus-within:ring-2 focus-within:ring-[#1B4FFF]/30 focus-within:border-[#1B4FFF]",
          dragging
            ? "border-[#1B4FFF] bg-[#1B4FFF]/[0.05]"
            : error
              ? "border-red-400 bg-red-50/40"
              : "border-[#D8D3C9] bg-[#F5F3EE] hover:border-[#0D0D0D]/40",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={ids.input}
          name={name}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple={maxFiles > 1}
          disabled={full}
          onChange={(event) => accept(event.target.files)}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[ids.help, error ? ids.error : null].filter(Boolean).join(" ")}
          className={[
            "block w-full text-xs font-light text-[#666666] cursor-pointer",
            "file:mr-3 file:rounded-lg file:border-0 file:bg-[#0D0D0D] file:px-4 file:py-2",
            "file:text-xs file:font-semibold file:text-white file:cursor-pointer",
            "hover:file:bg-[#1B4FFF] file:transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        />

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-light text-[#666666]">
          <Paperclip size={12} aria-hidden="true" />
          {full
            ? maxFiles === 1
              ? "Remove the attached file to choose another"
              : `Maximum of ${maxFiles} files attached`
            : "or drag and drop"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-2.5 space-y-2" aria-label={`${label} — attached files`}>
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-[#E8E4DC] bg-white px-3.5 py-2.5"
            >
              <FileText size={15} className="shrink-0 text-[#1B4FFF]" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#0D0D0D]">
                {file.name}
              </span>
              <span className="shrink-0 text-xs font-light tabular-nums text-[#666666]">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded p-1 text-[#666666] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#1B4FFF]/40"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p id={ids.help} className={helpClass}>
        {help ? `${help} ${ACCEPT_HINT}.` : `${ACCEPT_HINT}.`}
        {maxFiles > 1 && ` Up to ${maxFiles} files.`}
      </p>
      <FieldError id={ids.error} message={error} />
    </div>
  );
}
