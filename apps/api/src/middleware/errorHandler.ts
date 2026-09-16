import { Request, Response, NextFunction } from "express";

/**
 * Errors deliberately raised by application code.
 *
 * The distinction this class carries is a security boundary, not a
 * convenience: an `AppError` message was *written to be read by a client*,
 * so it is safe to send. Every other error reaching this middleware arrived
 * from a library — `pg`, `jsonwebtoken`, the email transport, Node itself —
 * and its message describes internals the caller must not see.
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype); // fix instanceof
  }
}

/** What a client is told when the real reason is not safe to disclose. */
const GENERIC_MESSAGE = "Internal Server Error";

/**
 * PostgreSQL SQLSTATE codes that correspond to a caller mistake rather than a
 * server fault, mapped to a status and a message that describes the mistake
 * without revealing the schema.
 *
 * A code that is absent here is not passed through — it falls to the generic
 * message. Adding one is a deliberate act of disclosure, so the replacement
 * text must never quote the driver.
 */
const PG_ERRORS: Record<string, { statusCode: number; message: string }> = {
  "23505": { statusCode: 409, message: "Resource already exists." },
  "23503": { statusCode: 400, message: "Invalid reference to another resource." },
  "22P02": { statusCode: 400, message: "Invalid data format." },
  "23502": { statusCode: 400, message: "A required field is missing." },
  "22001": { statusCode: 400, message: "A value is too long." },
};

/** Library errors whose *name* is safe to translate into a caller-facing message. */
const NAMED_ERRORS: Record<string, { statusCode: number; message: string }> = {
  ValidationError: { statusCode: 400, message: "Validation error." },
  JsonWebTokenError: { statusCode: 401, message: "Invalid token." },
  TokenExpiredError: { statusCode: 401, message: "Token expired." },
  NotBeforeError: { statusCode: 401, message: "Invalid token." },
  EntityTooLargeError: { statusCode: 413, message: "Request body is too large." },
};

/**
 * Decide what the client is told.
 *
 * Safe by default. Previously this returned `err.message` for anything
 * unrecognised, which meant an unmapped database error was relayed verbatim:
 * a connection failure answered the caller with `connect ECONNREFUSED
 * <host>:<port>`, disclosing infrastructure, and a syntax or undefined-column
 * error would have disclosed SQL and schema. Only the three mapped SQLSTATEs
 * were ever replaced; every other code fell through.
 *
 * The rule is now inverted: a message is disclosed only if it is recognised
 * as caller-facing, and anything else becomes `GENERIC_MESSAGE`. Full detail
 * still reaches the server log below, which is where an operator should read
 * it.
 */
const describe = (
  err: AppError
): { statusCode: number; message: string; code?: string } => {
  const named = err.name ? NAMED_ERRORS[err.name] : undefined;
  if (named) return named;

  // A JSON body that failed to parse: express/body-parser reports a SyntaxError
  // whose message quotes the offending input back.
  if (err instanceof SyntaxError && "body" in err) {
    return { statusCode: 400, message: "Malformed JSON in request body." };
  }

  if (err.code && PG_ERRORS[err.code]) {
    return PG_ERRORS[err.code];
  }

  // Deliberately authored for the caller, so the message may be sent as-is.
  // 5xx is excluded: an AppError(500) is a server fault whose message was
  // written for an operator, and is treated like any other internal error.
  if (err instanceof AppError && err.statusCode && err.statusCode < 500) {
    return { statusCode: err.statusCode, message: err.message, code: err.code };
  }

  return { statusCode: err.statusCode >= 400 ? err.statusCode : 500, message: GENERIC_MESSAGE };
};

// Express error handler middleware
const errorHandler = (
  err: AppError, // typed error
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode, message, code } = describe(err);

  // The server log is the place for full detail; the response is not. Kept off
  // stdout under test so the suite's output stays readable.
  if (process.env.NODE_ENV !== "test") {
    console.error(`Error (${statusCode}) ${req.method} ${req.path}:`, err.message);
    if (statusCode >= 500) {
      console.error("Stack:", err.stack);
    }
  }

  // No `stack` or raw `error` field, in any environment. A development-only
  // branch used to attach both; it meant the response shape differed between
  // environments, so the leak could only ever be found in production — and
  // `NODE_ENV` is set by the host, not by this code.
  res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  });
};

export default errorHandler;
