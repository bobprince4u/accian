/**
 * Pre-consultation submission — `POST /api/pre-consultation`.
 *
 * These tests drive the real middleware chain, not a mock of it: a multipart
 * body is built by hand, fed through `parsePreConsultationUpload` (which is
 * `multer`, configured as production configures it), and then handed to the
 * controller. The only thing replaced is the email transport, so everything
 * from the wire format to the composed message is the code that ships.
 *
 * That matters most for the file checks. A test that called the controller
 * with a hand-built `req.files` would never exercise the part of the system
 * most likely to be wrong — the parser limits and the field filter.
 *
 * No test here reaches the network or a database. `setEmailTransport` replaces
 * the transport, `stubQuery` replaces `email_logs`, and the real transport
 * refuses to construct a client under NODE_ENV=test regardless.
 */

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";

import { createResponse, stubQuery } from "./helpers";
import { submitPreConsultation } from "../src/controllers/preConsultationController";
import { parsePreConsultationUpload } from "../src/middleware/preConsultationUpload";
import errorHandler, { AppError } from "../src/middleware/errorHandler";
import {
  EmailMessage,
  EmailTransport,
  setEmailTransport,
} from "../src/services/emailProvider";
import { PRE_CONSULTATION_FILE_LIMITS } from "../src/utils/preConsultationContract";

process.env.PRE_CONSULTATION_RECIPIENT = "info@accian.test";

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** A byte sequence a real PDF starts with. */
const pdfBytes = (padding = 0): Buffer =>
  Buffer.concat([
    Buffer.from("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<< >>\nendobj\n", "binary"),
    Buffer.alloc(padding, 0x20),
  ]);

/** The OLE2 compound-file signature a legacy .doc starts with. */
const docBytes = (): Buffer =>
  Buffer.concat([
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    Buffer.alloc(64, 0x00),
  ]);

/** A ZIP container carrying the OOXML content-types part. */
const docxBytes = (): Buffer =>
  Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]),
    Buffer.from("[Content_Types].xml"),
    Buffer.from("word/document.xml"),
  ]);

const BOUNDARY = "----accianPreConsultationTest";

interface UploadPart {
  field: string;
  filename: string;
  content: Buffer;
  contentType?: string;
}

/** Assemble a multipart/form-data body exactly as a browser would. */
const multipartBody = (
  fields: Record<string, string | string[]>,
  files: UploadPart[] = [],
): Buffer => {
  const chunks: Buffer[] = [];

  for (const [name, value] of Object.entries(fields)) {
    for (const single of Array.isArray(value) ? value : [value]) {
      chunks.push(
        Buffer.from(
          `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${single}\r\n`,
        ),
      );
    }
  }

  for (const file of files) {
    chunks.push(
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${file.field}"; ` +
          `filename="${file.filename}"\r\n` +
          `Content-Type: ${file.contentType ?? "application/pdf"}\r\n\r\n`,
      ),
      file.content,
      Buffer.from("\r\n"),
    );
  }

  chunks.push(Buffer.from(`--${BOUNDARY}--\r\n`));
  return Buffer.concat(chunks);
};

const makeRequest = (body: Buffer, contentType?: string) => {
  const request = new Readable({
    read() {
      this.push(body);
      this.push(null);
    },
  }) as any;

  request.headers = {
    "content-type": contentType ?? `multipart/form-data; boundary=${BOUNDARY}`,
    "content-length": String(body.length),
  };
  request.method = "POST";
  request.url = "/api/pre-consultation";
  return request;
};

/** The answers a complete, valid submission carries. */
const validFields = (
  overrides: Record<string, string | string[]> = {},
): Record<string, string | string[]> => ({
  fullName: "Jane Adaeze Smith",
  email: "jane.smith@example.com",
  phone: "+44 7700 900123",
  nationality: "Nigerian",
  residence: "Manchester, United Kingdom",
  broadArea: "Health informatics",
  researchIdea: "How triage algorithms perform in under-resourced A&E units.",
  researchMethods: ["quantitative", "mixed-methods"],
  intendedProgramme: "phd-direct",
  studyMode: "full-time",
  studyCountries: ["uk", "ireland"],
  fundingNeeds: ["full-funding"],
  supportAreas: ["topic-identification", "proposal-development"],
  hasConductedResearch: "yes",
  researchDescription: "An MSc dissertation on triage outcomes.",
  declarationAccepted: "true",
  declarationName: "Jane Adaeze Smith",
  declarationSignature: "J. A. Smith",
  declarationDate: "2026-09-17",
  ...overrides,
});

const cvFile = (overrides: Partial<UploadPart> = {}): UploadPart => ({
  field: "cv",
  filename: "jane-smith-cv.pdf",
  content: pdfBytes(),
  contentType: "application/pdf",
  ...overrides,
});

// ── Harness ──────────────────────────────────────────────────────────────────

let cleanups: Array<() => void> = [];

afterEach(() => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
});

/** Transport that records what it was asked to send. */
const stubSend = () => {
  const sent: EmailMessage[] = [];
  const transport: EmailTransport = {
    name: "stub",
    send: async (message) => {
      sent.push(message);
      return { messageId: "stub-message-id" };
    },
  };
  const original = setEmailTransport(transport);
  return { sent, restore: () => setEmailTransport(original) };
};

/** Transport that rejects, to exercise the delivery-failure path. */
const stubFailingSend = (error: Error) => {
  const original = setEmailTransport({
    name: "stub-failing",
    send: async () => {
      throw error;
    },
  });
  return { restore: () => setEmailTransport(original) };
};

/**
 * Run the real chain: multipart parse, then the controller.
 *
 * An error passed to `next` by either is run through the shared error handler,
 * so the status and body asserted below are the ones a client would receive.
 */
const submit = async (body: Buffer, contentType?: string) => {
  const request = makeRequest(body, contentType);
  const response = createResponse();

  await new Promise<void>((resolve) => {
    parsePreConsultationUpload(request, response as any, (error?: unknown) => {
      if (error) {
        errorHandler(error as AppError, request, response as any, () => {});
        resolve();
        return;
      }
      submitPreConsultation(request, response as any, (controllerError: unknown) => {
        errorHandler(controllerError as AppError, request, response as any, () => {});
      })
        .then(() => resolve())
        .catch(() => resolve());
    });
  });

  return response;
};

/** Field paths named in a validation response. */
const errorPaths = (body: any): string[] =>
  (body?.errors ?? []).map((error: { path: string }) => error.path);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("a valid submission", () => {
  test("is accepted, and answers with a reference", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const response = await submit(multipartBody(validFields(), [cvFile()]));

    assert.equal(response.statusCode, 201, JSON.stringify(response.body));
    assert.equal(response.body.success, true);
    assert.match(response.body.data.referenceId, /^ACC-PC-\d{4}-[0-9A-Z]{6}$/);
    assert.ok(Date.parse(response.body.data.submittedAt));
  });

  test("reaches the transport exactly once, addressed to the consultancy", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    assert.equal(send.sent.length, 1);
    assert.equal(send.sent[0].to, "info@accian.test");
  });

  test("the subject carries the applicant name and the reference", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const response = await submit(multipartBody(validFields(), [cvFile()]));

    const { subject } = send.sent[0];
    assert.match(subject, /^New PhD Pre-Consultation Submission — /);
    assert.ok(subject.includes("Jane Adaeze Smith"), subject);
    assert.ok(subject.includes(response.body.data.referenceId), subject);
  });

  test("a reply reaches the applicant, not the noreply sender", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    assert.equal(send.sent[0].replyTo, "jane.smith@example.com");
  });

  test("the CV is attached, under a name that identifies the applicant", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const attachments = send.sent[0].attachments ?? [];
    assert.equal(attachments.length, 1);
    // Composed from the applicant and the slot, not from the uploaded name.
    // The accented slot label ("résumé") is transliterated, not dropped.
    assert.equal(
      attachments[0].filename,
      "Jane-Adaeze-Smith-CV-or-academic-resume.pdf",
    );
    assert.equal(attachments[0].contentType, "application/pdf");
    assert.ok(attachments[0].content.includes("%PDF-"));
  });

  test("the applicant's own filename is preserved in the body", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    assert.match(send.sent[0].html, /jane-smith-cv\.pdf/);
  });

  test("all thirteen sections are present, with no placeholder left behind", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const { html } = send.sent[0];
    for (const heading of [
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
    ]) {
      assert.ok(html.includes(heading), `section missing: ${heading}`);
    }
    assert.equal(html.match(/{{\s*[a-zA-Z]+\s*}}/g), null);
  });

  test("the body is rendered exactly once", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    // Placeholder substitution is a regex over the whole template and has no
    // notion of an HTML comment, so naming a placeholder in the template's own
    // documentation duplicated the entire body into that comment. Counting a
    // section heading catches any repeat of that class.
    const headings = send.sent[0].html.match(/Personal information/g) ?? [];
    assert.equal(headings.length, 1);
  });

  test("choice values are rendered as their labels, not their slugs", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const { html } = send.sent[0];
    assert.match(html, /PhD \(direct entry\)/);
    assert.match(html, /Mixed methods/);
    assert.match(html, /United Kingdom/);
    assert.ok(!html.includes("phd-direct"), "a raw slug reached the email");
  });

  test("an unanswered optional field is shown as Not provided, not dropped", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const { html } = send.sent[0];
    // `dissertationTitle` was never submitted; its row must still be there.
    assert.match(html, /Dissertation or thesis title/);
    assert.match(html, /Not provided/);
  });

  test("the outcome is recorded in email_logs without the applicant's answers", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const log = db.calls.find((c) => c.text.includes("INSERT INTO email_logs"));
    assert.ok(log, "the send was not logged");
    assert.ok(log.params.includes("sent"));
    const logged = log.params.join(" | ");
    assert.ok(!logged.includes("triage"), "an answer was written to email_logs");
  });

  test("nothing is written to a submissions table", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const writes = db.calls.filter((c) => /INSERT INTO (?!email_logs)/i.test(c.text));
    assert.deepEqual(writes, [], "the submission was persisted");
  });

  test("every optional document slot can be filled at once", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const response = await submit(
      multipartBody(validFields(), [
        cvFile(),
        { field: "transcripts", filename: "t1.pdf", content: pdfBytes() },
        { field: "transcripts", filename: "t2.pdf", content: pdfBytes() },
        {
          field: "certificates",
          filename: "cert.docx",
          content: docxBytes(),
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        {
          field: "englishTest",
          filename: "ielts.doc",
          content: docBytes(),
          contentType: "application/msword",
        },
      ]),
    );

    assert.equal(response.statusCode, 201, JSON.stringify(response.body));
    const attachments = send.sent[0].attachments ?? [];
    assert.equal(attachments.length, 5);
    // Several files in one slot are numbered so neither overwrites the other.
    const transcripts = attachments.filter((a) => a.filename.includes("transcripts"));
    assert.equal(transcripts.length, 2);
    assert.equal(new Set(transcripts.map((a) => a.filename)).size, 2);
  });
});

describe("required fields", () => {
  test("a missing full name is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const fields = validFields();
    delete fields.fullName;
    const response = await submit(multipartBody(fields, [cvFile()]));

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("fullName"));
    assert.equal(send.sent.length, 0, "an invalid submission was emailed");
  });

  test("a missing declaration is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const fields = validFields();
    delete fields.declarationAccepted;
    const response = await submit(multipartBody(fields, [cvFile()]));

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("declarationAccepted"));
  });

  test("a declaration that was not actually ticked is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields({ declarationAccepted: "false" }), [cvFile()]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("declarationAccepted"));
  });

  test("every missing field is reported at once, not one at a time", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(multipartBody({}, []));

    assert.equal(response.statusCode, 400);
    const paths = errorPaths(response.body);
    for (const field of [
      "fullName",
      "email",
      "declarationAccepted",
      "declarationName",
      "declarationDate",
      "cv",
    ]) {
      assert.ok(paths.includes(field), `${field} was not reported`);
    }
  });

  test("an optional field left blank is not an error", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const response = await submit(
      multipartBody(
        {
          fullName: "Minimal Applicant",
          email: "minimal@example.com",
          declarationAccepted: "true",
          declarationName: "Minimal Applicant",
          declarationDate: "2026-09-17",
        },
        [cvFile()],
      ),
    );

    assert.equal(response.statusCode, 201, JSON.stringify(response.body));
  });
});

describe("email validation", () => {
  test("a malformed address is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields({ email: "not-an-address" }), [cvFile()]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("email"));
  });

  test("an address carrying a header break is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    // This value would otherwise be placed in a Reply-To header.
    const response = await submit(
      multipartBody(validFields({ email: "a@b.com>\nBcc: victim@example.com" }), [
        cvFile(),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("email"));
    assert.equal(send.sent.length, 0);
  });

  test("an invalid declaration date is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields({ declarationDate: "2026-02-31" }), [cvFile()]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("declarationDate"));
  });
});

describe("documents", () => {
  test("a submission with no CV is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(multipartBody(validFields(), []));

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("cv"));
    assert.equal(send.sent.length, 0);
  });

  test("an executable renamed to .pdf is rejected on its bytes", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [
        cvFile({ content: Buffer.from("MZ\x90\x00\x03", "binary") }),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("cv"));
    assert.equal(send.sent.length, 0, "an unidentified file was attached");
  });

  test("an HTML page renamed to .pdf is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [
        cvFile({ content: Buffer.from("<html><script>alert(1)</script></html>") }),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("cv"));
  });

  test("a plain ZIP renamed to .docx is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    // A ZIP signature without the OOXML content-types part is just a ZIP.
    const response = await submit(
      multipartBody(validFields(), [
        cvFile({
          filename: "cv.docx",
          content: Buffer.concat([
            Buffer.from([0x50, 0x4b, 0x03, 0x04]),
            Buffer.from("just-some-archive/contents.txt"),
          ]),
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("cv"));
  });

  test("a disallowed extension is refused by the filter", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [
        cvFile({ filename: "cv.exe", contentType: "application/octet-stream" }),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /PDF, DOC or DOCX/);
    assert.equal(send.sent.length, 0);
  });

  test("an empty file is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [cvFile({ content: Buffer.alloc(0) })]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("cv"));
  });

  test("a file over the per-file limit is cut off and reported", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const oversized = pdfBytes(PRE_CONSULTATION_FILE_LIMITS.maxFileBytes + 1024);
    const response = await submit(multipartBody(validFields(), [cvFile({ content: oversized })]));

    assert.equal(response.statusCode, 413, JSON.stringify(response.body));
    assert.match(response.body.message, /larger than 8MB/);
    assert.equal(send.sent.length, 0);
  });

  test("more files than a slot allows is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    // `cv` has maxFiles: 1.
    const response = await submit(
      multipartBody(validFields(), [cvFile(), cvFile({ filename: "second.pdf" })]),
    );

    assert.equal(response.statusCode, 400);
    assert.equal(send.sent.length, 0);
  });

  test("a file sent to a field that is not a document slot is rejected", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [
        cvFile(),
        { field: "avatar", filename: "x.pdf", content: pdfBytes() },
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.equal(send.sent.length, 0);
  });
});

describe("malformed requests", () => {
  test("a multipart body with no boundary is a client error, not a 500", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields(), [cvFile()]),
      "multipart/form-data",
    );

    assert.equal(response.statusCode, 400, JSON.stringify(response.body));
    assert.equal(response.body.success, false);
    assert.ok(!JSON.stringify(response.body).includes("stack"));
  });

  test("a truncated body is a client error, not a 500", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const full = multipartBody(validFields(), [cvFile()]);
    const response = await submit(full.subarray(0, Math.floor(full.length / 2)));

    assert.ok(response.statusCode < 500, `got ${response.statusCode}`);
    assert.equal(send.sent.length, 0);
  });

  test("an unrecognised choice value is rejected rather than relayed", async () => {
    const send = stubSend();
    cleanups.push(send.restore);

    const response = await submit(
      multipartBody(validFields({ intendedProgramme: "<script>alert(1)</script>" }), [
        cvFile(),
      ]),
    );

    assert.equal(response.statusCode, 400);
    assert.ok(errorPaths(response.body).includes("intendedProgramme"));
  });
});

describe("sanitising", () => {
  test("markup in a free-text answer is escaped, not injected", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(
      multipartBody(
        validFields({
          researchIdea: '<script>alert("xss")</script> and 1 < 2 && 3 > 2',
        }),
        [cvFile()],
      ),
    );

    const { html } = send.sent[0];
    assert.ok(!html.includes("<script>alert"), "raw script tag was injected");
    assert.match(html, /&lt;script&gt;/);
  });

  test("markup in the applicant's name cannot break the header block", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(
      multipartBody(validFields({ fullName: '" onmouseover="alert(1)' }), [cvFile()]),
    );

    assert.ok(!send.sent[0].html.includes('onmouseover="alert(1)"'));
  });

  test("a research description is discarded when the answer was No", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    // A client that failed to clear the conditional field must not be able to
    // put an answer under a question the applicant said did not apply.
    await submit(
      multipartBody(
        validFields({
          hasConductedResearch: "no",
          researchDescription: "a stale answer the client failed to clear",
        }),
        [cvFile()],
      ),
    );

    assert.ok(!send.sent[0].html.includes("a stale answer"));
  });

  test("a duplicated checkbox value is not printed twice", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await submit(
      multipartBody(
        validFields({ studyCountries: ["uk", "uk", "ireland"] }),
        [cvFile()],
      ),
    );

    // Counted on the rendered bullet rather than the bare country name, which
    // also appears in this fixture's "country of residence" answer.
    const occurrences = send.sent[0].html.match(/• United Kingdom/g) ?? [];
    assert.equal(occurrences.length, 1);
  });
});

describe("delivery failure", () => {
  test("a rejected send answers 502 and does not claim success", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubFailingSend(new Error("Email provider unavailable"));
    cleanups.push(db.restore, send.restore);

    const response = await submit(multipartBody(validFields(), [cvFile()]));

    assert.equal(response.statusCode, 502, JSON.stringify(response.body));
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /couldn't submit your form right now/);
    assert.equal(response.body.data, undefined, "a reference was issued anyway");
  });

  test("the provider's own words do not reach the applicant", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubFailingSend(
      new Error("rejected for someone@private.test with key re_live_abc123"),
    );
    cleanups.push(db.restore, send.restore);

    const response = await submit(multipartBody(validFields(), [cvFile()]));

    const body = JSON.stringify(response.body);
    assert.ok(!body.includes("re_live_abc123"), body);
    assert.ok(!body.includes("someone@private.test"), body);
  });

  test("the failure is recorded in email_logs, redacted", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubFailingSend(new Error("upstream said re_live_secret999"));
    cleanups.push(db.restore, send.restore);

    await submit(multipartBody(validFields(), [cvFile()]));

    const log = db.calls.find((c) => c.text.includes("INSERT INTO email_logs"));
    assert.ok(log?.params.includes("failed"));
    assert.ok(!log!.params.join(" | ").includes("re_live_secret999"));
  });

  test("a missing recipient is reported as a delivery failure, not a crash", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    const originalRecipient = process.env.PRE_CONSULTATION_RECIPIENT;
    const originalAdmin = process.env.ADMIN_EMAIL;
    delete process.env.PRE_CONSULTATION_RECIPIENT;
    delete process.env.ADMIN_EMAIL;
    cleanups.push(db.restore, send.restore, () => {
      process.env.PRE_CONSULTATION_RECIPIENT = originalRecipient;
      if (originalAdmin !== undefined) process.env.ADMIN_EMAIL = originalAdmin;
    });

    const response = await submit(multipartBody(validFields(), [cvFile()]));

    assert.equal(response.statusCode, 502);
    assert.equal(send.sent.length, 0);
    assert.ok(
      !JSON.stringify(response.body).includes("PRE_CONSULTATION_RECIPIENT"),
      "a configuration variable name was disclosed to the client",
    );
  });
});
