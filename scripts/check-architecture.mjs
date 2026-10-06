#!/usr/bin/env node
/**
 * Lightweight structural guards for the monorepo.
 *
 * These check the few invariants that consolidation established and that are
 * easy to break by accident. They are deliberately not a test framework and
 * not an architecture-rules engine: five checks, no dependencies, no config.
 *
 * Run with: npm run guards
 */
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS = ["web", "admin", "api"];

const failures = [];
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    failures.push(label);
    if (detail) console.log(`        ${detail.split("\n").join("\n        ")}`);
  }
};

// Walk source files, skipping build output and dependencies.
function* sourceFiles(dir) {
  const SKIP = new Set([
    "node_modules", ".next", "dist", "dist-ssr", "dist-test", "build",
    "coverage", ".git", ".netlify", "out",
  ]);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) yield full;
  }
}

console.log("Architecture guards\n");

// 1. No application imports another application's source. Shared code belongs
//    in packages/. This is the invariant that keeps the three apps separately
//    deployable: a cross-app import would make one app's build depend on
//    another app's files being present.
{
  const offenders = [];
  for (const app of APPS) {
    const appDir = join(ROOT, "apps", app);
    if (!existsSync(appDir)) continue;
    for (const file of sourceFiles(appDir)) {
      const text = readFileSync(file, "utf8");
      // import/export ... from "..."  |  require("...")  |  import("...")
      const specifiers = [
        ...text.matchAll(/(?:from|import|require)\s*\(?\s*["']([^"']+)["']/g),
      ].map((m) => m[1]);
      for (const spec of specifiers) {
        if (!spec.startsWith(".")) continue;
        const resolved = join(dirname(file), spec);
        const rel = relative(ROOT, resolved);
        const match = rel.match(/^apps[/\\]([^/\\]+)/);
        if (match && match[1] !== app) {
          offenders.push(`${relative(ROOT, file)} -> ${spec} (reaches apps/${match[1]})`);
        }
        // Escaping apps/<app>/ entirely is also disallowed, except into packages/.
        if (!rel.startsWith("apps") && !rel.startsWith("packages")) {
          offenders.push(`${relative(ROOT, file)} -> ${spec} (escapes the app)`);
        }
      }
    }
  }
  check(
    offenders.length === 0,
    "no application imports another application's source",
    offenders.slice(0, 10).join("\n"),
  );
}

// 2. Each application keeps its own package.json, so each stays independently
//    installable and deployable.
{
  const missing = APPS.filter((a) => !existsSync(join(ROOT, "apps", a, "package.json")));
  check(missing.length === 0, "every app has its own package.json", `missing: ${missing.join(", ")}`);
}

// 3. The root package is private and declares the workspaces. Private prevents
//    an accidental publish of the whole repository.
{
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const wanted = ["apps/web", "apps/admin", "apps/api", "packages/types"];
  const missing = wanted.filter((w) => !(pkg.workspaces || []).includes(w));
  check(pkg.private === true, "root package.json is private");
  check(missing.length === 0, "root package.json declares every workspace", `missing: ${missing.join(", ")}`);
}

// 4. No nested git repository under apps/. A .git directory there would mean
//    the app's history is not actually part of this repository, and its files
//    would be invisible to the root repo.
{
  const nested = APPS
    .map((a) => join(ROOT, "apps", a, ".git"))
    .filter((p) => existsSync(p))
    .map((p) => relative(ROOT, p));
  check(nested.length === 0, "no nested git repository under apps/", `found: ${nested.join(", ")}`);
}

// 5. The API's migrations directory survived relocation. The API runs
//    migrations on start (`node dist/migrations/cli.js && node dist/server.js`),
//    so a broken path here fails the deployment, not the build.
{
  const dir = join(ROOT, "apps", "api", "src", "migrations");
  const ok = existsSync(dir) && statSync(dir).isDirectory();
  const sql = ok ? readdirSync(dir).filter((f) => f.endsWith(".sql")) : [];
  check(ok, "apps/api/src/migrations exists");
  check(sql.length > 0, "apps/api/src/migrations contains .sql files", `found ${sql.length}`);
}

// 6. Exactly one lockfile, at the root. A stray lockfile inside an app would
//    silently override the workspace resolution for that app.
{
  const strays = [...APPS.map((a) => join(ROOT, "apps", a)), join(ROOT, "packages", "types")]
    .map((d) => join(d, "package-lock.json"))
    .filter(existsSync)
    .map((p) => relative(ROOT, p));
  check(existsSync(join(ROOT, "package-lock.json")), "root lockfile exists");
  check(strays.length === 0, "no lockfiles inside workspaces", `found: ${strays.join(", ")}`);
}

// 7. The web app's security headers are declared twice by necessity, and the
//    two copies must agree. `config/securityHeaders.ts` covers HTML documents,
//    which `@netlify/plugin-nextjs` renders through the Next runtime;
//    `netlify.toml` covers files served straight from the CDN, which never
//    reach Next. Neither layer can cover both.
//
//    The copies drifted once before — different HSTS max-age, a `frame-src` in
//    only one — and because a browser enforces every CSP it receives and takes
//    the intersection, the policy actually in force matched neither file. That
//    is what this guard exists to prevent.
{
  const tsPath = join(ROOT, "apps", "web", "config", "securityHeaders.ts");
  const tomlPath = join(ROOT, "apps", "web", "netlify.toml");

  if (!existsSync(tsPath) || !existsSync(tomlPath)) {
    check(false, "web security headers are declared in both layers",
      `missing: ${[tsPath, tomlPath].filter((p) => !existsSync(p)).map((p) => relative(ROOT, p)).join(", ")}`);
  } else {
    // { key: "Name", value: "..." } — the value may be a bare string or a
    // reference to the CSP constant declared above it in the same file.
    const ts = readFileSync(tsPath, "utf8");
    const csp = ts.match(/CONTENT_SECURITY_POLICY\s*=\s*\n?\s*"([^"]+)"/)?.[1];
    const declared = new Map(
      [...ts.matchAll(/key:\s*"([^"]+)",\s*(?:\/\/[^\n]*\n\s*)*value:\s*(?:"([^"]+)"|CONTENT_SECURITY_POLICY)/g)]
        .map((m) => [m[1], m[2] ?? csp]),
    );

    // Only the `for = "/*"` block; `/internal/*` sets X-Robots-Tag and is not
    // part of the shared set.
    const toml = readFileSync(tomlPath, "utf8");
    const block = toml.split(/^\[\[headers\]\]$/m)
      .find((s) => /^\s*for\s*=\s*"\/\*"/m.test(s)) ?? "";
    const mirrored = new Map(
      [...block.matchAll(/^\s{4}([A-Za-z-]+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]),
    );

    const names = new Set([...declared.keys(), ...mirrored.keys()]);
    const mismatches = [...names].flatMap((name) => {
      const a = declared.get(name);
      const b = mirrored.get(name);
      if (a === b) return [];
      if (a === undefined) return [`${name}: in netlify.toml only`];
      if (b === undefined) return [`${name}: in securityHeaders.ts only`];
      return [`${name}:\n  securityHeaders.ts: ${a}\n  netlify.toml:       ${b}`];
    });

    check(declared.size > 0, "securityHeaders.ts declares headers", "none parsed — has the file's shape changed?");
    check(
      mismatches.length === 0,
      "web security headers agree between securityHeaders.ts and netlify.toml",
      mismatches.join("\n"),
    );
  }
}

console.log();
if (failures.length) {
  console.error(`${failures.length} guard(s) failed.`);
  process.exit(1);
}
console.log("All guards passed.");
