/**
 * Safe builder for dynamic UPDATE statements.
 *
 * SQL *values* can be parameterised ($1, $2, ...), but SQL *identifiers*
 * (column names) cannot be. The previous implementations interpolated
 * `Object.keys(req.body)` straight into the SET clause, which let a caller
 * choose the column names — and therefore the SQL text — of the statement.
 *
 * The fix is not to parameterise the identifier (Postgres does not allow it),
 * it is to never let a caller supply one. Each controller declares an explicit
 * allowlist mapping a public API field name to a fixed database column, and
 * anything outside that allowlist is rejected before the query is built.
 */

export interface UpdateFieldSpec {
  /** The literal database column this API field writes to. */
  column: string;
  /** Optional transform applied to the caller's value before binding. */
  transform?: (value: unknown) => unknown;
}

/** Maps a public API field name to the column it is allowed to write. */
export type UpdateAllowlist = Record<string, UpdateFieldSpec>;

export class UnknownUpdateFieldError extends Error {
  readonly statusCode = 400;
  readonly fields: string[];

  constructor(fields: string[]) {
    super(
      `Unknown field${fields.length === 1 ? "" : "s"}: ${fields.join(", ")}`
    );
    this.name = "UnknownUpdateFieldError";
    this.fields = fields;
  }
}

export class NoUpdateFieldsError extends Error {
  readonly statusCode = 400;

  constructor() {
    super("No fields to update");
    this.name = "NoUpdateFieldsError";
  }
}

export interface BuiltUpdate {
  /** e.g. `title = $1, image_url = $2` */
  setClause: string;
  /** Bound values, positionally aligned with the placeholders. */
  values: unknown[];
  /** The columns that will be written, in order. */
  columns: string[];
  /** The next free placeholder index, for appending `updated_at`/`id`. */
  nextIndex: number;
}

/**
 * Defence in depth: even though every column comes from a hard-coded
 * allowlist, assert the shape before it reaches the SQL text. A column name
 * that cannot pass this is a programming error, not user input.
 */
const SAFE_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

const assertSafeIdentifier = (column: string): void => {
  if (!SAFE_IDENTIFIER.test(column)) {
    throw new Error(
      `Refusing to build SQL with unsafe column identifier: ${column}`
    );
  }
};

/**
 * Build the SET clause for an UPDATE from a caller-supplied payload.
 *
 * @param payload   The raw request body.
 * @param allowlist The only fields this endpoint accepts.
 * @param startIndex The first placeholder number to use (defaults to 1).
 *
 * @throws {UnknownUpdateFieldError} if the payload contains any field that is
 *   not in the allowlist — an arbitrary field name can never become SQL.
 * @throws {NoUpdateFieldsError} if nothing updatable was supplied.
 */
export const buildUpdate = (
  payload: unknown,
  allowlist: UpdateAllowlist,
  startIndex = 1
): BuiltUpdate => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new NoUpdateFieldsError();
  }

  const body = payload as Record<string, unknown>;
  const unknownFields: string[] = [];
  const columns: string[] = [];
  const values: unknown[] = [];
  const assignments: string[] = [];

  let index = startIndex;

  for (const field of Object.keys(body)) {
    // `undefined` means "not supplied" — skip it without failing the request.
    if (body[field] === undefined) continue;

    const spec = Object.prototype.hasOwnProperty.call(allowlist, field)
      ? allowlist[field]
      : undefined;

    if (!spec) {
      unknownFields.push(field);
      continue;
    }

    assertSafeIdentifier(spec.column);

    // Guard against an allowlist that maps two fields to the same column.
    if (columns.includes(spec.column)) continue;

    columns.push(spec.column);
    values.push(spec.transform ? spec.transform(body[field]) : body[field]);
    assignments.push(`${spec.column} = $${index}`);
    index += 1;
  }

  if (unknownFields.length > 0) {
    throw new UnknownUpdateFieldError(unknownFields);
  }

  if (assignments.length === 0) {
    throw new NoUpdateFieldsError();
  }

  return {
    setClause: assignments.join(", "),
    values,
    columns,
    nextIndex: index,
  };
};

/**
 * Map a create payload onto columns using the same allowlist. Unknown fields
 * are rejected exactly as they are for updates, so create and update share one
 * contract.
 */
export const buildInsert = (
  payload: unknown,
  allowlist: UpdateAllowlist
): { columns: string[]; values: unknown[] } => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { columns: [], values: [] };
  }

  const body = payload as Record<string, unknown>;
  const unknownFields = Object.keys(body).filter(
    (field) =>
      body[field] !== undefined &&
      !Object.prototype.hasOwnProperty.call(allowlist, field)
  );

  if (unknownFields.length > 0) {
    throw new UnknownUpdateFieldError(unknownFields);
  }

  const columns: string[] = [];
  const values: unknown[] = [];

  for (const field of Object.keys(body)) {
    if (body[field] === undefined) continue;
    const spec = allowlist[field];
    assertSafeIdentifier(spec.column);
    if (columns.includes(spec.column)) continue;
    columns.push(spec.column);
    values.push(spec.transform ? spec.transform(body[field]) : body[field]);
  }

  return { columns, values };
};
