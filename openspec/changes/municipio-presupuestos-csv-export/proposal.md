## Why

The presupuestos tab still uses a legacy client-side CSV download (`buildAndDownloadCSV`) that merges ODS goal and meta totals into indistinguishable rows, uses locale-dependent headers and semicolon separators, and only exports aggregates for the currently loaded mode. The municipio ODS page already ships a better pattern: build-time static CSV files with a stable long-form schema, served from `/export/csv/`. Budget data deserves the same treatment as a separate artifact, without mixing presupuestos into the existing indicator export.

## What Changes

- Add a build-time generator that materializes one presupuestos CSV per municipio under `public/export/csv/presupuestos/<codigo_ine>.csv`, sourced from MongoDB with the same processing chain as the interactive presupuestos tab.
- Define a long-form CSV schema with `budget_mode` (`presupuesto` | `liquidacion`) and `record_type` (`programa`, `programa_ods`, `total_ods`, `total_meta`, `resumen_anual`) so analysts can filter aggregation levels without ambiguity.
- Include full year history for both budget modes in a single file per municipio.
- Replace the download icon in `PresupuestosView.vue` with a static link pattern matching the municipio ODS page (`UButton` to prebuilt file).
- Show a context-aware presupuestos export control on the municipio ODS page when the presupuestos tab is active (or alongside the existing indicator export with clear descriptions).
- Remove `buildAndDownloadCSV` usage and related presupuestos CSV i18n column keys from the client download path.

## Capabilities

### New Capabilities

- `municipio-presupuestos-csv-export`: Build-time static presupuestos CSV per `codigo_ine`, long-form schema, Mongo-sourced, static download from municipio UI.

### Modified Capabilities

- `municipio-csv-export`: Clarify in requirements that the indicator CSV remains presupuestos-free and that presupuestos has a sibling export path; update municipio page export UX to surface both downloads without conflating them.

## Impact

- **diputacion_tarragona**: new build module and Nitro/Nuxt hook (`municipio-presupuestos-csv-export-build`), `PresupuestosView.vue` cleanup, `app/pages/muni/ods/[ine].vue` export UI, i18n keys, env vars (`SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT`, Atlas credentials at build time).
- **Reuse**: `getPipelineForCodigoIne`, `csvToJs`, `assignODS`, `assignMetaODS`, `getTotalODS` from existing presupuestos processing; municipio list from SQLite `REGIONES` (same scope as indicator export).
- **CI**: release builds need Mongo access (same as runtime presupuestos tab) plus optional skip flag for local dev without Atlas.
- **Out of scope**: merging presupuestos rows into `public/export/csv/<codigo_ine>.csv`; redesigning presupuestos visualizations.
