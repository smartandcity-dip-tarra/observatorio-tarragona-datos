## 1. Slug utility and regiones transform

- [x] 1.1 Add a pure `slugifyTypologyLabel` (or agreed name) in `transform/src/` with NFKD + strip diacritics + lowercase + non-alphanumeric to `-`, documented in a one-line JSDoc referencing the spec.
- [x] 1.2 Apply the slug in the regiones transform path so `TransformedData.regiones` (or equivalent) carries slugged `id_especial2`; treat empty input as `NULL`.
- [x] 1.3 Detect slug collisions from distinct source labels and fail the build with a clear message listing `codigo_ine` or labels as appropriate.

## 2. Schema and DDL

- [x] 2.1 Extend `transform/src/schema/tables.ts` with `CREATE_METADATA_EN`, `CREATE_DICCIONARIO_EN`, and `CREATE_PROYECTOS`; append to `ALL_DDL` in dependency-safe order (after parent tables).
- [x] 2.2 Ensure `PRAGMA foreign_keys` and FK definitions match existing patterns for `METADATA_CAT` / `DICCIONARIO_CAT`.

## 3. Parsers

- [x] 3.1 Add `parseDiccionarioEn` mirroring `parseDiccionarioCat` with `[english]` warnings and filename `diccionario_en.csv`.
- [x] 3.2 Add `parseMetadataEn` (or extend metadata parser module) for `metadatos_agendas_en.csv` with the same column tolerance as CAT.
- [x] 3.3 Add `parseProyectos` for `proyectos.csv` with the five string fields; export types from `parse/index.ts`.
- [x] 3.4 Wire new parsers into the main parse entrypoint and log counts similarly to other CSVs.

## 4. Transform and integrity

- [x] 4.1 Implement `transformMetadataEn` / `transformDiccionarioEn` (or extend existing modules) parallel to CAT: sparse `unidad`, drop unknown ids with `[english] WARN`, ignore EN `clase`/`formula` for storage.
- [x] 4.2 Emit the per-build `[english] METADATA_EN: … — DICCIONARIO_EN: …` summary line at end of transform.
- [x] 4.3 Validate EN `clase` vs Spanish semantic tipo where the CAT pipeline already does for Catalan; reuse helpers where possible.
- [x] 4.4 Add integrity: `proyectos.csv` required columns + duplicate `codigo` check; extend `column-contracts` / `config.ts` as needed.
- [x] 4.5 Add optional EN↔ES alignment checks mirroring CAT (warn-only), including dictionary `id_dict` existence.

## 5. Load and pipeline glue

- [x] 5.1 Extend `TransformedData` / `transform/index.ts` with `metadataEn`, `diccionarioEn`, `proyectos` arrays.
- [x] 5.2 Extend `load/loader.ts` with `insertMany` for `METADATA_EN`, `DICCIONARIO_EN`, and `PROYECTOS`.
- [x] 5.3 Update `build-static-viewer` or any direct SQL consumers in this repo if they enumerate tables (include new tables or document exclusion).

## 6. Tests and docs

- [x] 6.1 Add unit tests for `slugifyTypologyLabel` (accented input, punctuation, empty, collision).
- [x] 6.2 Add parser/transform tests or fixture rows for EN and proyectos consistent with existing `integrity/checks` style.
- [x] 6.3 Regenerate or update `docs/csv-integrity` artifacts if this repo’s integrity CLI emits new checks.
- [x] 6.4 Confirm `pullAndBuild/download_and_build.py` `SHEETS` already includes `proyectos`, `diccionario_en`, `metadatos_agendas_en` (adjust only if gaps).

## 7. Downstream note (no code in this repo)

- [x] 7.1 Open a follow-up task or issue in the Nuxt repo: replace raw `REGIONES.id_especial2` display with i18n keyed by slug; add `lang=en` `COALESCE` paths when APIs are added in the separate endpoint spec.
