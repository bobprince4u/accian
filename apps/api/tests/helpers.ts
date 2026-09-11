/**
 * Test double for `src/config/database`.
 *
 * The controllers call `query(text, params)` on the shared module. These
 * helpers let a test record the SQL a handler builds and feed it a canned
 * result, so handler behaviour (status codes, response shape, and the exact
 * SQL text) can be asserted without a live PostgreSQL instance.
 */

import * as database from "../src/config/database";

export interface RecordedQuery {
  text: string;
  params: any[];
}

export interface FakeResponse {
  statusCode: number;
  body: any;
  status(code: number): FakeResponse;
  json(payload: any): FakeResponse;
}

/** Minimal stand-in for the Express response object. */
export const createResponse = (): FakeResponse => {
  const res: FakeResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

export interface QueryStub {
  /** Every query the handler issued, in order. */
  calls: RecordedQuery[];
  restore: () => void;
}

/**
 * Replace `database.query` for the duration of a test.
 *
 * @param handler Returns the result for each call. Receives the SQL text and
 *   params so a test can vary its answer per query.
 */
export const stubQuery = (
  handler: (text: string, params: any[]) => any = () => ({ rows: [], rowCount: 0 })
): QueryStub => {
  const calls: RecordedQuery[] = [];
  const original = database.query;

  const fake = async (text: string, params: any[] = []) => {
    calls.push({ text, params });
    const result = handler(text, params);
    return result instanceof Promise ? await result : result;
  };

  Object.defineProperty(database, "query", {
    value: fake,
    writable: true,
    configurable: true,
  });

  return {
    calls,
    restore: () => {
      Object.defineProperty(database, "query", {
        value: original,
        writable: true,
        configurable: true,
      });
    },
  };
};

/** Collects console output so a test can assert on what was logged. */
export const captureConsole = () => {
  const originals = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  const lines: string[] = [];

  const record =
    () =>
    (...args: unknown[]) => {
      lines.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
    };

  console.log = record();
  console.error = record();
  console.warn = record();
  console.info = record();
  console.debug = record();

  return {
    lines,
    restore: () => {
      console.log = originals.log;
      console.error = originals.error;
      console.warn = originals.warn;
      console.info = originals.info;
      console.debug = originals.debug;
    },
  };
};
