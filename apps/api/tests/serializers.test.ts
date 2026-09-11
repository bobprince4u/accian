/**
 * Item 5 — contact status normalisation.
 * Item 1 / 15 — response serialisation casing.
 * Item 11 — active project count source of truth.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  toApiContactStatus,
  toDbContactStatus,
  isValidApiContactStatus,
  CONTACT_STATUSES,
} from "../src/utils/contactStatus";
import {
  serializeContact,
  serializeProject,
  serializeService,
  serializeTestimonial,
  parseProjectResults,
  serializeProjectResults,
} from "../src/utils/serializers";

describe("contact status — one canonical representation", () => {
  test('"In Progress" survives a write/read round trip', () => {
    // The original defect: the write path stored "in-progress" but one read
    // path only recognised "in_progress", so the list showed "New".
    const db = toDbContactStatus("In Progress");
    assert.equal(db, "in-progress");
    assert.equal(toApiContactStatus(db), "In Progress");
  });

  test("every API status round trips", () => {
    for (const status of CONTACT_STATUSES) {
      const db = toDbContactStatus(status);
      assert.ok(db, `${status} should map to a database value`);
      assert.equal(toApiContactStatus(db), status);
    }
  });

  test("legacy underscore rows still read correctly", () => {
    assert.equal(toApiContactStatus("in_progress"), "In Progress");
  });

  test("unknown values fall back to New rather than throwing", () => {
    assert.equal(toApiContactStatus("nonsense"), "New");
    assert.equal(toApiContactStatus(null), "New");
    assert.equal(toApiContactStatus(undefined), "New");
    assert.equal(toApiContactStatus(42), "New");
  });

  test("invalid statuses are rejected on write", () => {
    assert.equal(toDbContactStatus("Archived"), null);
    assert.equal(toDbContactStatus(""), null);
    assert.equal(toDbContactStatus(undefined), null);
    assert.equal(isValidApiContactStatus("Archived"), false);
    assert.equal(isValidApiContactStatus("In Progress"), true);
  });
});

describe("serializeContact — API contract casing", () => {
  const row = {
    id: 7,
    full_name: "Test Person",
    email: "test@example.com",
    company_name: "Test Co",
    phone: "123",
    service_interest: "Consulting",
    project_budget: "10k",
    project_timeline: "Q1",
    message: "Hello",
    how_heard: "Referral",
    status: "in-progress",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  };

  test("maps snake_case columns to the camelCase contract", () => {
    const dto = serializeContact(row);

    assert.equal(dto.id, "7");
    assert.equal(dto.fullName, "Test Person");
    assert.equal(dto.company, "Test Co");
    assert.equal(dto.service, "Consulting");
    assert.equal(dto.budget, "10k");
    assert.equal(dto.timeline, "Q1");
    assert.equal(dto.hearAbout, "Referral");
    assert.equal(dto.status, "In Progress");
  });

  test("no snake_case key leaks into the response", () => {
    const dto = serializeContact(row) as unknown as Record<string, unknown>;
    for (const key of Object.keys(dto)) {
      assert.ok(!key.includes("_"), `${key} leaks database naming`);
    }
  });

  test("id is a string, matching the admin Contact type", () => {
    assert.equal(typeof serializeContact(row).id, "string");
  });
});

describe("serializeProject — published boolean to status string", () => {
  test("published=true becomes Published, false becomes Draft", () => {
    assert.equal(serializeProject({ id: 1, published: true }).status, "Published");
    assert.equal(serializeProject({ id: 1, published: false }).status, "Draft");
  });

  test("maps the columns the admin UI binds to", () => {
    const dto = serializeProject({
      id: 3,
      title: "Site",
      client_name: "Acme",
      project_type: "Web",
      image_url: "https://example.com/i.png",
      technology_stack: ["ts", "pg"],
      published: true,
    });

    assert.equal(dto.client, "Acme");
    assert.equal(dto.category, "Web");
    assert.equal(dto.image, "https://example.com/i.png");
    assert.deepEqual(dto.technologies, ["ts", "pg"]);
    assert.equal(dto.id, "3");
  });

  test("no snake_case key leaks into the response", () => {
    const dto = serializeProject({ id: 1, client_name: "x" }) as unknown as Record<
      string,
      unknown
    >;
    for (const key of Object.keys(dto)) {
      assert.ok(!key.includes("_"), `${key} leaks database naming`);
    }
  });

  test("a missing technology_stack is an array, not null", () => {
    assert.deepEqual(serializeProject({ id: 1 }).technologies, []);
  });
});

describe("active project count (item 11)", () => {
  test("counting Published DTOs agrees with counting published rows", () => {
    const rows = [
      { id: 1, published: true },
      { id: 2, published: false },
      { id: 3, published: true },
      { id: 4, published: true },
    ];

    const fromDb = rows.filter((row) => row.published === true).length;
    const fromDto = rows
      .map(serializeProject)
      .filter((dto) => dto.status === "Published").length;

    assert.equal(fromDb, 3);
    assert.equal(fromDto, 3);
  });

  test("the old check against raw rows would have counted zero", () => {
    // The dashboard did `project.status === "Published"` against rows that had
    // no `status` column at all, so the count was always 0.
    const rawRows = [
      { id: 1, published: true },
      { id: 2, published: true },
    ] as Array<Record<string, unknown>>;

    assert.equal(rawRows.filter((r) => r.status === "Published").length, 0);
    assert.equal(
      rawRows.map(serializeProject).filter((d) => d.status === "Published")
        .length,
      2
    );
  });
});

describe("project results — TEXT column round trip", () => {
  test("structured results round trip through the TEXT column", () => {
    const results = [
      { metric: "Uptime", value: "99.9%" },
      { metric: "Latency", value: "120ms" },
    ];
    const stored = serializeProjectResults(results);
    assert.equal(typeof stored, "string");
    assert.deepEqual(parseProjectResults(stored), results);
  });

  test("legacy free text is preserved, not discarded", () => {
    const parsed = parseProjectResults("Reduced processing time by 40%");
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].value, "Reduced processing time by 40%");
  });

  test("empty and null are empty arrays", () => {
    assert.deepEqual(parseProjectResults(null), []);
    assert.deepEqual(parseProjectResults(undefined), []);
    assert.deepEqual(parseProjectResults(""), []);
  });
});

describe("serializeService — item 1A/1C", () => {
  test("exposes shortDescription, the canonical contract field", () => {
    const dto = serializeService({
      id: "2",
      title: "Data",
      short_description: "Short",
      full_description: "Long",
      features: ["a"],
    });

    assert.equal(dto.shortDescription, "Short");
    assert.equal(dto.fullDescription, "Long");
    assert.deepEqual(dto.features, ["a"]);
  });

  test("id is a number, matching the admin Service type", () => {
    assert.equal(typeof serializeService({ id: "2" }).id, "number");
    assert.equal(serializeService({ id: "2" }).id, 2);
  });

  test("array columns default to arrays when absent", () => {
    const dto = serializeService({ id: 1 });
    assert.deepEqual(dto.features, []);
    assert.deepEqual(dto.technologyStack, []);
    assert.deepEqual(dto.processSteps, []);
    assert.deepEqual(dto.idealFor, []);
  });
});

describe("serializeTestimonial", () => {
  test("maps to the admin UI vocabulary", () => {
    const dto = serializeTestimonial({
      id: 9,
      client_name: "Jane",
      client_position: "CTO",
      client_company: "Acme",
      testimonial_text: "Great work",
      rating: 5,
      featured: true,
      image_url: null,
    });

    assert.equal(dto.id, "9");
    assert.equal(dto.name, "Jane");
    assert.equal(dto.position, "CTO");
    assert.equal(dto.company, "Acme");
    assert.equal(dto.message, "Great work");
    assert.equal(dto.rating, 5);
    assert.equal(dto.image, null);
  });

  test("no snake_case key leaks into the response", () => {
    const dto = serializeTestimonial({
      id: 1,
      client_name: "x",
    }) as unknown as Record<string, unknown>;
    for (const key of Object.keys(dto)) {
      assert.ok(!key.includes("_"), `${key} leaks database naming`);
    }
  });
});
