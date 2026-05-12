## 1. Schema additions

- [x] 1.1 Add `direction TEXT` (nullable) to `CREATE_METADATA` in `transform/src/schema/tables.ts`.
- [x] 1.2 Add `unidad TEXT` (nullable) to `CREATE_METADATA_CAT` in `transform/src/schema/tables.ts`.
- [x] 1.3 Run `pnpm transform` against the existing `dataset/` and verify that the resulting SQLite file contains both new columns (use the static viewer or `sqlite3 .schema METADATA METADATA_CAT`).

## 2. Curated direction mapping

- [x] 2.1 Create `transform/src/transform/direction.ts` exporting:
  - `DIRECTION_MAP_ES: Record<string, 'asc' | 'desc' | 'neutral'>` keyed by the recognized Spanish sentinels.
  - `DIRECTION_MAP_CAT: Record<string, 'asc' | 'desc' | 'neutral'>` keyed by the recognized Catalan sentinels.
  - `mapDirectionEs(formula: string | null): 'asc' | 'desc' | 'neutral' | null` returning the mapped enum or `null` for empty/unknown input.
  - `mapDirectionCat(formula: string | null): 'asc' | 'desc' | 'neutral' | null` for the CAT integrity check.
- [x] 2.2 Seed `DIRECTION_MAP_ES` with at least:
  - `"↑ Ascendente (más = mejor)"` → `"asc"`
  - `"↓ Descendente (menos = mejor)"` → `"desc"`
- [x] 2.3 Seed `DIRECTION_MAP_CAT` with at least:
  - `"↑ Ascendent (més = millor)"` → `"asc"`
  - `"↓ Descendent (menys = millor)"` → `"desc"`
- [x] 2.4 Add a top-of-file comment explaining the mapping is the single source of truth and how to extend it when a new sentinel appears in the spreadsheet.

## 3. CAT csv parsing

- [x] 3.1 Create `transform/src/parse/diccionario-cat.ts` exporting `parseDiccionarioCat(inputDir: string): DiccionarioRecord[]`. Reuse the `DiccionarioRecord` shape; the parser SHALL return an empty array (not throw) when the file is missing and SHALL print `[catalan] WARN: dataset/diccionario_cat.csv not found — Catalan tables left empty` once.
- [x] 3.2 Create `transform/src/parse/metadata-cat.ts` exporting `parseMetadataCat(inputDir: string): MetadataCatRecord[]` with shape `{ indicador, clase, nombre, detalle, unidad, formula }`. Same missing-file behavior as 3.1.
- [x] 3.3 Wire both new parsers into `transform/src/parse/index.ts` (`parseAll`) and add their counts to the existing log lines (e.g. `diccionario_cat.csv: <n> records`).
- [x] 3.4 Re-export `MetadataCatRecord` from `parse/index.ts` so transform code can import it.

## 4. Transform — DICCIONARIO_CAT

- [x] 4.1 Extend `transform/src/transform/diccionario.ts`:
  - Add `transformDiccionarioCat(records: DiccionarioRecord[], esIds: Set<string>): { rows: DiccionarioCatRow[]; warnings: { droppedUnknownIds: string[] } }`.
  - Apply the same `SUPPORTED_AGENDAS` filter as ES.
  - Drop CAT records whose computed `id_dict` is not in `esIds`, accumulating dropped ids for warning emission.
- [x] 4.2 Add `DiccionarioCatRow` interface (same shape as `DiccionarioEsRow`).
- [x] 4.3 In `transform/src/transform/index.ts`:
  - Call `transformDiccionarioCat(data.diccionarioCat, dictIds)` after `transformDiccionario`.
  - Emit `[catalan] WARN: dropping CAT diccionario translation for unknown id_dict <id>` for each id in `droppedUnknownIds`.
  - Add `diccionarioCat` to `TransformedData`.

## 5. Transform — METADATA_CAT and direction

- [x] 5.1 Extend `transform/src/transform/metadata.ts`:
  - Update `MetadataRow` interface to include `direction: 'asc' | 'desc' | 'neutral' | null`.
  - Add `MetadataCatRow` interface `{ id_indicador, nombre, descripcion, unidad }`.
  - Update `transformMetadata` to set `row.direction = mapDirectionEs(r.formula)` and to collect a list of unknown sentinels (with their indicator id) for warning emission by the caller.
  - Add `transformMetadataCat(records: MetadataCatRecord[], esByIndicador: Map<string, MetadataRecord>): { rows: MetadataCatRow[]; warnings: { droppedUnknownIds: string[]; missingTranslations: string[]; unknownCatFormulas: { id: string; text: string }[]; clazeIntroducingUnknownTipo: { id: string; clase: string }[] } }`.
  - The CAT transform SHALL apply the sparse-override rule for `unidad` (NULL when CAT equals ES or CAT is empty).
- [x] 5.2 In `transform/src/transform/index.ts`:
  - Build `esByIndicador` from `data.metadata` and call `transformMetadataCat`.
  - Emit each warning category with the prefix `[catalan]` exactly as specified in `specs/catalan-translations/spec.md`.
  - Add `metadataCat` to `TransformedData`.
- [x] 5.3 Build the per-build summary line and emit it as the last `[catalan]` log line, sourced from the counts collected during 4.x and 5.x.

## 6. Loader updates

- [x] 6.1 In `transform/src/load/loader.ts`:
  - Add `direction` to the `METADATA` insert column list.
  - Add `unidad` to the `METADATA_CAT` insert column list.
  - Add `METADATA_CAT` and `DICCIONARIO_CAT` insert calls (mirroring the existing ES inserts).
  - Update the printed counts to include the new tables.

## 7. Pipeline orchestration

- [x] 7.1 Confirm `pullAndBuild/download_and_build.py` already includes `regiones_cat`, `diccionario_cat`, `metadatos_agendas_cat` in `SHEETS` (it does — no change needed). Add a one-line comment noting that `regiones_cat.csv` is downloaded for future use but not currently ingested.
- [x] 7.2 Add a comment in `transform/src/parse/regiones.ts` (or in a new `regiones-cat.ts.skip` placeholder, your call) explaining the intentional skip and pointing to the future `catalan-frontend-i18n-keys` change.

## 8. Integrity checks

- [x] 8.1 Add a new check under `transform/src/integrity/checks/` that validates:
  - Every CAT `indicador` exists in ES `metadatos_agendas`.
  - Every ES `indicador` has a CAT row (warn-and-fall-back; missing rows are listed).
  - Every CAT `id_dict` exists in ES `diccionario`.
  - Every ES `formula` (non-empty) is in `DIRECTION_MAP_ES`.
  - Every CAT `formula` (non-empty) is in `DIRECTION_MAP_CAT`.
- [x] 8.2 The check SHALL return `status: 'warn'` (or `'pass'`) — never `'fail'` or `'error'` — for any of the conditions above. The transform pipeline must continue.
- [x] 8.3 Wire the new check into `transform/src/integrity/runner.ts`.

## 9. API — AU hierarchy

- [x] 9.1 In `server/api/au/indicadores.get.ts` (frontend repo `diputacion_tarragona`):
  - When `lang === 'ca'`, replace `m.unidad` in the metadata SELECT with `COALESCE(mc.unidad, m.unidad) AS unidad`.
  - Add `m.direction` to the metadata SELECT and to the `MetaFullRow` interface.
  - Add `direction` to the `metadata` object emitted for each indicator.
- [x] 9.2 Update `app/types/ods.ts` (or wherever `OdsIndicador.metadata` is defined) to include `direction: 'asc' | 'desc' | 'neutral' | null`.

## 10. API — ODS hierarchy

- [x] 10.1 In `server/api/ods/indicadores.get.ts` (frontend repo): apply the same SELECT changes as 9.1 (`COALESCE(mc.unidad, m.unidad)` when `lang=ca`; add `m.direction` and surface it as `metadata.direction`).

## 11. API — Other affected endpoints

- [x] 11.1 Audit and update the remaining server routes that read `m.unidad` or `m.formula`: `server/api/indicadores/valores.get.ts`, `server/api/au/objetivo-indicadores.get.ts`, `server/api/ods/objetivo-indicadores.get.ts`, `server/api/municipios/[ine]/header.get.ts`. For each, mirror the SELECT changes from task 9.1 if and only if the route returns `unidad` or `formula` in its response shape. Do not change routes that don't return these fields.
- [x] 11.2 Where `lang` is not currently a parameter on a route that returns `unidad`, add it (default `'es'`) so Catalan callers get Catalan units. If the change scope on a particular route is non-trivial, leave a `TODO(catalan)` comment and capture it as a follow-up task here.

## 12. Verification

- [x] 12.1 Run `pnpm transform` from `transform/` against the current `dataset/`. Verify exit code 0.
- [x] 12.2 Confirm the `[catalan]` summary line appears in the build output and reports `0 dropped` for both tables (with the current dataset).
- [x] 12.3 Open the generated SQLite (`output/diputacion_tarragona.db`) and verify:
  - `SELECT COUNT(*) FROM METADATA_CAT;` returns ≈ 161.
  - `SELECT COUNT(*) FROM DICCIONARIO_CAT;` returns ≈ 246 (or ≈ 234 after AUE filter — match the ES count).
  - `SELECT COUNT(*) FROM METADATA_CAT WHERE unidad IS NOT NULL;` returns roughly 15.
  - `SELECT COUNT(*) FROM METADATA WHERE direction IS NULL;` is small (only indicators with empty/unknown formula).
- [x] 12.4 Hit `GET /api/au/indicadores?codigo_ine=43148&lang=ca` against a local Nuxt dev server and verify `metadata.unidad` is in Catalan for at least one indicator (e.g. id `227`) and `metadata.direction` is populated.
- [x] 12.5 Hit `GET /api/ods/indicadores?codigo_ine=43148&lang=ca` and verify the same fields.
- [x] 12.6 Repeat 12.4–12.5 with `lang=es` and confirm Spanish values are returned (no leakage from CAT overrides).

## 13. Documentation

- [x] 13.1 Update `README.md` in the data repo with a short section on Catalan translations (where they come from, how the warn-and-fall-back works, how to add new direction sentinels).
- [x] 13.2 Add an entry to `docs_internal/` (if that directory exists) describing the `formula → direction` mapping and where it lives.
