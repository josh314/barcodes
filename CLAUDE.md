# @wazue/barcodes

TypeScript barcode/UPC/EAN/EHSKU utility library. CJS-only output (`module: "nodenext"`), built with `tsc`, tested with Jest (`ts-jest`). See `docs/superpowers/specs/2026-09-15-typescript-migration-design.md` for the migration design.

## Known issues (from code review, unaddressed)

These surfaced during a review of the JS→TS migration (commit range `2f1f53e...815725b`). None are fixed yet — flagging here so they aren't lost.

### Silent behavior changes vs. the original JS (high priority)

The migration's spec explicitly says "no behavior change to any exported function." Two functions violate that, undetected by the test suite:

- **`isNumeric` (`src/lib.ts:48`)** was rewritten from a recursive `Math.abs()`-based digit check to a strict `/^[0-9]+$/` regex. This changed `convertUpcE2A`'s behavior for signed/decimal-looking strings: old `convertUpcE2A('-1234567')` computed a real UPC-A value (old `isNumeric` stripped the sign via `Math.abs`); new `convertUpcE2A('-1234567')` returns `''` immediately. Verified by running both implementations side by side.
- **`normalizeUpcA` (`src/lib.ts:211`)** now returns `null` instead of the old `''` when `normalizeUpcE` fails to validate a 7/8-digit input. Old code always called `convertUpcE2A(normalizeUpcE(upc))` unconditionally; `convertUpcE2A(null)` hit its `isNumeric(null) === false` branch and returned `''`. New code short-circuits to `null` before calling `convertUpcE2A` at all. Confirmed: `normalizeUpcA('12345678')` (8 digits, unrecoverable check digit) returns `''` in the old code, `null` in the new. Same divergence through `normalizeBarcodeByType(barcode, 'upca')`.

Neither path has test coverage. Decide deliberately (keep new behavior + document/version it as a behavior change, or restore old behavior) rather than leaving it as an accident of the rewrite — this is exactly the kind of thing that should force a semver-major bump if shipped as-is (see the semver discussion in the migration's design doc history).

### Test coverage gap (medium priority)

The original `test.js` had a "Suite 5 — extra leading zeros" case: `normalizingFn` on an already check-digit-valid barcode that's *longer* than `standardLength` due to extra leading zeros (exercises the leading-zero-trim loop in `normalizingFn`'s first `if` branch, distinct from the "too short, pad" branch). This case has no equivalent in `src/lib.test.ts`. A future change to that trim loop could silently break with all current tests still green.

### Cleanup (low priority)

- **Duplicate digit-validation logic**: `upcPattern` (`/^[0-9]+$/`), `isNumeric` (its own `/^[0-9]+$/`), and `isDigit`/`isNumericString` (array-`includes`-based) all independently answer "is this string all digits." This exact duplication is *why* the `isNumeric` regression above went unnoticed — `upcPattern` and `isNumeric` silently diverged in semantics (leading `-` tolerance) without anyone touching both. Consolidate on one helper.
- **Repeated test assertion patterns** in `src/lib.test.ts`: `expect(normalizingFn(x,12)).toBe(normalizeBarcodeByType(x,'upca'))` appears near-verbatim across 3 `describe` blocks; a "should fail check digit validation" assertion appears across 4. Candidates for `test.each`, though each sits inside a differently-themed scenario block so it's not urgent.

## Planned future removal (not scheduled)

EHSKU and SkuLabs functionality is considered cruft and a candidate for removal in a future release:

- **EHSKU**: `getUpcFromEhsku`, `parseEhsku`, `isEhskuFormat`, `getEhskuFromUpc` (`src/lib.ts`), plus the backing `ehskuPattern` regex and the `upcPattern` regex used only by `getEhskuFromUpc`.
- **SkuLabs**: `parseSkulabsUpcString`, plus the backing `skulabsUpcPattern` regex.

Deferred rather than done now — these are still live exports on the current published API. Before removing: confirm no consumer depends on them (same grep-for-usage diligence done for `lot-commander` during the TS migration — see the design doc), and treat this as a semver-major change like any other public-API removal.

## Already fixed

- `prepublishOnly` lifecycle hook (was misspelled `prePublishOnly` as a top-level key; npm never ran it).
- `.gitlab-ci.yml` publish stage was missing `npm ci` — GitLab CI jobs are isolated per stage, so `dist/` never existed when `npm publish` ran there. This is why the registry ended up with a package containing only `package.json` and `README.md`.
- Dead code: `isEven`/`isOdd` (zero callers), unused `test` import in `src/lib.test.ts`, stale `__tests__/test.ts` path in `tsconfig.json`'s `include`.
