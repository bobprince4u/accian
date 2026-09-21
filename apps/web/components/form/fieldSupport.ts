/**
 * Shared plumbing for the form controls.
 *
 * The accessibility contract every field in this form keeps:
 *
 *   - the label is a real `<label>` bound by `htmlFor`, or a `<legend>` inside
 *     a `<fieldset>` for grouped inputs,
 *   - help text and error text are announced via `aria-describedby`, so a
 *     screen reader reaches them without having to hunt,
 *   - an invalid field carries `aria-invalid`, and its message is prefixed
 *     with a glyph and the word itself — colour is never the only signal,
 *   - focus is always visible, including for the custom checkbox and radio
 *     tiles, which is why they use `focus-within` rather than hiding focus
 *     along with the native control.
 *
 * Colours are the site palette from `app/globals.css` — ink #0D0D0D, cream
 * #F5F3EE, blue #1B4FFF, borders #D8D3C9 and #E8E4DC. Nothing here introduces
 * a colour the rest of the site does not already use.
 */

/** Stable, collision-free ids derived from the field name. */
export const fieldIds = (name: string) => ({
  input: `pc-${name}`,
  help: `pc-${name}-help`,
  error: `pc-${name}-error`,
});

/**
 * The `aria-describedby` value for a field.
 *
 * Returns `undefined` rather than an empty string when there is nothing to
 * point at: an empty `aria-describedby` is itself a violation.
 */
export const describedBy = (
  name: string,
  hasHelp: boolean,
  hasError: boolean,
): string | undefined => {
  const ids = fieldIds(name);
  const parts = [hasHelp ? ids.help : null, hasError ? ids.error : null].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(" ") : undefined;
};

/** Base input styling, matching the `.input` class in globals.css. */
export const inputClass = (invalid: boolean): string =>
  [
    "w-full rounded-lg px-4 py-3 text-sm font-light text-[#0D0D0D]",
    "bg-[#F5F3EE] placeholder:text-gray-400",
    "transition-colors duration-200",
    "focus:outline-none focus:ring-2",
    invalid
      ? "border border-red-500 focus:border-red-600 focus:ring-red-500/20"
      : "border border-[#D8D3C9] focus:border-[#1B4FFF] focus:ring-[#1B4FFF]/15",
  ].join(" ");

export const labelClass =
  "block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-2";

export const helpClass = "mt-1.5 text-xs font-light text-[#666666] leading-relaxed";
