## Why

`regiones.csv` gained `id_especial2` and `id_especial3`, but the transform pipeline still parses and loads only the older column set. Those values are dropped silently, so the SQLite `REGIONES` table and downstream consumers miss data. We also lack an automated signal when CSV headers drift ahead of TypeScript types, schema, and loaders.

## What Changes

- Add `id_especial2` and `id_especial3` to the `regiones` parse type, SQLite `REGIONES` DDL, and loader column list (nullable `TEXT`, same treatment as `id_especial`).
- Introduce an automated check (run in CI / `npm run check:csv` or the transform pipeline) that fails when a configured CSV’s header row contains columns not covered by the declared “expected columns” contract for that file—starting with `regiones.csv`, extensible to other dataset files later.
- Update OpenSpec requirements for CSV parsing, schema, and loading so they match the new columns and the parity rule.

## Capabilities

### New Capabilities

- `dataset-csv-column-parity`: Declared expected column sets per tracked CSV; compare against on-disk header row; fail with a clear list of unexpected (and optionally missing) columns; integrate with existing CSV integrity CLI where practical.

### Modified Capabilities

- `csv-parsing`: `regiones.csv` parsed records SHALL include `id_especial2` and `id_especial3` (nullable text).
- `schema-creation`: `REGIONES` table SHALL include `id_especial2` and `id_especial3` columns.
- `data-transformation`: Loading `regiones` into `REGIONES` SHALL persist all contracted columns including the new ones.

## Impact

- **Code**: `transform/src/parse/regiones.ts`, `transform/src/schema/tables.ts`, `transform/src/load/loader.ts`, integrity/config or new parity module, `transform/src/integrity/*` and/or `check-csv.ts` wiring, tests.
- **Database**: New columns on `REGIONES`; regenerated `diputacion_tarragona.db` in the app repo when the dataset pipeline is run.
- **Downstream**: Nuxt app types/APIs that expose `REGIONES` may need alignment if they surface municipality metadata (optional follow-up outside this change if not required for SQLite-only fix).
