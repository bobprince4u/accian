/**
 * Pin the module interpretation of each output directory.
 *
 * The root package.json declares `"type": "module"`. That field does two jobs:
 * it tells Node how to read a bare `.js` file, and -- because tsconfig.esm.json
 * uses `module: NodeNext` -- it tells TypeScript which format to *emit*. Remove
 * it and tsc quietly emits CommonJS into dist/esm, producing a build that
 * succeeds and then fails at import with "does not provide an export named".
 *
 * That same field would make Node read dist/cjs as ESM, so the CommonJS output
 * needs an explicit marker of its own. dist/esm gets the mirror-image marker:
 * it is redundant against the root today, but it keeps each directory correct
 * on its own terms rather than by inheritance from a file two levels up.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const markers = [
  ["dist/cjs", { type: "commonjs" }],
  ["dist/esm", { type: "module" }],
];

for (const [dir, contents] of markers) {
  const target = join(packageRoot, dir);
  await mkdir(target, { recursive: true });
  await writeFile(
    join(target, "package.json"),
    `${JSON.stringify(contents, null, 2)}\n`,
    "utf8"
  );
}
