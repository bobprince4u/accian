import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Carried over from this app's Vite era and corrected for Next.js:
 *
 *  - Ignored `dist` only. The Next build writes `.next/`, so `eslint .` walked
 *    into several hundred generated files and effectively hung.
 *  - Extended `reactRefresh.configs.vite`. That is the Vite HMR plugin's
 *    config; there is no Vite React Refresh boundary in a Next app, so the
 *    rule reported against a build step that does not exist here.
 *  - Declared browser globals only, which made `process` an undefined global
 *    in `proxy.ts` — server-side code that legitimately reads `process.env`.
 */
export default defineConfig([
  globalIgnores([
    '.next',
    'out',
    'dist',
    // Compiled output of `npm test`. Linting a build of the sources is
    // duplicate work, and the emitted JavaScript matches no config block here.
    'dist-test',
    'node_modules',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Runs on the server, not in the browser.
    files: ['proxy.ts', '*.config.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Run by `node --test`, so they need Node's globals as well as the
    // browser ones the code under test uses.
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
