/**
 * The API's copy of the pre-consultation contract must match the shared one.
 *
 * `apps/api/src/utils/preConsultationContract.ts` restates what
 * `@accian/types` defines, because the API may only import that package with
 * `import type` — its hosting root is `apps/api`, where the workspace symlink
 * is not guaranteed to exist, so emitting a `require("@accian/types")` would
 * pass every local check and then fail in production.
 *
 * Restating a contract is only safe if something checks the restatement. This
 * file is that check. It runs inside the workspace, where `@accian/types` does
 * resolve, and compares the two definitions field for field.
 *
 * If this test fails, one side was changed and the other was not. Fix the copy
 * — do not relax the assertion, and do not make the API import the package at
 * runtime.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import * as shared from "@accian/types";
import * as api from "../src/utils/preConsultationContract";

/** Compared as plain data so `readonly` and `as const` differences are ignored. */
const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

describe("the API contract copy matches @accian/types", () => {
  const optionLists: [string, readonly unknown[], readonly unknown[]][] = [
    ["RESEARCH_METHODS", api.RESEARCH_METHODS, shared.RESEARCH_METHODS],
    ["INTENDED_PROGRAMMES", api.INTENDED_PROGRAMMES, shared.INTENDED_PROGRAMMES],
    ["STUDY_MODES", api.STUDY_MODES, shared.STUDY_MODES],
    ["STUDY_COUNTRIES", api.STUDY_COUNTRIES, shared.STUDY_COUNTRIES],
    ["FUNDING_NEEDS", api.FUNDING_NEEDS, shared.FUNDING_NEEDS],
    ["SUPPORT_AREAS", api.SUPPORT_AREAS, shared.SUPPORT_AREAS],
    [
      "RESEARCH_EXPERIENCE_ANSWERS",
      api.RESEARCH_EXPERIENCE_ANSWERS,
      shared.RESEARCH_EXPERIENCE_ANSWERS,
    ],
  ];

  for (const [name, apiValue, sharedValue] of optionLists) {
    test(`${name} is identical`, () => {
      assert.deepEqual(plain(apiValue), plain(sharedValue));
    });
  }

  test("PRE_CONSULTATION_DOCUMENTS is identical", () => {
    assert.deepEqual(
      plain(api.PRE_CONSULTATION_DOCUMENTS),
      plain(shared.PRE_CONSULTATION_DOCUMENTS),
    );
  });

  test("PRE_CONSULTATION_FILE_LIMITS is identical", () => {
    assert.deepEqual(
      plain(api.PRE_CONSULTATION_FILE_LIMITS),
      plain(shared.PRE_CONSULTATION_FILE_LIMITS),
    );
  });

  test("PRE_CONSULTATION_REQUIRED_FIELDS is identical", () => {
    assert.deepEqual(
      plain(api.PRE_CONSULTATION_REQUIRED_FIELDS),
      plain(shared.PRE_CONSULTATION_REQUIRED_FIELDS),
    );
  });

  test("PRE_CONSULTATION_MAX_LENGTHS is identical", () => {
    assert.deepEqual(
      plain(api.PRE_CONSULTATION_MAX_LENGTHS),
      plain(shared.PRE_CONSULTATION_MAX_LENGTHS),
    );
  });

  test("the declaration and privacy notice are identical", () => {
    assert.equal(api.PRE_CONSULTATION_DECLARATION, shared.PRE_CONSULTATION_DECLARATION);
    assert.equal(
      api.PRE_CONSULTATION_PRIVACY_NOTICE,
      shared.PRE_CONSULTATION_PRIVACY_NOTICE,
    );
  });

  test("the file-count limit is the sum of the slots", () => {
    // A mismatch here would let multer's global `files` limit contradict the
    // per-slot maxCounts, rejecting a submission that every slot permitted.
    const sum = api.PRE_CONSULTATION_DOCUMENTS.reduce(
      (total, slot) => total + slot.maxFiles,
      0,
    );
    assert.equal(api.PRE_CONSULTATION_FILE_LIMITS.maxFiles, sum);
  });

  test("every required field has a declared maximum length", () => {
    for (const field of api.PRE_CONSULTATION_REQUIRED_FIELDS) {
      assert.ok(
        api.PRE_CONSULTATION_MAX_LENGTHS[field] > 0,
        `${field} has no length limit, so it would be sanitised to an empty string`,
      );
    }
  });

  test("every choice field is also a declared text field where single-valued", () => {
    // A single-choice field is read out of the sanitised text map, so it must
    // appear in the length table or it would always validate as empty.
    for (const field of Object.keys(api.SINGLE_CHOICE_FIELDS)) {
      assert.ok(
        field in api.PRE_CONSULTATION_MAX_LENGTHS,
        `${field} is a single-choice field with no length entry`,
      );
    }
  });

  test("no option value collides within its own list", () => {
    for (const [name, apiValue] of optionLists) {
      const values = (apiValue as { value: string }[]).map((o) => o.value);
      assert.equal(
        new Set(values).size,
        values.length,
        `${name} contains a duplicate value`,
      );
    }
  });
});
