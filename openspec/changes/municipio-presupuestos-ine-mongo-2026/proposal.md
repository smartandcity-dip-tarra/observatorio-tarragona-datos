## Why

The presupuestos tab in `diputacion_tarragona` still depends on legacy presupuestos municipality ids and a previous Mongo row shape, while the 2026 global presupuestos database now identifies Spanish municipalities by INE code and stores presupuestos/liquidaciones in a long-table format. Tarragona already uses INE codes for municipio routes and catalog data, so this change removes old id plumbing and aligns the tab with the new shared data source.

## What Changes

- **BREAKING**: Replace the old presupuestos internal-id lookup with an INE-only lookup against Mongo `codigo_ine`.
- **BREAKING**: Remove `id_presupuestos` from the Nuxt prepare municipio catalog contract and stop merging it from `municipios_tarragona.csv`.
- Query the same 2026 global Mongo data source used by `presupuestos-ods` `db2026`, for both `presupuestos` and `liquidaciones`.
- Add an aggregation pipeline that converts long-table Mongo rows (`anyo`, `grupo_programa`, `cap_eco`, `importe_total`) into the wide budget row shape consumed by the existing charts/tables.
- Update presupuestos data processing so total budget and ODS/meta assignment work with `grupo_programa` rows and mixed CSV typing.
- Keep the UI transparent to available years; if Mongo includes a new year, charts, tables, and CSV export should reflect it without special-case UI logic.

## Capabilities

### New Capabilities

- `municipio-presupuestos-mongo-2026`: Covers the municipio presupuestos tab data contract for the 2026 global Mongo source, INE-based lookup, long-table aggregation, and removal of legacy presupuestos id requirements.

### Modified Capabilities

- None.

## Impact

- Affected Nuxt app areas: `app/pages/muni/ods/[ine].vue`, `app/components/municipio/ods/PresupuestosView.vue`, `app/lib/presupuestos/dataProcessNew.ts`, `app/lib/presupuestos/utils/atlasQueries.ts`, `server.prepare.ts`, and municipio catalog types.
- Affected data/config areas: `app/assets/data/municipios_tarragona.csv` usage, runtime Atlas configuration (`ATLAS_URI`, `DB_NAME`), and static assets used for program-to-ODS/meta assignment.
- External dependency: the global Mongo presupuestos database must expose `presupuestos` and `liquidaciones` collections with the 2026 long-table schema used by `presupuestos-ods` `db2026`.
