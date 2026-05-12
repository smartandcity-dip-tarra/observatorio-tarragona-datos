## Why

The client now maintains Catalan translations for indicator metadata and agenda dictionary in three new sheets of the Google Sheets dataset (`regiones_cat`, `diccionario_cat`, `metadatos_agendas_cat`). The frontend already renders `?lang=ca` views and the database schema already includes empty `METADATA_CAT` and `DICCIONARIO_CAT` tables, so every Catalan request currently falls back to Spanish silently. We need to wire the new translations through parse → transform → load so users actually see Catalan strings for indicator names, descriptions, agenda dimensions, and units.

## What Changes

- Add parsing for `diccionario_cat.csv` and `metadatos_agendas_cat.csv`. The CAT version of `regiones_cat.csv` is intentionally **not** ingested — its only translatable column (`id_especial2`, a closed enum of 7 values) will be handled in a follow-up frontend i18n change.
- Populate `DICCIONARIO_CAT(id_dict, nombre, descripcion)` from `diccionario_cat.csv`.
- Populate `METADATA_CAT(id_indicador, nombre, descripcion, unidad)` from `metadatos_agendas_cat.csv`. The `clase` column from the CAT csv SHALL be ignored — classification keeps using `METADATA.tipo` derived from the Spanish `clase`.
- **Schema additions** (additive, no breaking changes):
  - `METADATA_CAT.unidad TEXT` — nullable Catalan override for unit labels (only ~15 indicators differ from Spanish).
  - `METADATA.direction TEXT` — language-neutral enum (`'asc' | 'desc' | 'neutral' | NULL`) derived from the Spanish `formula` column. Replaces serving raw `formula` strings to clients; the localized label moves to the frontend.
- **Integrity policy**: warn-and-fall-back. The build SHALL NOT fail when a CAT translation is missing or when row counts diverge, but SHALL log a per-indicator summary so drift is visible in CI logs.
  - New integrity check: every CAT `id_indicador` exists in `METADATA`; every CAT `id_dict` exists in `DICCIONARIO`. Unknown ids are dropped with a warning (one log line per id, plus a totals summary).
  - New integrity check: the `clase` column of the CAT csv SHALL NOT introduce `tipo` values absent from the ES csv. Detected mismatches log a warning but do not fail the build (they would only fail if they propagated into `METADATA.tipo`, which they cannot because we ignore CAT `clase`).
  - New integrity check: every Spanish `formula` value SHALL map to a known direction enum. Unmapped values log a warning and store `direction = NULL`.
- Extend the Tarragona/ODS hierarchy APIs so that `?lang=ca` also serves Catalan `unidad` (via `COALESCE(mc.unidad, m.unidad)`). The `direction` enum is exposed on the indicator metadata payload alongside (or instead of) the legacy `formula` field — see design.md for the migration policy.

## Capabilities

### New Capabilities

- `catalan-translations`: cross-cutting policy for how Catalan translations are loaded, validated, and surfaced. Covers the warn-and-fall-back contract, the missing-translation logging format, and the `formula → direction` normalization rules.

### Modified Capabilities

- `csv-parsing`: add parsing for `diccionario_cat.csv` and `metadatos_agendas_cat.csv`.
- `data-transformation`: populate `DICCIONARIO_CAT` and `METADATA_CAT` (including `unidad`); derive `METADATA.direction` from Spanish `formula`; ignore CAT `clase`.
- `schema-creation`: add `METADATA_CAT.unidad` (TEXT, nullable) and `METADATA.direction` (TEXT, nullable).
- `au-hierarchy-api`: when `lang=ca`, return `COALESCE(mc.unidad, m.unidad)`; expose `metadata.direction` on each indicator.
- `ods-hierarchy-api`: same as `au-hierarchy-api` — extend Catalan coverage to `unidad`; expose `metadata.direction`.

## Impact

- **Pipeline (data repo)**: new files under `transform/src/parse/` (one per CAT csv); modifications to `transform/src/transform/index.ts`, `metadata.ts`, `diccionario.ts`; new transform module that derives `direction` from `formula`; new integrity checks under `transform/src/integrity/checks/`; updated loader signature.
- **Schema**: two new nullable columns. The previous CAT tables are empty in production today, so adding `unidad` to `METADATA_CAT` is risk-free. Adding `direction` to `METADATA` is also additive.
- **API (frontend repo)**: changes to `server/api/au/indicadores.get.ts`, `server/api/ods/indicadores.get.ts`, and any other route that selects `m.unidad` or `m.formula` (`indicadores/valores.get.ts`, `au/objetivo-indicadores.get.ts`, `ods/objetivo-indicadores.get.ts`, `municipios/[ine]/header.get.ts`). All changes are additive at the response level (new `direction` field; `unidad` continues to be a string).
- **Frontend rendering of `direction`**: the existing UI consumes `formula` as a display label. To preserve behavior during rollout we keep `formula` in the response (now sourced from `METADATA_CAT.formula`/`METADATA.formula` if added later, OR mapped from `direction` server-side via a small translation table). See design.md decision.
- **Out of scope (follow-up specs)**:
  - Frontend i18n keys for `regiones.id_especial2` (7 closed-enum values) and for the `direction` enum (`asc`/`desc`/`neutral`) — to be covered by a "catalan-frontend-i18n-keys" change.
  - Removing the legacy `formula` column from API responses once all consumers consume `direction`.
