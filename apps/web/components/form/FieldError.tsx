"use client";

/**
 * The error message shown beneath a field.
 *
 * Carries a glyph and is rendered in red, but neither is the only signal: the
 * field itself gets `aria-invalid`, and the text reads as a sentence, so the
 * message survives being read aloud or seen by someone who cannot distinguish
 * the colour.
 */
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
      <span aria-hidden="true" className="mt-px leading-none">
        ⚠
      </span>
      <span>{message}</span>
    </p>
  );
}
