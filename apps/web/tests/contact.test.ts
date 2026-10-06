import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { emptyContact, submitContact, validateContact } from "../lib/contact";

const complete = () => ({ ...emptyContact(), fullName: "Jane Smith", email: "jane@example.com", serviceInterest: "software-development", message: "Help us improve our research & reporting." });

async function withResponse(response: Response | Error, run: () => Promise<void>) {
  const saved = globalThis.fetch;
  globalThis.fetch = async () => { if (response instanceof Error) throw response; return response; };
  try { await run(); } finally { globalThis.fetch = saved; }
}

describe("contact validation and confirmation", () => {
  test("required answers are named and optional fields do not block an enquiry", () => {
    assert.deepEqual(Object.keys(validateContact(emptyContact())).sort(), ["email", "fullName", "message", "serviceInterest"]);
    assert.deepEqual(validateContact(complete()), {});
  });
  test("international and short names preserve the existing form acceptance", () => {
    assert.deepEqual(validateContact({ ...complete(), fullName: "李明", message: "Help" }), {});
    assert.deepEqual(validateContact({ ...complete(), fullName: "O’Neil" }), {});
    assert.ok(validateContact({ ...complete(), message: " " }).message);
  });
  test("confirmation requires the existing successful reference response", async () => {
    await withResponse(Response.json({ success: true, data: { referenceNumber: "ACC-TEST-0001" } }, { status: 201 }), async () => {
      assert.deepEqual(await submitContact(complete()), { ok: true, referenceNumber: "ACC-TEST-0001" });
    });
    await withResponse(Response.json({ success: true }, { status: 200 }), async () => {
      const result = await submitContact(complete());
      assert.equal(result.ok, false);
      assert.match(result.ok ? "" : result.message, /before resending/);
    });
  });
  test("network, provider and proxy failures retain useful safe guidance", async () => {
    for (const response of [new TypeError("secret internal host"), Response.json({ message: "provider key SECRET /private/path" }, { status: 502 }), new Response("<html>internal host SECRET</html>", { status: 200 })]) {
      await withResponse(response, async () => {
        const result = await submitContact(complete());
        assert.equal(result.ok, false);
        if (!result.ok) {
          assert.match(result.message, /answers are still here/i);
          assert.ok(!/SECRET|private|internal host/.test(result.message));
        }
      });
    }
  });
  test("rate-limit response names the recovery action without exposing its body", async () => {
    await withResponse(Response.json({ message: "internal provider detail" }, { status: 429 }), async () => {
      const result = await submitContact(complete());
      assert.equal(result.ok, false);
      assert.match(result.ok ? "" : result.message, /try again later/);
    });
  });
  test("request retains security and business fields without HTML-encoding content", async () => {
    const saved = globalThis.fetch;
    let captured: RequestInit | undefined;
    globalThis.fetch = async (_url, init) => { captured = init; return Response.json({ success: true, data: { referenceNumber: "ACC-TEST-0001" } }, { status: 201 }); };
    try {
      await submitContact({ ...complete(), phone: "7749 101623" });
      const body = JSON.parse(String(captured?.body));
      assert.match(body.securityToken, /^[a-f0-9]{64}$/);
      assert.equal((captured?.headers as Record<string, string>)["X-Security-Token"], body.securityToken);
      assert.equal(body.phone, "+447749101623");
      assert.equal(body.message, complete().message);
      assert.equal(typeof body.timestamp, "number");
      assert.equal(typeof body.userAgent, "string");
    } finally { globalThis.fetch = saved; }
  });
});
