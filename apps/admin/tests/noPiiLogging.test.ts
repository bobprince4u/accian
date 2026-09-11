/**
 * Regression guard: the admin app must not log personal data to the browser
 * console.
 *
 * The dashboard and contacts view previously logged full contact records,
 * names, email addresses, company names and service interests — 12 separate
 * `console.log` calls, all of which land in the browser console of whatever
 * machine an admin happens to be using, and in any log-forwarding browser
 * extension installed on it.
 *
 * This test reads the source rather than executing it: it is a static scan, so
 * it catches a reintroduced leak at test time without needing a browser, a DOM
 * or a rendered component. It is intentionally conservative — it inspects the
 * text of every `console.*` call and rejects references to contact fields and
 * to whole request/response payloads.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

const sourceFiles = (): string[] =>
  readdirSync(SRC, { recursive: true })
    .map(String)
    .filter((name) => /\.(ts|tsx)$/.test(name))
    .map((name) => join(SRC, name));

/**
 * Extract the full text of every `console.*(...)` call, following balanced
 * parentheses so a call spanning several lines is captured whole. A
 * line-by-line grep would miss exactly the multi-line calls most likely to be
 * dumping an object.
 */
const consoleCalls = (source: string): string[] => {
  const calls: string[] = [];
  const pattern = /console\s*\.\s*\w+\s*\(/g;

  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    let depth = 1;
    let i = match.index + match[0].length;

    while (i < source.length && depth > 0) {
      if (source[i] === "(") depth += 1;
      else if (source[i] === ")") depth -= 1;
      i += 1;
    }

    calls.push(source.slice(match.index, i));
  }

  return calls;
};

/** Fields of `Contact` that identify or describe a real person or business. */
const PII_FIELDS = [
  "fullName",
  "email",
  "company",
  "phone",
  "service",
  "serviceInterest",
  "budget",
  "timeline",
  "hearAbout",
];

/**
 * Identifiers that hold a whole record or payload. Logging one of these dumps
 * every field it contains, which is how the original leak happened.
 */
const BULK_IDENTIFIERS = [
  "contact",
  "contacts",
  "testimonial",
  "testimonials",
  "formData",
  "payload",
  "requestBody",
  "JSON.stringify",
  "Object.keys",
  "Object.entries",
  "Object.values",
];

test("no console call references a contact PII field", () => {
  const violations: string[] = [];

  for (const file of sourceFiles()) {
    for (const call of consoleCalls(readFileSync(file, "utf8"))) {
      for (const field of PII_FIELDS) {
        if (new RegExp(`\\b${field}\\b`).test(call)) {
          violations.push(`${file}: logs "${field}"`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Personal data must not reach the browser console:\n${violations.join("\n")}`
  );
});

test("no console call dumps a whole record or payload", () => {
  const violations: string[] = [];

  for (const file of sourceFiles()) {
    for (const call of consoleCalls(readFileSync(file, "utf8"))) {
      for (const identifier of BULK_IDENTIFIERS) {
        const escaped = identifier.replace(".", "\\.");
        if (new RegExp(`\\b${escaped}\\b`).test(call)) {
          violations.push(`${file}: logs "${identifier}"`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Whole objects must not be logged — they carry every field:\n${violations.join("\n")}`
  );
});

test("no console call logs a token or credential", () => {
  const SECRETS = ["token", "Token", "password", "Authorization", "refresh"];
  const violations: string[] = [];

  for (const file of sourceFiles()) {
    for (const call of consoleCalls(readFileSync(file, "utf8"))) {
      for (const secret of SECRETS) {
        if (new RegExp(`\\b${secret}`).test(call)) {
          violations.push(`${file}: logs "${secret}"`);
        }
      }
    }
  }

  assert.deepEqual(violations, [], violations.join("\n"));
});

test("console.log is not used anywhere in the app source", () => {
  // Every one of the 12 removed PII leaks was a `console.log`. Diagnostics that
  // survive use `console.error` with a status code and a resource name only, so
  // the absence of `console.log` is a direct regression guard on the defect.
  const offenders = sourceFiles().filter((file) =>
    /console\s*\.\s*log\s*\(/.test(readFileSync(file, "utf8"))
  );

  assert.deepEqual(
    offenders,
    [],
    `console.log reintroduced in:\n${offenders.join("\n")}`
  );
});

test("the scanner itself detects a planted leak", () => {
  // Guards against the scan silently passing because the extraction is broken.
  const planted = `
    console.log("inquiry from", contact.fullName, contact.email);
    console.log({ ...contact });
  `;

  const calls = consoleCalls(planted);
  assert.equal(calls.length, 2);
  assert.ok(calls.some((call) => /\bfullName\b/.test(call)));
  assert.ok(calls.some((call) => /\bcontact\b/.test(call)));
});

test("the scanner captures a call spanning multiple lines", () => {
  const planted = `
    console.error(
      "failed for",
      contact.email
    );
  `;

  const [call] = consoleCalls(planted);
  assert.ok(/\bemail\b/.test(call), "multi-line call must be captured whole");
});

test("the scan actually reads files", () => {
  // A typo in the source path would make every test above pass vacuously.
  const files = sourceFiles();
  assert.ok(files.length > 5, `expected app sources, found ${files.length}`);
  assert.ok(files.some((file) => file.endsWith("AdminDashboard.tsx")));
});
