## Context

The transform CLI (`transform/src/index.ts`) parses `dataset/*.csv`, creates SQLite DDL in `schema/tables.ts`, and loads rows via `load/loader.ts`. `regiones.csv` headers now include `id_especial2` and `id_especial3` after `id_especial`, but `parse/regiones.ts` only maps five fields, so extra CSV columns are ignored. There is no failing test when headers outgrow the TypeScript contract. CSV integrity already runs via `npm run check:csv` (`check-csv.ts` + `integrity/runner.ts`) with `REQUIRED_CSV_FILES` in `integrity/config.ts`—that validates required columns only, not “no unexpected columns” or parity with the parse/schema/load path.

## Goals / Non-Goals

**Goals:**

- Persist `id_especial2` and `id_especial3` end-to-end: `RegionRecord`, `CREATE REGIONES`, `insertMany` column list, same nullability rules as `id_especial` (`toNullable` / `TEXT`).
- Add a **header vs contract** check for at least `regiones.csv`: if the file’s header row contains any column name not listed in the canonical expected set for that file, the check fails with an explicit list. Implement in a way that other CSVs can register the same pattern later (single map or config array keyed by filename).
- Keep the change localized to the data repo transform; document that regenerating the app’s bundled DB may be a separate step.

**Non-Goals:**

- Changing Nuxt API response shapes or UI (unless a follow-up needs the new fields).
- Auto-migrating SQLite in production without rebuild (pipeline already recreates DB each run).
- Full “schema drift” across all CSVs in one pass—only require `regiones.csv` plus a clear extension point.

## Decisions

1. **Where the parity check lives** — Extend the existing integrity runner used by `check-csv.ts` (non-zero exit on failure) rather than only asserting inside unit tests. Rationale: CI already has a path to run `check:csv`; developers see the same failure locally. Alternative: run parity only inside `index.ts` before parse—rejected because it couples “build db” with “validate headers” and may surprise users who only want a quick build; optional future flag could run both.

2. **Contract source of truth** — One exported list (or per-file config) of **expected column names** used by both the parity check and, where practical, referenced from comments or shared constant near `parseRegiones` to avoid three divergent lists. Rationale: single place reduces repeat of the original bug. If full single-source is awkward (parse uses explicit object keys), minimum is: parity config + parser + DDL + loader updated together; tasks should call out “touch all four”.

3. **Comparison semantics** — Normalize headers (trim, strip BOM) and compare sets: **every header cell must appear in the expected set** (no surprise columns). Optionally also fail if expected columns are missing from the file (stricter parity); recommend **both** directions for `regiones.csv` so renames are caught. Rationale: symmetric parity catches dropped columns and typos in headers.

4. **Column types** — `id_especial2` and `id_especial3` as nullable `TEXT` in SQLite, matching categorical string content in the CSV.

## Risks / Trade-offs

- **[Risk] Parity too strict for loosely governed CSVs** → Mitigation: register only `regiones.csv` initially; other files opt in when their contracts are stable.
- **[Risk] Duplicated column lists** → Mitigation: central `expectedColumnsByFile['regiones.csv']` (or extend `CsvFileConfig` with `expectedColumns`) and import from one module used by integrity checks; parser/schema/loader still need manual alignment—document in tasks.
- **[Trade-off] Integrity does not prove values** → Parity only guards headers; value correctness remains covered by existing data checks.

## Migration Plan

1. Land transform changes and new integrity check; run `npm run check:csv` and `npm run transform` in `transform/`.
2. Commit updated SQLite in the Nuxt app repo if that artifact is versioned and should ship the new columns.
3. Rollback: revert commit; DB rebuild from previous transform.

## Open Questions

- Whether to add `regiones.csv` **full** expected column list to `REQUIRED_CSV_FILES` as `requiredColumns` vs a separate `allColumns` field—design prefers an explicit `expectedHeaders` (ordered or unordered set) for parity distinct from “minimum required” subset.
