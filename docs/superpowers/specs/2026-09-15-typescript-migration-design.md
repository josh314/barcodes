# TypeScript Migration — Design

## Goal

Migrate `@wazue/barcodes` from plain JS to TypeScript while continuing to be requireable in Node via `require()`. No published-API changes. (Compiled output is CJS to satisfy this — see Build Configuration for why `module: "nodenext"` rather than `"commonjs"` is used to get there.)

## Scope

In scope:
- Convert `lib.js` → `src/lib.ts` with explicit types.
- Convert `test.js` → `src/lib.test.ts`, rewritten as a Jest suite (via `ts-jest`) instead of console.log success/fail messages.
- Add TypeScript build tooling (`tsconfig.json`, `typescript` + `@types/node` devDependencies).
- Add Jest test tooling (`jest.config.js`, `jest` + `ts-jest` + `@types/jest` devDependencies).
- Update `package.json` (`main`, `types`, `exports`, `files`, `scripts`).
- Update `.gitlab-ci.yml` to build before publish.
- Delete `barcodes.bak.js` (confirmed dead legacy browser code, not part of the node module — diff shows it's the original pre-module source `lib.js` was adapted from).
- Add `README.md` documenting both supported import paths.

Out of scope (explicitly deferred):
- ESM build / dual CJS+ESM package. May be added later as an additive change once CJS migration is stable.
- Any change to the public function signatures or behavior of the barcode utilities.

## Source Layout

```
src/
  lib.ts        # barcode utility functions, typed
  lib.test.ts   # Jest suite
dist/           # compiled output (gitignored, published; excludes lib.test.ts — see package.json changes)
```

Test file uses the `.test.ts` naming convention (Jest's default `testMatch`) rather than a standalone `test.ts`, so no explicit `testMatch` config is needed and additional test files can be added later following the same pattern.

## Types

Add explicit types for the existing functions, inferring the narrowest correct signature from current behavior, e.g.:

- `getUpcFromEhsku(ehsku: string): string | undefined`
- `parseEhsku(ehsku: string): [string, string] | undefined`
- `isEhskuFormat(s: string): boolean`
- `getEhskuFromUpc(upc: string, kitQuantity?: number): string | null`
- `parseSkulabsUpcString(upcString: string): string[]`
- `isUpcE(upc: string): boolean`
- `convertUpcE2A(UPCE: string): string`
- `calculateCheckDigit(upc: string): number`
- `validateCheckDigit(barcode: string): boolean`
- `addCheckDigit(barcode: string): string`
- `normalizeUpc(upc: string, opts?: { checkDigit?: boolean; trim?: number }): string`
- `normalizeUpcA(upc: string): string | null`
- `normalizeUpcE(upc: string): string | null`
- `normalizeEan13(ean: string): string | null`
- `normalizingFn(barcode: string, standardLength: number): string | null`
- `normalizeBarcodeByType(barcode: string, type: string): string | null`

Internal helpers (`isNumeric`, `isEven`, `isOdd`, `mod`, `charFromCharCode`, `isDigit`, `isNumericString`) stay module-private (not exported), typed as needed to satisfy `strict` mode. The existing `isNumeric` function has messy implicit-global variable usage (`number`, `j` without `var`/`let` in some branches) — clean this up minimally as required to type-check, without changing its behavior.

## Build Configuration

`tsconfig.json`:
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

`exclude` keeps `lib.test.ts` out of the published `dist/` build (`tsc` only compiles `lib.ts`) while `ts-jest` still type-checks and runs the test file directly from `src/` via its own transform, independent of this build's `include`/`exclude`.

`module: "nodenext"` (implies `moduleResolution: "nodenext"`) rather than the classic `"commonjs"` setting — it type-checks and emits against Node's *actual* module resolution rules (keyed off `package.json`'s `"type"` field) instead of TS's invented CJS emulation. Since `package.json` has no `"type": "module"`, files are resolved and compiled as CJS — same emitted output as plain `"commonjs"` would produce for this package, but validated against real Node semantics, and it's the config TS itself recommends for packages that run under Node. It also leaves the door open for adding `.mts`/`"type": "module"` ESM support later without reworking the module setting. No `exports` map changes needed beyond the backward-compat map described below; the compiled `lib.ts` exports still land on `module.exports` as a plain object of named functions, so no dual-package hazard.

`isolatedModules: true` is required by `ts-jest` specifically because of `nodenext`: it's a "hybrid" module kind (ESM vs. CJS output is decided per-file, from extension + `package.json`'s `"type"`), which needs each file to be transpilable independently — `ts-jest`'s default whole-program compile path doesn't reliably support that, and its docs call out node16/node18/nodenext as requiring `isolatedModules`. The restriction (no `const enum`, no ambient namespace merging, type-only re-exports must use `export type`) doesn't affect anything in this codebase — it's a required formality for this specific module-kind/test-runner combination, not a project design choice.

Add `"type": "commonjs"` explicitly to `package.json` to make the CJS intent self-documenting rather than relying on the field's absence.

## package.json changes

**Backward-compat requirement:** the real-world consumer `lot-commander` imports this package two ways — `require('@wazue/barcodes')` (bare) and `require('@wazue/barcodes/lib')` (subpath, in `server/modules/product-data.js`). Today both resolve because `lib.js` sits at the package root. Once compiled output moves to `dist/lib.js`, the bare import still resolves via `main`, but the `/lib` subpath has nothing to resolve to unless explicitly preserved — this would be a silent breaking change unrelated to the TS rewrite itself. Fixed via an explicit `exports` map that preserves both paths:

```jsonc
{
  "main": "./dist/lib.js",
  "types": "./dist/lib.d.ts",
  "exports": {
    ".": {
      "types": "./dist/lib.d.ts",
      "import": "./dist/lib.js",
      "require": "./dist/lib.js"
    },
    "./lib": {
      "types": "./dist/lib.d.ts",
      "import": "./dist/lib.js",
      "require": "./dist/lib.js"
    }
  }
}
```

Notes:
- Subpath keys in `exports` must start with `./` — `"lib"` alone is invalid and would silently fail to resolve (`ERR_PACKAGE_PATH_NOT_EXPORTED`); it must be `"./lib"`.
- `"types"` is repeated per-condition (not just top-level) so a future TS consumer resolving via `nodenext`/`node16` finds it directly through `exports`, since `nodenext` resolution looks for a `types` condition inside `exports` rather than reliably falling back to the top-level field.
- Top-level `"main"`/`"types"` are kept alongside `exports` as a fallback for tooling that doesn't understand `exports` — harmless redundancy, `exports` takes priority in Node when present.
- Once `exports` is defined, the package becomes encapsulated: any subpath not explicitly listed (e.g. reaching into `package.json` or any other file) stops resolving. Confirmed via grep that `lot-commander` only ever imports `.` and `./lib`, so nothing else needs to be listed.

- `"files": ["dist"]`
- `"type": "commonjs"` (explicit, matches current behavior — see Build Configuration)
- `"scripts"`:
  - `"build": "tsc"`
  - `"test": "jest"` (runs against `src/lib.test.ts` directly via `ts-jest`; does not require `npm run build` first)
  - `"prepublishOnly": "npm run build"`
  - `"start": "node demo.js"` (unchanged; note: `demo.js` referenced by this script does not currently exist in the repo — pre-existing issue, not addressed by this migration)
- `devDependencies`: `typescript` (pinned `^6.0.3`, **not** `latest`/`^7` — see Known Tooling Constraints below), `@types/node`, `jest`, `ts-jest`, `@types/jest` (versions compatible with Node 24, matching the `node:24` CI image)
- Jest config: `jest.config.js` with `preset: 'ts-jest'`, `testEnvironment: 'node'`. (Could alternatively live under a `"jest"` key in `package.json` — a separate file is used here for clarity since this is a small, mostly-config-driven migration where explicitness is cheap.)

## CI changes

`.gitlab-ci.yml` `test` stage: unchanged (`npm ci && npm test`) — `npm test` now runs `jest`, which type-checks and executes `src/lib.test.ts` directly via `ts-jest` without a separate `tsc` build step. `publish` stage: no explicit build step needed in the CI script either — the `prepublishOnly` script in `package.json` runs `npm run build` automatically before `npm publish` packs the tarball, so `dist/` is guaranteed to exist regardless of whether publish happens from CI or a local machine.

## Known Tooling Constraints

**Pin `typescript` to `^6.0.3` (6.x), do not install `latest`.** As of this writing, `typescript@latest` on npm is `7.0.2` — TypeScript 7 is the native (Go-based) compiler rewrite, already the default `latest` tag. `ts-jest`'s current `peerDependencies` declare `"typescript": ">=4.3 <7"` — it does not yet support TS7. Installing `typescript` without an explicit range would pull TS7 and break `ts-jest` (peer dependency warning at minimum, likely outright incompatibility). This is a temporary, tooling-ecosystem-wide state, not a decision specific to this package — revisit the pin once `ts-jest` publishes TS7 support.

## Testing

Each of the 6 existing test "suites" in `test.js` becomes a `describe(...)` block in `src/lib.test.ts`, with each individual check becoming an `it(...)`/`expect(...)` assertion (Jest's standard globals — no explicit `import` needed with the default `ts-jest` + `@types/jest` setup). Assertions replace the current manual `if/else` console.log pattern 1:1 — same inputs, same expected relationships between function outputs — but with real pass/fail semantics (non-zero exit code on failure, per-assertion reporting) instead of requiring a human to read console output.

This is more test infrastructure than the package strictly needs, but the point of this migration is partly an exercise in doing the TS/tooling migration properly, so the added ceremony (Jest + ts-jest + ts type-checked tests, vs. the lighter `node:test` option) is accepted deliberately here rather than by default.

## Documentation

Add `README.md` at repo root (none currently exists) documenting both supported import paths — `require('@wazue/barcodes')` and `require('@wazue/barcodes/lib')` — so the `exports` map's backward-compat guarantee is discoverable rather than implicit.

## Files Removed

- `barcodes.bak.js` — legacy pre-module browser code, unrelated to `src/lib.ts`.

## Non-Goals / Risks

- No behavior change to any exported function.
- No ESM output in this pass.
- `strict: true` may surface latent bugs in edge-case handling (e.g. `isNumeric`'s odd global-variable usage, or functions that fall through without a return, like `getUpcFromEhsku` returning `undefined` implicitly). These will be typed honestly (`| undefined`) rather than papered over, and any behavior-affecting fix will be called out explicitly rather than silently changed.
