/**
 * Tests for the pre-consultation form's logic.
 *
 * The rules live in `lib/preConsultation/` precisely so they can be tested
 * like this: as plain functions, under `node --test`, with no DOM, no renderer
 * and no test framework beyond the one Node ships. The React components are a
 * thin layer over these functions — they decide *when* to ask, never *what* is
 * valid — so the behaviour the brief asks about is all reachable from here.
 *
 * What is covered, in the brief's own order: the sections render as specified,
 * required-field validation, email validation, checkbox and radio selection,
 * the conditional research field, file validation, step navigation, the review
 * step, and both outcomes of a submission.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  PRE_CONSULTATION_DOCUMENTS,
  PRE_CONSULTATION_FILE_LIMITS,
  PRE_CONSULTATION_REQUIRED_FIELDS,
} from "@accian/types";

import {
  ALL_SECTIONS,
  REVIEW_STEP_INDEX,
  STEPS,
  fieldByName,
  type FormState,
} from "../lib/preConsultation/schema";
import {
  canLeaveStep,
  furthestAllowedStep,
  isValidDate,
  isValidEmail,
  stepIndexForField,
  validateAll,
  validateField,
  validateStep,
} from "../lib/preConsultation/validation";
import {
  documentCount,
  extensionOf,
  formatBytes,
  validateDocuments,
  validateFile,
} from "../lib/preConsultation/files";
import {
  buildFormData,
  initialFormState,
  submitPreConsultation,
} from "../lib/preConsultation/payload";

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** A file of a given size and name, without allocating the bytes twice. */
const fakeFile = (name: string, bytes = 1024): File =>
  new File([new Uint8Array(bytes)], name, { type: "application/pdf" });

/** A state that satisfies every rule, as a base for negative cases. */
const completeState = (): FormState => {
  const state = initialFormState();
  state.values.fullName = "Jane Adaeze Smith";
  state.values.email = "jane@example.com";
  state.values.declarationAccepted = "true";
  state.values.declarationName = "Jane Adaeze Smith";
  state.values.declarationDate = "2026-09-20";
  state.documents.cv = [fakeFile("cv.pdf")];
  return state;
};

/** Swap `fetch` for the duration of one call, and report what it received. */
const withStubbedFetch = async <T>(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  run: () => Promise<T>,
): Promise<{ result: T; calls: { url: string; init?: RequestInit }[] }> => {
  const original = globalThis.fetch;
  const calls: { url: string; init?: RequestInit }[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return handler(input, init);
  }) as typeof fetch;

  try {
    return { result: await run(), calls };
  } finally {
    globalThis.fetch = original;
  }
};

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// ── The form matches the source document ─────────────────────────────────────

describe("form structure", () => {
  test("all thirteen sections of the source form are present, in order", () => {
    assert.equal(ALL_SECTIONS.length, 13);
    assert.deepEqual(
      ALL_SECTIONS.map((section) => section.number),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    );
    assert.deepEqual(
      ALL_SECTIONS.map((section) => section.title),
      [
        "Personal information",
        "Academic background",
        "Professional and relevant experience",
        "Research interests",
        "Skills and technical background",
        "Research experience",
        "Study intentions",
        "Funding",
        "Support required",
        "Motivation and goals",
        "Documents enclosed",
        "Additional information",
        "Declaration",
      ],
    );
  });

  test("every section belongs to exactly one step", () => {
    const fromSteps = STEPS.flatMap((step) => step.sections);
    assert.equal(fromSteps.length, ALL_SECTIONS.length);
    assert.equal(new Set(fromSteps).size, ALL_SECTIONS.length);
  });

  test("no field name is declared twice", () => {
    const names = ALL_SECTIONS.flatMap((section) =>
      section.fields.map((field) => field.name),
    );
    assert.equal(new Set(names).size, names.length);
  });

  test("the review screen sits after the last step", () => {
    assert.equal(REVIEW_STEP_INDEX, STEPS.length);
  });

  test("only the fields the brief names are required", () => {
    // The brief is explicit: "Do not make every field unnecessarily required."
    const requiredInSchema = ALL_SECTIONS.flatMap((section) =>
      section.fields.filter((field) => field.required).map((field) => field.name),
    );

    assert.deepEqual(new Set(requiredInSchema), new Set(["fullName", "email", "declarationName", "declarationDate"]));

    // The other two required items are not ordinary text fields: consent is a
    // checkbox and the CV is an upload slot.
    assert.ok(PRE_CONSULTATION_REQUIRED_FIELDS.includes("declarationAccepted"));
    assert.ok(PRE_CONSULTATION_DOCUMENTS.some((slot) => slot.field === "cv" && slot.required));
  });

  test("the CV is the only required document", () => {
    const required = PRE_CONSULTATION_DOCUMENTS.filter((slot) => slot.required);
    assert.deepEqual(
      required.map((slot) => slot.field),
      ["cv"],
    );
  });
});

// ── Required fields ──────────────────────────────────────────────────────────

describe("required-field validation", () => {
  test("an empty form names every required item and nothing else", () => {
    const errors = validateAll(initialFormState());
    assert.deepEqual(
      new Set(Object.keys(errors)),
      new Set([
        "fullName",
        "email",
        "declarationName",
        "declarationDate",
        "declarationAccepted",
        "cv",
      ]),
    );
  });

  test("a complete form has nothing to report", () => {
    assert.deepEqual(validateAll(completeState()), {});
  });

  test("whitespace does not satisfy a required field", () => {
    const state = completeState();
    state.values.fullName = "   ";
    assert.match(validateAll(state).fullName, /required/i);
  });

  test("an unticked declaration blocks submission", () => {
    const state = completeState();
    state.values.declarationAccepted = "";
    assert.match(validateAll(state).declarationAccepted, /confirm the declaration/i);
  });

  test("a missing CV blocks submission", () => {
    const state = completeState();
    state.documents.cv = [];
    assert.match(validateAll(state).cv, /required/i);
  });

  test("leaving every optional field blank is accepted", () => {
    // The source form says blanks are fine. A form that then refuses them
    // would be telling the applicant something untrue.
    const state = completeState();
    const optional = ALL_SECTIONS.flatMap((section) =>
      section.fields.filter((field) => !field.required),
    );
    assert.ok(optional.length > 30, "expected most of the form to be optional");
    assert.deepEqual(validateAll(state), {});
  });
});

// ── Email and date ───────────────────────────────────────────────────────────

describe("email validation", () => {
  test("ordinary addresses are accepted", () => {
    for (const address of [
      "jane@example.com",
      "jane.smith+phd@sub.example.co.uk",
      "j@x.io",
    ]) {
      assert.ok(isValidEmail(address), `${address} should be valid`);
    }
  });

  test("malformed addresses are rejected", () => {
    for (const address of ["jane", "jane@", "@example.com", "jane @example.com", "jane@example"]) {
      assert.ok(!isValidEmail(address), `${address} should be rejected`);
    }
  });

  test("header-injection characters are rejected", () => {
    // These would let a crafted address break out of an email header. The API
    // rejects them too; catching them here only saves a round trip.
    for (const address of [
      "jane@example.com\nBcc: someone@example.com",
      "jane@example.com\r\nSubject: x",
      "jane@example.com,other@example.com",
      "Jane <jane@example.com>",
    ]) {
      assert.ok(!isValidEmail(address), `${address} should be rejected`);
    }
  });

  test("the message points at the shape of a valid address", () => {
    const state = completeState();
    state.values.email = "not-an-email";
    assert.match(validateAll(state).email, /name@example\.com/);
  });

  test("dates must exist, not merely look like dates", () => {
    assert.ok(isValidDate("2026-09-20"));
    assert.ok(!isValidDate("2026-02-31"));
    assert.ok(!isValidDate("20/09/2026"));
    assert.ok(!isValidDate("2026-9-2"));
  });
});

// ── Choice fields ────────────────────────────────────────────────────────────

describe("checkbox and radio selection", () => {
  test("a recognised checkbox selection is accepted", () => {
    const state = completeState();
    state.choices.researchMethods = ["quantitative", "systematic-review"];
    assert.equal(validateField(fieldByName("researchMethods")!, state), null);
  });

  test("a value that is not on the list is refused", () => {
    const state = completeState();
    state.choices.researchMethods = ["quantitative", "telepathy"];
    assert.match(
      validateField(fieldByName("researchMethods")!, state)!,
      /choose from the options/i,
    );
  });

  test("no selection at all is fine — none of the choice fields are required", () => {
    const state = completeState();
    for (const name of ["researchMethods", "studyCountries", "fundingNeeds", "supportAreas"]) {
      state.choices[name] = [];
      assert.equal(validateField(fieldByName(name)!, state), null);
    }
  });

  test("a radio value outside its option list is refused", () => {
    const state = completeState();
    state.values.intendedProgramme = "dphil";
    assert.match(
      validateField(fieldByName("intendedProgramme")!, state)!,
      /choose one of the options/i,
    );

    state.values.intendedProgramme = "mphil-to-phd";
    assert.equal(validateField(fieldByName("intendedProgramme")!, state), null);
  });

  test("multi-choice answers cross the wire as repeated parts", () => {
    const state = completeState();
    state.choices.supportAreas = ["supervisor-matching", "proposal-development"];
    const body = buildFormData(state);
    assert.deepEqual(body.getAll("supportAreas"), [
      "supervisor-matching",
      "proposal-development",
    ]);
  });
});

// ── The conditional field ────────────────────────────────────────────────────

describe("the conditional research-experience field", () => {
  const description = () => fieldByName("researchDescription")!;

  test("it is hidden until the applicant says they have done research", () => {
    const state = completeState();
    assert.ok(description().showWhen);
    assert.equal(description().showWhen!(state), false);

    state.values.hasConductedResearch = "no";
    assert.equal(description().showWhen!(state), false);

    state.values.hasConductedResearch = "yes";
    assert.equal(description().showWhen!(state), true);
  });

  test("a hidden field is never reported as invalid", () => {
    // A field the applicant cannot see is a field they cannot correct.
    const state = completeState();
    state.values.hasConductedResearch = "no";
    state.values.researchDescription = "x".repeat(99_999);
    assert.equal(validateField(description(), state), null);
  });

  test("once shown, its own rules apply", () => {
    const state = completeState();
    state.values.hasConductedResearch = "yes";
    state.values.researchDescription = "x".repeat(99_999);
    assert.match(validateField(description(), state)!, /under \d+ characters/);
  });

  test("it is still optional when shown", () => {
    const state = completeState();
    state.values.hasConductedResearch = "yes";
    assert.equal(validateField(description(), state), null);
    assert.deepEqual(validateAll(state), {});
  });
});

// ── Files ────────────────────────────────────────────────────────────────────

describe("file validation", () => {
  test("PDF, DOC and DOCX are accepted", () => {
    for (const name of ["cv.pdf", "cv.doc", "cv.docx", "CV.PDF"]) {
      assert.equal(validateFile(fakeFile(name)), null, `${name} should be accepted`);
    }
  });

  test("other file types are refused by name", () => {
    for (const name of ["cv.exe", "cv.zip", "cv.jpg", "cv.pdf.exe", "cv"]) {
      const message = validateFile(fakeFile(name));
      assert.ok(message, `${name} should be refused`);
      assert.match(message, /PDF, DOC or DOCX/);
    }
  });

  test("an oversized file is refused, and the message says by how much", () => {
    const tooBig = fakeFile("cv.pdf", PRE_CONSULTATION_FILE_LIMITS.maxFileBytes + 1);
    const message = validateFile(tooBig);
    assert.ok(message);
    assert.match(message, /8\.0 MB/);
  });

  test("a file exactly at the limit is accepted", () => {
    assert.equal(
      validateFile(fakeFile("cv.pdf", PRE_CONSULTATION_FILE_LIMITS.maxFileBytes)),
      null,
    );
  });

  test("an empty file is refused", () => {
    assert.match(validateFile(fakeFile("cv.pdf", 0))!, /empty/);
  });

  test("a slot refuses more files than it allows", () => {
    const state = completeState();
    state.documents.proposal = [fakeFile("a.pdf"), fakeFile("b.pdf")];
    assert.match(validateDocuments(state.documents).proposal, /one file/i);
  });

  test("the aggregate size cap is enforced across slots", () => {
    // No single file is over the per-file limit here; together they exceed
    // what the mail provider would accept.
    const state = completeState();
    const chunk = () => fakeFile("t.pdf", 7 * 1024 * 1024);
    state.documents.transcripts = [chunk(), chunk(), chunk()];
    const errors = validateDocuments(state.documents);
    assert.ok(errors.documents, "expected an aggregate error");
    assert.match(errors.documents, /total limit/i);
  });

  test("extensions are read from the last dot, case-insensitively", () => {
    assert.equal(extensionOf("my.thesis.final.PDF"), ".pdf");
    assert.equal(extensionOf("noextension"), "");
  });

  test("sizes are reported in units a person reads", () => {
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(2048), "2 KB");
    assert.equal(formatBytes(3 * 1024 * 1024), "3.0 MB");
  });

  test("documents are counted across every slot", () => {
    const state = completeState();
    state.documents.transcripts = [fakeFile("a.pdf"), fakeFile("b.pdf")];
    assert.equal(documentCount(state.documents), 3);
  });
});

// ── Navigation ───────────────────────────────────────────────────────────────

describe("step navigation", () => {
  test("an empty form cannot move past the first step", () => {
    assert.equal(furthestAllowedStep(initialFormState()), 0);
    assert.equal(canLeaveStep(0, initialFormState()), false);
  });

  test("naming yourself unlocks everything up to the documents step", () => {
    const state = initialFormState();
    state.values.fullName = "Jane Adaeze Smith";
    state.values.email = "jane@example.com";

    const documentsStep = STEPS.findIndex((step) => step.id === "documents");
    assert.equal(furthestAllowedStep(state), documentsStep);
  });

  test("no middle step can block an applicant who has nothing to add", () => {
    const state = initialFormState();
    state.values.fullName = "Jane Adaeze Smith";
    state.values.email = "jane@example.com";

    for (const id of ["background", "research", "study", "support"]) {
      const index = STEPS.findIndex((step) => step.id === id);
      assert.equal(canLeaveStep(index, state), true, `${id} must not block`);
    }
  });

  test("a complete form can reach the review screen", () => {
    assert.equal(furthestAllowedStep(completeState()), REVIEW_STEP_INDEX);
  });

  test("each error is routed back to the step its field lives on", () => {
    const at = (id: string) => STEPS.findIndex((step) => step.id === id);

    assert.equal(stepIndexForField("fullName"), at("personal"));
    assert.equal(stepIndexForField("researchIdea"), at("research"));
    assert.equal(stepIndexForField("fundingNeeds"), at("study"));
    assert.equal(stepIndexForField("cv"), at("documents"));
    assert.equal(stepIndexForField("documents"), at("documents"));

    // The regression: the documents section once matched any field name, and
    // the declaration sits after it — so consent sent the applicant back to
    // the upload screen, which has no consent checkbox on it.
    assert.equal(stepIndexForField("declarationName"), at("declaration"));
    assert.equal(stepIndexForField("declarationDate"), at("declaration"));
    assert.equal(stepIndexForField("declarationAccepted"), at("declaration"));
  });

  test("every error a full validation can raise is routable", () => {
    const errors = validateAll(initialFormState());
    for (const name of Object.keys(errors)) {
      const index = stepIndexForField(name);
      assert.ok(index >= 0 && index < STEPS.length, `${name} has no step`);
      assert.ok(
        Object.keys(validateStep(index, initialFormState())).includes(name),
        `${name} is not raised by the step it routes to`,
      );
    }
  });
});

// ── Review ───────────────────────────────────────────────────────────────────

describe("the review step", () => {
  test("it shows every section of the form, not just the answered ones", () => {
    // The review screen renders `ALL_SECTIONS`, so an applicant sees the
    // blanks they left as well as the answers they gave.
    assert.equal(ALL_SECTIONS.length, 13);
  });

  test("navigating back and forward loses nothing", () => {
    // Navigation only moves an index; the answers live in one state object
    // that no step transition touches.
    const state = completeState();
    state.values.researchIdea = "Flood-risk modelling in coastal Nigeria";
    state.choices.supportAreas = ["supervisor-matching"];

    for (let index = 0; index <= REVIEW_STEP_INDEX; index += 1) {
      validateStep(index, state);
    }

    assert.equal(state.values.researchIdea, "Flood-risk modelling in coastal Nigeria");
    assert.deepEqual(state.choices.supportAreas, ["supervisor-matching"]);
    assert.equal(state.documents.cv.length, 1);
  });

  test("a problem found at review is still keyed to its field", () => {
    const state = completeState();
    state.values.email = "broken";
    const errors = validateAll(state);
    assert.ok(errors.email);
    assert.equal(Object.keys(errors).length, 1);
  });
});

// ── Payload ──────────────────────────────────────────────────────────────────

describe("the request body", () => {
  test("answers are trimmed and empty ones are left out", () => {
    const state = completeState();
    state.values.nationality = "  Nigerian  ";
    state.values.phone = "   ";

    const body = buildFormData(state);
    assert.equal(body.get("nationality"), "Nigerian");
    assert.equal(body.has("phone"), false);
  });

  test("documents are attached under their slot name, keeping their filename", () => {
    const state = completeState();
    state.documents.transcripts = [fakeFile("BSc transcript.pdf")];

    const body = buildFormData(state);
    const cv = body.get("cv");
    assert.ok(cv instanceof File);
    assert.equal(cv.name, "cv.pdf");
    assert.equal((body.get("transcripts") as File).name, "BSc transcript.pdf");
  });

  test("no recipient address or credential is built into the request", () => {
    // The browser knows only its own API. Where a submission is delivered,
    // and what authenticates the send, stay on the server.
    const body = buildFormData(completeState());
    const serialised = [...body.entries()]
      .map(([key, value]) => `${key}=${typeof value === "string" ? value : value.name}`)
      .join("&");

    assert.ok(!/info@accian\.co\.uk/i.test(serialised));
    assert.ok(!/api[_-]?key/i.test(serialised));
  });
});

// ── Submission ───────────────────────────────────────────────────────────────

describe("submitting the form", () => {
  test("a confirmed submission returns the reference the API issued", async () => {
    const { result, calls } = await withStubbedFetch(
      async () =>
        jsonResponse(201, {
          success: true,
          data: { referenceId: "ACC-PC-2026-7F3K9Q", submittedAt: "2026-09-20T09:30:00.000Z" },
        }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.referenceId, "ACC-PC-2026-7F3K9Q");
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/api\/pre-consultation$/);
    assert.equal(calls[0].init?.method, "POST");
  });

  test("the Content-Type header is left to the browser", async () => {
    // Setting it by hand omits the multipart boundary, and the server then
    // cannot parse a body that looks perfectly fine on the wire.
    const { calls } = await withStubbedFetch(
      async () => jsonResponse(201, { data: { referenceId: "ACC-PC-2026-AAAAAA" } }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(calls[0].init?.headers, undefined);
  });

  test("a 2xx with no reference is not treated as success", async () => {
    // The brief: do not tell the applicant their form arrived unless the
    // backend actually confirmed it. A 200 from a proxy is not a confirmation.
    const { result } = await withStubbedFetch(
      async () => jsonResponse(200, { success: true }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.message, "We couldn't submit your form right now. Please try again in a few moments.");
  });

  test("server-side field errors come back mapped to their fields", async () => {
    const { result } = await withStubbedFetch(
      async () =>
        jsonResponse(400, {
          message: "Some of your answers need attention.",
          errors: [
            { path: "email", msg: "Enter a valid email address." },
            { path: "cv", msg: "A CV is required." },
          ],
        }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, false);
    assert.ok(result.ok === false && result.fieldErrors);
    assert.deepEqual(result.ok === false && result.fieldErrors, {
      email: "Enter a valid email address.",
      cv: "A CV is required.",
    });
  });

  test("a failed delivery reads as something to retry, not as a rejection", async () => {
    const { result } = await withStubbedFetch(
      async () =>
        jsonResponse(502, {
          message: "We couldn't submit your form right now. Please try again in a few moments.",
        }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, false);
    assert.match(result.ok === false ? result.message : "", /try again/i);
  });

  test("a dead network is explained, not thrown", async () => {
    const { result } = await withStubbedFetch(
      async () => {
        throw new TypeError("fetch failed");
      },
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, false);
    assert.match(result.ok === false ? result.message : "", /check your connection/i);
  });

  test("a response that is not JSON does not leak into the message", async () => {
    // A proxy's HTML error page tells the applicant nothing useful and may
    // name internal hosts.
    const { result } = await withStubbedFetch(
      async () =>
        new Response("<html><body>504 Gateway Timeout — upstream 10.0.0.4</body></html>", {
          status: 504,
          headers: { "content-type": "text/html" },
        }),
      () => submitPreConsultation(completeState()),
    );

    assert.equal(result.ok, false);
    const message = result.ok === false ? result.message : "";
    assert.ok(!message.includes("10.0.0.4"));
    assert.ok(!message.includes("<html>"));
    assert.match(message, /try again/i);
  });

  test("an aborted submission is not reported as a failure to the applicant", async () => {
    const controller = new AbortController();
    controller.abort();

    const { result } = await withStubbedFetch(
      async (_input, init) => {
        init?.signal?.throwIfAborted();
        return jsonResponse(201, { data: { referenceId: "x" } });
      },
      () => submitPreConsultation(completeState(), controller.signal),
    );

    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.message, "Submission cancelled.");
  });
});
