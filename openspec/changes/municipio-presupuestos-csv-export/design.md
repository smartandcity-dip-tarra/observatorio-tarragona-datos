## Context

The municipio ODS page (`/muni/ods/<ine>`) already ships indicator data via a build-time static CSV at `public/export/csv/<codigo_ine>.csv`, generated from SQLite during `nuxt build`. The presupuestos tab loads budget data from MongoDB at runtime, processes it through `getPipelineForCodigoIne` → `csvToJs` → `assignODS` / `assignMetaODS` → `getTotalODS`, and exposes a legacy client-side download via `buildAndDownloadCSV` that concatenates ODS goal and meta totals without discrimination, uses semicolon separators and locale-dependent headers.

After `municipio-presupuestos-ine-mongo-2026`, presupuestos uses `codigo_ine` end-to-end. The processing chain is stable and documented in `diputacion_tarragona/docs/presupuestos-ods-flujo-y-ejemplo-ine-43148.md`. This change adds a sibling static export that reuses that chain at build time.

## Goals / Non-Goals

**Goals:**

- Materialize `public/export/csv/presupuestos/<codigo_ine>.csv` during `nuxt build` / `nuxt generate`.
- Long-form schema with `budget_mode` and `record_type` discriminants, stable snake_case column names, bilingual label columns, full year history, both `presupuesto` and `liquidacion` in one file.
- Reuse existing presupuestos processing modules so export matches the interactive UI.
- Replace client-side blob download with static `UButton` link on the municipio page (tab-aware).
- Municipio export set aligned with indicator CSV (`REGIONES` in SQLite).

**Non-Goals:**

- Merging presupuestos rows into `public/export/csv/<codigo_ine>.csv`.
- Runtime Nitro CSV generation on download.
- Redesigning presupuestos charts or tables.
- Catalan program names beyond what mapping assets provide (Spanish names from `program_to_ods.csv` are sufficient for v1).
- Exporting all Spanish municipios in Mongo if absent from Tarragona `REGIONES`.

## Decisions

### 1. Separate subdirectory, not filename suffix

**Chosen:** `public/export/csv/presupuestos/<codigo_ine>.csv`

**Rationale:** Keeps indicator files at the flat `export/csv/` path unchanged; clear URL semantics.

**Alternative:** `<codigo_ine>-presupuestos.csv` in the same folder — rejected to avoid cluttering the indicator directory.

### 2. One file, both budget modes

**Chosen:** Single file per municipio with `budget_mode` column (`presupuesto` | `liquidacion`).

**Rationale:** Mirrors `framework` in the indicator CSV (ODS + AMT in one file). Users filter in spreadsheet rather than managing two downloads.

**Alternative:** Two files per municipio — rejected as worse UX.

### 3. Record types and aggregation layers

**Chosen:** Five `record_type` values:

| `record_type` | Purpose |
|---------------|---------|
| `programa` | Pivoted program row with chapter columns (all program levels) |
| `programa_ods` | Level-3 program × ODS assignment (audit trail) |
| `total_ods` | Year rollup by SDG goal (matches UI table) |
| `total_meta` | Year rollup by SDG meta (matches expanded rows) |
| `resumen_anual` | Year headline metrics (`total`, `asignado`, `sin_asignar`) |

**Rationale:** Fixes the current bug where goal and meta totals are indistinguishable. Analysts can filter by `record_type` without parsing fractional ODS codes mixed with integers.

### 4. `resumen_anual` as three rows per year/mode

**Chosen:** Three rows with a `metric` column (`total` | `asignado` | `sin_asignar`) rather than wide columns.

**Rationale:** Consistent long format; easy to pivot.

### 5. Build hook sourcing Mongo, municipio list from SQLite

**Chosen:** New module `build/municipioPresupuestosCsvExport/generator.ts` invoked from `modules/municipio-presupuestos-csv-export-build.ts` on `nitro:build:before`. Municipio list from `REGIONES` (same as indicator export). For each municipio, query Mongo `presupuestos` and `liquidaciones` collections via the same aggregation as `getPipelineForCodigoIne`, then run shared processing.

**Rationale:** Export set matches site scope; processing matches UI.

**Alternative:** Generate from Mongo inventario for all Spain — rejected; site only serves Tarragona provincia municipios.

### 6. Shared processing extraction

**Chosen:** Extract or import a Node-safe processing entry point that accepts `DataRow[]` and returns row objects for each `record_type`. Prefer reusing `csvToJs`, `assignODS`, `assignMetaODS`, `getTotalODS` from `app/lib/presupuestos/` rather than duplicating logic.

**Rationale:** Single source of truth; parity with UI.

### 7. CSV dialect

**Chosen:** UTF-8, comma separator, RFC 4180 quoting (same `csvEscape` pattern as indicator export). Optional BOM via `MUNICIPIO_PRESUPUESTOS_CSV_EXPORT_UTF8_BOM=1`. `porcentaje_presupuesto` as decimal 0–1 (not formatted percent string). `importe_euros` as raw numbers without locale formatting.

### 8. Failure and skip modes

**Chosen:**

- `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT=1` — skip generation with console warning (local dev without Atlas).
- Production/release builds without skip and missing `ATLAS_URI` / unreachable Mongo — fail build with clear error.
- Municipio with no Mongo data — write file with header only or omit file; **default: write header-only file** so download URL never 404s for valid municipios.

### 9. UI placement

**Chosen:** On `/muni/ods/<ine>`, show presupuestos export `UButton` when presupuestos tab is active; keep indicator export when indicadores tab is active. Remove download icon from `PresupuestosView.vue`. Delete `buildAndDownloadCSV` usage from presupuestos path (file may remain if unused elsewhere).

**Alternative:** Always show both buttons — acceptable follow-up; v1 uses tab-aware single button to avoid clutter.

### 10. ODS label columns

**Chosen:** `nombre_ods_es` / `nombre_ods_ca` from existing i18n keys or `ods-list` config at build time (Spanish/Catalan names for goals; meta names from `program_to_meta` mapping where applicable).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Build time grows (Mongo × municipios × 2 modes) | Batch by municipio; reuse single Mongo connection; measure on CI |
| Build requires Atlas credentials not available locally | `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT=1` documented |
| Processing drift between UI and export | Shared modules; optional parity test on sample INE 43148 |
| Large CSV files for municipios with many programs/years | Accept for v1; monitor size; compression is a later change |
| Program names only in Spanish in mapping CSV | Document in spec; `nombre_programa_ca` nullable |
| Level-2 programs (e.g. code `11`) excluded from `programa_ods` | Documented; included in `programa` rows |

## Migration Plan

1. Land build generator behind skip env flag.
2. Wire CI with Atlas credentials (same as runtime presupuestos).
3. Swap UI: static link on municipio page, remove client download from `PresupuestosView.vue`.
4. Remove obsolete i18n keys (`csvYearColumn`, etc.) used only by client download.
5. Rollback: remove hook and UI link; restore client download if needed (git revert).

## Open Questions

- Whether to always show both export buttons regardless of active tab (product preference).
- Whether header-only files or skip-with-404 is better for municipios without Mongo budget data (default: header-only).
