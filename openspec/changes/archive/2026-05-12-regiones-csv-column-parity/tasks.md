## 1. Column contract and integrity check

- [x] 1.1 Add a single source of truth for `regiones.csv` full header parity (canonical column set matching the current CSV), e.g. extend `integrity/config.ts` or a small `integrity/column-contracts.ts` consumed by the runner.
- [x] 1.2 Implement a header parity check: read first line of the file (with BOM strip), split/parse headers consistently with existing CSV parsing, compare set equality against the canonical list; register it in `integrity/runner.ts` (or equivalent) so `npm run check:csv` fails with non-zero exit and lists unexpected/missing columns.
- [x] 1.3 Run `npm run check:csv` from `transform/` against the repo `dataset/` and confirm it passes once implementation matches `regiones.csv`.

## 2. Parse, schema, and load

- [x] 2.1 Update `RegionRecord` and `parseRegiones` in `transform/src/parse/regiones.ts` to map `id_especial2` and `id_especial3` with the same null handling as `id_especial`.
- [x] 2.2 Add `id_especial2 TEXT` and `id_especial3 TEXT` to `CREATE_REGIONES` in `transform/src/schema/tables.ts`.
- [x] 2.3 Extend `insertMany` column list for `REGIONES` in `transform/src/load/loader.ts` to include the two new fields.

## 3. Verification and downstream

- [x] 3.1 Run `npm run transform` and assert `REGIONES` rows contain populated `id_especial2`/`id_especial3` where the CSV has values (manual `sqlite3` query or a short script).
- [x] 3.2 If the Nuxt app exposes `REGIONES` fields via types or SQL, align `app/types` and any server queries with the new columns (only if required for the feature consuming this data).

## 4. Spec baseline (apply / archive)

- [x] 4.1 After implementation, fold delta specs into `openspec/specs/` per project OpenSpec workflow (archive change when done).
