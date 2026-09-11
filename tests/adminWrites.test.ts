/**
 * Item 2 — project create/update share one contract.
 * Item 4 — testimonial create no longer 400s on a valid admin payload.
 * Item 3 — arbitrary SQL identifiers are rejected at the handler boundary.
 */

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";

import { stubQuery, createResponse, captureConsole } from "./helpers";
import { createProject, updateProject } from "../src/controllers/adminController";
import {
  createTestimonial,
  updateTestimonial,
} from "../src/controllers/testimonialController";
import { updateService } from "../src/controllers/serviceController";

const noopNext = (() => undefined) as any;

/** The payload ProjectFormModal actually submits. */
const adminProjectPayload = {
  title: "Acme Platform",
  client: "Acme Ltd",
  category: "Web Development",
  industry: "Retail",
  description: "A description",
  challenge: "The challenge",
  solution: "The solution",
  image: "https://example.com/cover.png",
  status: "Published",
  featured: true,
  technologies: ["TypeScript", "PostgreSQL"],
  results: [{ metric: "Uptime", value: "99.9%" }],
  completedDate: "2026-01-01",
};

/** The payload TestimonialFormModal actually submits. */
const adminTestimonialPayload = {
  name: "Jane Doe",
  position: "CTO",
  company: "Acme Ltd",
  message: "Excellent delivery.",
  rating: 5,
  featured: true,
  image: "",
  createdAt: "2026-01-01",
};

let active: { restore: () => void } | null = null;

afterEach(() => {
  active?.restore();
  active = null;
});

describe("createProject", () => {
  test("accepts the admin form payload and returns a serialized project", async () => {
    const stub = stubQuery(() => ({
      rows: [
        {
          id: 12,
          title: "Acme Platform",
          slug: "acme-platform",
          client_name: "Acme Ltd",
          project_type: "Web Development",
          image_url: "https://example.com/cover.png",
          technology_stack: ["TypeScript", "PostgreSQL"],
          results: JSON.stringify([{ metric: "Uptime", value: "99.9%" }]),
          published: true,
          featured: true,
        },
      ],
      rowCount: 1,
    }));
    active = stub;

    const res = createResponse();
    await createProject({ body: adminProjectPayload } as any, res as any, noopNext);

    assert.equal(res.statusCode, 201, JSON.stringify(res.body));
    assert.equal(res.body.success, true);

    const dto = res.body.data;
    assert.equal(dto.id, "12");
    assert.equal(dto.client, "Acme Ltd");
    assert.equal(dto.category, "Web Development");
    assert.equal(dto.status, "Published");
    assert.deepEqual(dto.technologies, ["TypeScript", "PostgreSQL"]);
    assert.deepEqual(dto.results, [{ metric: "Uptime", value: "99.9%" }]);
  });

  test("writes the correct columns and does not invent any", () => {
    // Asserted via the recorded SQL in the previous style, run fresh here.
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    return createProject(
      { body: adminProjectPayload } as any,
      createResponse() as any,
      noopNext
    ).then(() => {
      const insert = stub.calls[0];
      assert.match(insert.text, /INSERT INTO projects/);

      // `completedDate` has no column: it must be discarded, not invented.
      assert.ok(!insert.text.includes("completed"), insert.text);

      for (const column of [
        "title",
        "client_name",
        "project_type",
        "image_url",
        "technology_stack",
        "published",
      ]) {
        assert.ok(
          insert.text.includes(column),
          `expected column ${column} in: ${insert.text}`
        );
      }
    });
  });

  test("derives a slug when the client does not send one", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    await createProject(
      { body: { title: "Hello World Project" } } as any,
      createResponse() as any,
      noopNext
    );

    assert.ok(stub.calls[0].params.includes("hello-world-project"));
  });

  test("rejects a payload with no title", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await createProject({ body: { client: "Acme" } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 400);
  });

  test("rejects an arbitrary field instead of putting it in SQL", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await createProject(
      { body: { title: "T", "password_hash = 'x'": 1 } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 400);
    assert.equal(stub.calls.length, 0, "no SQL should have been executed");
  });
});

describe("updateProject", () => {
  test("accepts the admin form payload and returns a serialized project", async () => {
    const stub = stubQuery(() => ({
      rows: [
        {
          id: 12,
          title: "Acme Platform",
          client_name: "Acme Ltd",
          published: false,
        },
      ],
      rowCount: 1,
    }));
    active = stub;

    const res = createResponse();
    await updateProject(
      { params: { id: "12" }, body: { ...adminProjectPayload, status: "Draft" } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.status, "Draft");
    assert.equal(res.body.data.client, "Acme Ltd");
  });

  test("uses the same field vocabulary as create", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await updateProject(
      { params: { id: "1" }, body: adminProjectPayload } as any,
      res as any,
      noopNext
    );

    // The exact payload that create accepts must not 400 on update.
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.match(stub.calls[0].text, /UPDATE projects SET/);
    assert.match(stub.calls[0].text, /client_name = \$/);
  });

  test("rejects an arbitrary SQL identifier", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await updateProject(
      {
        params: { id: "1" },
        body: { "published = true WHERE 1=1; --": "x" },
      } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 400);
    assert.equal(stub.calls.length, 0, "no SQL should have been executed");
    assert.match(res.body.message, /Unknown field/i);
  });

  test("404s when the project does not exist", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await updateProject(
      { params: { id: "999" }, body: { title: "T" } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 404);
  });
});

describe("createTestimonial", () => {
  test("accepts the admin form payload (previously always 400)", async () => {
    const stub = stubQuery(() => ({
      rows: [
        {
          id: 5,
          client_name: "Jane Doe",
          client_position: "CTO",
          client_company: "Acme Ltd",
          testimonial_text: "Excellent delivery.",
          rating: 5,
          featured: true,
          image_url: null,
        },
      ],
      rowCount: 1,
    }));
    active = stub;

    const res = createResponse();
    await createTestimonial(
      { body: adminTestimonialPayload } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 201, JSON.stringify(res.body));
    assert.equal(res.body.data.name, "Jane Doe");
    assert.equal(res.body.data.message, "Excellent delivery.");

    const insert = stub.calls[0];
    assert.match(insert.text, /INSERT INTO testimonials/);
    assert.ok(insert.text.includes("client_name"));
    assert.ok(insert.text.includes("testimonial_text"));
    // `createdAt` is owned by the database and must not be client-settable.
    assert.ok(!insert.text.includes("created_at"), insert.text);
  });

  test("still accepts the legacy clientName/testimonialText vocabulary", async () => {
    active = stubQuery(() => ({
      rows: [{ id: 6, client_name: "Bob", testimonial_text: "Good" }],
      rowCount: 1,
    }));

    const res = createResponse();
    await createTestimonial(
      { body: { clientName: "Bob", testimonialText: "Good" } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 201, JSON.stringify(res.body));
  });

  test("rejects a genuinely empty submission", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await createTestimonial({ body: {} } as any, res as any, noopNext);

    assert.equal(res.statusCode, 400);
  });

  test("rejects an out-of-range rating", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await createTestimonial(
      { body: { ...adminTestimonialPayload, rating: 9 } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Rating/i);
  });

  test("does not log the client name", async () => {
    active = stubQuery(() => ({
      rows: [{ id: 5, client_name: "Jane Doe" }],
      rowCount: 1,
    }));
    const logs = captureConsole();

    try {
      await createTestimonial(
        { body: adminTestimonialPayload } as any,
        createResponse() as any,
        noopNext
      );
    } finally {
      logs.restore();
    }

    const combined = logs.lines.join("\n");
    assert.ok(!combined.includes("Jane Doe"), combined);
  });
});

describe("updateTestimonial", () => {
  test("accepts the admin form payload", async () => {
    const stub = stubQuery(() => ({
      rows: [
        {
          id: 5,
          client_name: "Jane Doe",
          testimonial_text: "Updated text.",
          rating: 4,
        },
      ],
      rowCount: 1,
    }));
    active = stub;

    const res = createResponse();
    await updateTestimonial(
      {
        params: { id: "5" },
        body: { ...adminTestimonialPayload, message: "Updated text.", rating: 4 },
      } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.message, "Updated text.");
    assert.match(stub.calls[0].text, /testimonial_text = \$/);
  });

  test("rejects an arbitrary SQL identifier", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await updateTestimonial(
      { params: { id: "1" }, body: { "rating = 5, published": true } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 400);
    assert.equal(stub.calls.length, 0);
  });
});

describe("updateService", () => {
  test("updates through the allowlist and returns a serialized service", async () => {
    const stub = stubQuery(() => ({
      rows: [
        {
          id: 2,
          title: "Data Science",
          short_description: "Short",
          features: ["a"],
        },
      ],
      rowCount: 1,
    }));
    active = stub;

    const res = createResponse();
    await updateService(
      {
        params: { id: "2" },
        body: { title: "Data Science", shortDescription: "Short" },
      } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.shortDescription, "Short");
    assert.equal(typeof res.body.data.id, "number");
    assert.match(stub.calls[0].text, /short_description = \$/);
  });

  test("rejects an arbitrary SQL identifier", async () => {
    const stub = stubQuery(() => ({ rows: [{ id: 1 }], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await updateService(
      { params: { id: "1" }, body: { "published = true; DROP TABLE services": 1 } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 400);
    assert.equal(stub.calls.length, 0);
  });
});
