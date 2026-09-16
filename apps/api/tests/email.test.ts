/**
 * Item 16 — contact notification email.
 *
 * The original defect: the admin notification passed `timeZone:
 * "UK/England/wales"` to `toLocaleString`, which is not an IANA zone name.
 * That threw a RangeError while building the template data, so the function
 * failed before the provider was ever called — every admin notification was
 * lost.
 *
 * The transport is stubbed; everything up to the send is the real code, which
 * is exactly the part that used to throw. Phase 3 moved the provider behind
 * `emailProvider`, so the stub is now a transport object rather than a
 * monkey-patched vendor module — the assertions below are unchanged by that
 * move, which is the point: swapping SendGrid for Resend did not change what
 * an email says.
 *
 * No test here reaches the network. `setEmailTransport` replaces the real
 * transport, and the real transport additionally refuses to construct a live
 * client under NODE_ENV=test (asserted below).
 */

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";

import { stubQuery } from "./helpers";
import { sendAdminNotification, sendUserConfirmation } from "../src/services/emailServices";
import {
  EmailMessage,
  EmailTransport,
  getEmailTransport,
  redactProviderMessage,
  setEmailTransport,
} from "../src/services/emailProvider";

// The service reads this at send time. It is set here rather than left unset
// so the admin tests exercise a real recipient, as production does.
process.env.ADMIN_EMAIL = "admin@accian.test";

const stubSend = () => {
  const sent: EmailMessage[] = [];

  const transport: EmailTransport = {
    name: "stub",
    send: async (message: EmailMessage) => {
      sent.push(message);
      return { messageId: "stub-message-id" };
    },
  };

  const original = setEmailTransport(transport);

  return {
    sent,
    restore: () => {
      setEmailTransport(original);
    },
  };
};

/** Installs a transport that rejects, to exercise the failure path. */
const stubFailingSend = (error: Error) => {
  const original = setEmailTransport({
    name: "stub-failing",
    send: async () => {
      throw error;
    },
  });

  return {
    restore: () => {
      setEmailTransport(original);
    },
  };
};

const contactData = {
  fullName: "Test Person",
  companyName: "Test Co",
  email: "test@example.com",
  phone: "+44 20 7000 0000",
  serviceInterest: "Data Engineering",
  projectBudget: "£10k-£25k",
  projectTimeline: "Q1 2026",
  message: "We need help with a pipeline.",
  howHeard: "Referral",
  referenceNumber: "ACC-2026-0001",
  timestamp: "2026-01-15T14:30:00.000Z",
  id: 42,
};

let cleanups: Array<() => void> = [];

afterEach(() => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
});

describe("the original timezone defect", () => {
  test('"UK/England/wales" is not a valid IANA timezone', () => {
    // Documents the root cause: this is what the code used to do.
    assert.throws(
      () =>
        new Date().toLocaleString("en-GB", {
          timeZone: "UK/England/wales",
          dateStyle: "full",
          timeStyle: "long",
        }),
      RangeError
    );
  });

  test('"Europe/London" is valid and formats', () => {
    const formatted = new Date("2026-01-15T14:30:00.000Z").toLocaleString(
      "en-GB",
      { timeZone: "Europe/London", dateStyle: "full", timeStyle: "long" }
    );
    assert.match(formatted, /2026/);
  });
});

describe("sendAdminNotification", () => {
  test("formatting succeeds and the message is sent", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const result = await sendAdminNotification({ ...contactData });

    assert.equal(result.success, true, result.error);
    assert.equal(send.sent.length, 1, "no message reached the transport");
  });

  test("the timestamp is rendered in London time", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({ ...contactData });

    const { html } = send.sent[0];
    // 14:30 UTC in January is 14:30 GMT in London.
    assert.match(html, /15 January 2026/);
    assert.match(html, /14:30/);
  });

  test("no placeholder is left unsubstituted", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({ ...contactData });

    const leftover = send.sent[0].html.match(/{{\s*[a-zA-Z]+\s*}}/g);
    assert.equal(leftover, null, `unsubstituted: ${leftover?.join(", ")}`);
  });

  test("the outcome is recorded in email_logs", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({ ...contactData });

    const log = db.calls.find((c) => c.text.includes("INSERT INTO email_logs"));
    assert.ok(log, "the send was not logged");
    assert.ok(log.params.includes("sent"));
  });

  test("markup in user input is escaped, not injected", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({
      ...contactData,
      fullName: '<script>alert("xss")</script>',
      message: "1 < 2 && 3 > 2",
    });

    const { html } = send.sent[0];
    assert.ok(!html.includes("<script>alert"), "raw script tag was injected");
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /1 &lt; 2 &amp;&amp; 3 &gt; 2/);
  });

  test("a quote in user input cannot break out of an href attribute", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    // Placeholders appear inside href="mailto:{{email}}" and tel:{{phone}}.
    await sendAdminNotification({
      ...contactData,
      email: '" onmouseover="alert(1)',
    });

    const { html } = send.sent[0];
    assert.ok(!html.includes('onmouseover="alert(1)"'));
    assert.match(html, /&quot;/);
  });

  test("a $ in user input survives literally", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    // `$&` and `$1` are special in a String.replace replacement string; the
    // service passes a replacer function so they stay literal.
    await sendAdminNotification({
      ...contactData,
      message: "Budget is $50,000 — see $& and $1",
    });

    assert.match(send.sent[0].html, /\$50,000 — see \$&amp; and \$1/);
  });

  test("the admin panel link resolves to a real contact id", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({ ...contactData, id: 42 });

    const { html } = send.sent[0];
    assert.match(html, /\/contacts\/42/);
    assert.ok(!html.includes("{{id}}"), "the id placeholder survived");
  });

  test("a placeholder with no data becomes empty, not literal text", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    // `id` deliberately omitted: substitution is driven by the template, so an
    // absent key renders as empty rather than leaking "{{id}}".
    const { id: _omitted, ...withoutId } = contactData;
    await sendAdminNotification(withoutId);

    assert.ok(!send.sent[0].html.includes("{{"), send.sent[0].html.slice(0, 200));
  });

  test("user input containing a placeholder is not re-substituted", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({
      ...contactData,
      message: "Please email {{email}} and quote {{referenceNumber}}",
    });

    // The literal text the user typed must survive as typed.
    assert.match(
      send.sent[0].html,
      /Please email {{email}} and quote {{referenceNumber}}/
    );
  });

  test("optional fields being absent does not break formatting", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const result = await sendAdminNotification({
      fullName: "Minimal Person",
      email: "min@example.com",
      serviceInterest: "Consulting",
      message: "Hello",
      referenceNumber: "ACC-2026-0002",
      timestamp: "2026-01-15T14:30:00.000Z",
    });

    assert.equal(result.success, true, result.error);
    assert.equal(send.sent[0].html.match(/{{\s*[a-zA-Z]+\s*}}/g), null);
  });

  test("a numeric timestamp is accepted", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const result = await sendAdminNotification({
      ...contactData,
      timestamp: Date.parse("2026-01-15T14:30:00.000Z"),
    });

    assert.equal(result.success, true, result.error);
    assert.match(send.sent[0].html, /15 January 2026/);
  });

  test("a transport failure is reported, not thrown", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubFailingSend(new Error("Email provider unavailable"));
    cleanups.push(db.restore, send.restore);

    const result = await sendAdminNotification({ ...contactData });

    assert.equal(result.success, false);
    assert.match(result.error!, /Email provider unavailable/);

    const log = db.calls.find((c) => c.text.includes("INSERT INTO email_logs"));
    assert.ok(log?.params.includes("failed"));
  });

  test("the message is addressed to ADMIN_EMAIL, from the configured sender", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendAdminNotification({ ...contactData });

    assert.equal(send.sent[0].to, "admin@accian.test");
    assert.equal(send.sent[0].from.name, "ACCIAN Contact Form");
    assert.ok(send.sent[0].from.email.includes("@"));
  });

  test("a missing ADMIN_EMAIL fails by name, without reaching the transport", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    const original = process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAIL;
    cleanups.push(db.restore, send.restore, () => {
      process.env.ADMIN_EMAIL = original;
    });

    const result = await sendAdminNotification({ ...contactData });

    assert.equal(result.success, false);
    assert.match(result.error!, /ADMIN_EMAIL is not set/);
    assert.equal(send.sent.length, 0, "a message was sent with no recipient");
  });
});

describe("sendUserConfirmation", () => {
  test("formatting succeeds and placeholders are substituted", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    const result = await sendUserConfirmation({
      to: "test@example.com",
      fullName: "Test Person",
      serviceInterest: "Data Engineering",
      referenceNumber: "ACC-2026-0001",
    });

    assert.equal(result.success, true, result.error);
    assert.equal(send.sent[0].html.match(/{{\s*[a-zA-Z]+\s*}}/g), null);
    assert.match(send.sent[0].html, /Test Person/);
  });

  test("markup in the name is escaped", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubSend();
    cleanups.push(db.restore, send.restore);

    await sendUserConfirmation({
      to: "test@example.com",
      fullName: "<img src=x onerror=alert(1)>",
      serviceInterest: "Consulting",
      referenceNumber: "ACC-2026-0003",
    });

    assert.ok(!send.sent[0].html.includes("<img src=x"));
  });
});

describe("provider errors do not leak credentials or addresses", () => {
  test("an API key in a provider message is redacted", () => {
    const redacted = redactProviderMessage(
      "Unauthorized: API key re_AbC123_dEf456GhI is invalid"
    );

    assert.ok(!redacted.includes("re_AbC123_dEf456GhI"), redacted);
    assert.match(redacted, /\[redacted-api-key\]/);
  });

  test("a legacy SendGrid key shape is redacted too", () => {
    const redacted = redactProviderMessage("bad key SG.aaaa.bbbb-cccc_dddd");

    assert.ok(!redacted.includes("SG.aaaa"), redacted);
    assert.match(redacted, /\[redacted-api-key\]/);
  });

  test("an authorization header value is redacted", () => {
    const redacted = redactProviderMessage("sent Bearer re_secret_value_here");

    assert.ok(!redacted.includes("re_secret_value_here"), redacted);
  });

  test("a recipient address quoted back by the provider is redacted", () => {
    const redacted = redactProviderMessage(
      "Invalid recipient: someone@example.com rejected"
    );

    assert.ok(!redacted.includes("someone@example.com"), redacted);
    assert.match(redacted, /\[redacted-email\]/);
  });

  test("a redacted provider message is what reaches email_logs", async () => {
    const db = stubQuery(() => ({ rows: [], rowCount: 1 }));
    const send = stubFailingSend(
      new Error("rejected for user@private.test with key re_live_abc123")
    );
    cleanups.push(db.restore, send.restore);

    const result = await sendUserConfirmation({
      to: "user@private.test",
      fullName: "Test Person",
      serviceInterest: "Consulting",
      referenceNumber: "ACC-2026-0004",
    });

    assert.equal(result.success, false);
    assert.ok(!result.error!.includes("re_live_abc123"), result.error);
    assert.ok(!result.error!.includes("user@private.test"), result.error);

    const log = db.calls.find((c) => c.text.includes("INSERT INTO email_logs"));
    const logged = log!.params.join(" | ");
    assert.ok(!logged.includes("re_live_abc123"), "a key reached email_logs");
  });
});

describe("the real transport cannot send from the test suite", () => {
  test("constructing a live client under NODE_ENV=test is refused", async () => {
    assert.equal(process.env.NODE_ENV, "test");

    // The real transport, not a stub: no key is needed for this to refuse,
    // and it refuses before any network call is attempted.
    await assert.rejects(
      () =>
        getEmailTransport().send({
          to: "nobody@example.com",
          from: { email: "noreply@example.com", name: "ACCIAN" },
          subject: "should never be sent",
          html: "<p>should never be sent</p>",
        }),
      /NODE_ENV=test/
    );
  });
});
