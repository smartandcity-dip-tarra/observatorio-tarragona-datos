## 1. Build plumbing (`diputacion_tarragona`)

- [ ] 1.1 Add a Node-only generator module (e.g. `scripts/generate-municipio-csv-exports.ts` or `server/build/generateMunicipioCsvExports.ts`) that opens SQLite read-only, resolves DB path from the same env convention as runtime (`NUXT_SQLITE_PATH` / existing `useDatabase` config—document exact name in `nuxt.config` comments).
- [ ] 1.2 Wire a Nitro or Nuxt hook (`nitro:build:before`, `nitro:close`, or documented equivalent) so `nuxt build` and `nuxt generate` invoke the generator after `public/` exists and before/while the bundle is finalized per `design.md`.
- [ ] 1.3 Ensure output directory `public/export/csv/` is created (or cleaned then repopulated) and add `public/export/csv/.gitkeep` or gitignore rule so only intentional placeholders are tracked if policy is gitignore-all-generated.
- [ ] 1.4 Add env flag(s) for “require exports / skip exports” and fail-fast behavior per spec; default for production CI SHALL require successful generation.

## 2. Export logic (SQL + taxonomy parity)

- [ ] 2.1 Implement enumeration of `codigo_ine` from `REGIONES` (or agreed authoritative set per `design.md`); load `id_especial3` for AMT eligibility.
- [ ] 2.2 Build the ODS 2030 indicator id set using the same dictionary filter (`agenda = '2030'`), `ARQUITECTURA_L2`, and meta linkage as `server/api/ods/indicadores.get.ts` (refactor shared helper or duplicate with explicit comment to keep in sync).
- [ ] 2.3 Build the AMT indicator id set using `agenda = 'TARRAGONA'` / prefix rules as `server/api/au/indicadores.get.ts`, only for rows with `id_especial3 = 'aue'`.
- [ ] 2.4 Query **all** `INDICADORES` rows for `(codigo_ine, id_indicador)` in the union of scoped ids per framework; emit `record_type = indicador` rows with full hierarchy denormalization and paired `*_es` / `*_ca` names from `METADATA_ES` / `METADATA_CAT` and dictionary joins.
- [ ] 2.5 Query **all** relevant rows from `PROMEDIOS_ODS` and, when AUE, `PROMEDIOS_AGENDAS` for objective/meta `id_dict` in scope; emit `promedio_objetivo` / `promedio_meta` rows with consistent `periodo` semantics.
- [ ] 2.6 Write RFC-style CSV (comma, quote on need); set `generated_at` on every row; document optional UTF-8 BOM toggle after Excel smoke test.

## 3. UI and i18n (`diputacion_tarragona`)

- [ ] 3.1 Add i18n keys (ca + es) for the download control label, helper text (what the file contains, no presupuestos), and optional “file not found” guard if build skipped locally.
- [ ] 3.2 On `app/pages/muni/ods/[ine].vue`, add `UButton` or link to `/export/csv/${ine}.csv` (respect `localePath` only if CSV is not locale-sliced—paired columns mean plain path is fine).
- [ ] 3.3 (Optional parity) Add the same control to `app/pages/muni/au/[ine].vue` if product wants symmetry.

## 4. CI, docs, verification

- [ ] 4.1 Update Netlify / GitHub Actions (or project README) so the build job has the SQLite file at the configured path before `nuxt generate`.
- [ ] 4.2 Add a smoke script or `package.json` target to run generator locally against `output/diputacion_tarragona.db` for one INE and inspect row counts.
- [ ] 4.3 Manual check: one AUE and one non-AUE municipio—confirm AMT row presence/absence; spot-check `periodo` cardinality vs raw `INDICADORES` for a single indicator.
