## 1. Build generator foundation

- [x] 1.1 Create `build/municipioPresupuestosCsvExport/generator.ts` with `csvEscape`, column constants, and `runMunicipioPresupuestosCsvExportBuild({ rootDir, utf8Bom })` entry point
- [x] 1.2 Create `modules/municipio-presupuestos-csv-export-build.ts` Nuxt module hooking `nitro:build:before`, honoring `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT=1`
- [x] 1.3 Register the module in `nuxt.config.ts` and document env vars in `nuxt.config.ts` comment block (parallel to indicator CSV export)
- [x] 1.4 Add `scripts/run-municipio-presupuestos-csv-export.ts` and `package.json` script for standalone generation during development

## 2. Data pipeline

- [x] 2.1 Load municipio list from SQLite `REGIONES` (reuse DB path resolution pattern from indicator CSV generator)
- [x] 2.2 Implement Node-safe Mongo fetch using `getPipelineForCodigoIne` for both `presupuesto` and `liquidacion` modes per municipio
- [x] 2.3 Map aggregation documents to `DataRow[]` with the same transform logic as `PresupuestosView.vue`
- [x] 2.4 Extract or add a shared function that, given `DataRow[]` + municipio metadata, returns flat row objects for all five `record_type` values per year/mode
- [x] 2.5 Populate ODS label columns (`nombre_ods_es`, `nombre_ods_ca`) from existing config/i18n sources at build time
- [x] 2.6 Write `public/export/csv/presupuestos/<codigo_ine>.csv` (header-only when no Mongo data)

## 3. UI and cleanup

- [x] 3.1 Add tab-aware presupuestos export `UButton` on `app/pages/muni/ods/[ine].vue` pointing to `/export/csv/presupuestos/<ine>.csv`
- [x] 3.2 Update indicadores-tab export description i18n keys to clarify presupuestos is a separate file; add presupuestos export label/description keys in `es.json`, `ca.json`, `en.json`
- [x] 3.3 Remove `downloadDataForOds`, `buildAndDownloadCSV` import, and download icon from `PresupuestosView.vue`
- [x] 3.4 Remove obsolete presupuestos CSV column i18n keys (`csvYearColumn`, `csvOdsColumn`, etc.) if unused elsewhere
- [x] 3.5 Mirror tab-aware export on `app/pages/muni/au/[ine].vue` if that page also hosts a presupuestos tab (N/A — AU page has no presupuestos tab)

## 4. Verification

- [x] 4.1 Run generator for INE `43148` and verify `total_ods` rows match UI table for 2025 presupuesto
- [x] 4.2 Verify `total_ods` and `total_meta` rows are distinguishable by `record_type` (no mixed fractional codes in `total_ods`)
- [x] 4.3 Verify both `presupuesto` and `liquidacion` rows exist in one file when Mongo has both
- [x] 4.4 Confirm `/export/csv/<ine>.csv` indicator export is unchanged (no presupuestos columns)
- [x] 4.5 Document `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT` and Atlas env requirements for CI/release builds
