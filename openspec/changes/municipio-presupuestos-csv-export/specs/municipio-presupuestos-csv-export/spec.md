# Municipio presupuestos CSV export

Capabilities: build-time static presupuestos CSV per `codigo_ine`, long-form schema with `budget_mode` and `record_type`, Mongo-sourced, static download from municipio UI.

## ADDED Requirements

### Requirement: Build-time presupuestos CSV materialization

The Nuxt application build SHALL materialize one presupuestos CSV file per municipio under `public/export/csv/presupuestos/` using a Node build hook such that files are present in the deployed static output after `nuxt build` or `nuxt generate` without requiring runtime Mongo queries for download.

#### Scenario: Successful production build

- **WHEN** the build runs with valid MongoDB connection configuration and a valid SQLite path for the municipio export set
- **THEN** the output directory `public/export/csv/presupuestos/` contains a file named `<codigo_ine>.csv` for every municipio in the export set before the site bundle is finalized

#### Scenario: Missing Mongo fails required builds

- **WHEN** the build runs in a configuration where presupuestos CSV export is required (skip flag not set) and MongoDB is unreachable or credentials are missing
- **THEN** the build SHALL fail with a non-zero exit code and a clear error message

#### Scenario: Local skip

- **WHEN** `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT=1` is set
- **THEN** the build SHALL complete without generating presupuestos CSV files and SHALL log a warning

---

### Requirement: Export set

The generator SHALL determine the list of `codigo_ine` values from the same authoritative municipio inventory as the indicator CSV export (default: all municipios in SQLite `REGIONES` ordered by `codigo_ine`).

#### Scenario: Municipio in REGIONES receives a file

- **WHEN** a municipio row exists in `REGIONES` with a non-null `codigo_ine`
- **THEN** the build emits `public/export/csv/presupuestos/<codigo_ine>.csv`

---

### Requirement: Data source and processing parity

Presupuestos CSV rows SHALL be derived from the same MongoDB collections and aggregation shape used by the interactive presupuestos tab (`presupuestos` and `liquidaciones` collections via `getPipelineForCodigoIne`), then processed with `csvToJs`, `assignODS`, `assignMetaODS`, and `getTotalODS` so exported amounts match the on-screen tab for the same municipio, year, and budget mode.

#### Scenario: ODS totals match UI

- **WHEN** a municipio has budget data for year Y and `budget_mode = presupuesto`
- **THEN** rows with `record_type = total_ods` and `periodo = Y` contain the same `importe_euros` and `porcentaje_presupuesto` values as the presupuestos tab ODS distribution table for that year

---

### Requirement: Long-form presupuestos CSV schema

Each presupuestos CSV SHALL be UTF-8 comma-separated with a header row and RFC-style field quoting. Every data row MUST include at minimum: `codigo_ine`, `nombre_municipio`, `budget_mode` (`presupuesto` | `liquidacion`), `record_type`, `periodo`, and `generated_at` (same ISO timestamp on all rows of a file). Additional columns SHALL be present on the header row; nullable per `record_type` as documented in `design.md`, including at minimum:

- Program fields (`codigo_programa`, `nombre_programa_es`, `nombre_programa_ca`, `nivel_programa`, chapter amount columns `cap_gastos_personal_1` through `cap_pasivos_financieros_9`, `importe_total_programa`, `importe_no_financiero`, `importe_financiero`) for `record_type = programa`
- ODS assignment fields (`id_ods`, `nombre_ods_es`, `nombre_ods_ca`, `tipo_asignacion`, `importe_euros`, `porcentaje_presupuesto`, `fuente_asignacion`) for `record_type` in (`programa_ods`, `total_ods`, `total_meta`)
- Summary fields (`metric`, `importe_euros`, `presupuesto_total_anual`) for `record_type = resumen_anual`

#### Scenario: Both budget modes in one file

- **WHEN** a municipio has data in both Mongo collections for the same year
- **THEN** the CSV contains rows for `budget_mode = presupuesto` and `budget_mode = liquidacion` distinguishable by the `budget_mode` column

#### Scenario: Record types are distinguishable

- **WHEN** a user filters the CSV by `record_type = total_ods`
- **THEN** no row in the result set uses fractional `id_ods` meta codes (e.g. `11.1`)

#### Scenario: Meta totals are separate

- **WHEN** a user filters the CSV by `record_type = total_meta`
- **THEN** rows represent SDG meta-level rollups matching the expandable rows in the presupuestos ODS table

#### Scenario: Program audit trail

- **WHEN** `record_type = programa_ods`
- **THEN** each row represents one ODS assignment for a level-3 program, with `tipo_asignacion` in (`primario`, `secundario`, `financiero`, `sin_asignar`)

#### Scenario: Annual summary

- **WHEN** `record_type = resumen_anual`
- **THEN** exactly three rows exist per (`budget_mode`, `periodo`) combination with `metric` in (`total`, `asignado`, `sin_asignar`)

#### Scenario: Numeric formats

- **WHEN** any row includes `importe_euros` or `porcentaje_presupuesto`
- **THEN** values are unformatted numbers (euros as decimal; percentage as ratio 0–1, not a localized percent string)

---

### Requirement: Full year history

The generator SHALL include all years present in Mongo for each municipio and budget mode, not only the latest year or the year selected in the UI.

#### Scenario: Multi-year export

- **WHEN** Mongo contains presupuestos data for years 2020 through 2025 for a municipio
- **THEN** the CSV contains `total_ods` rows for each of those years under `budget_mode = presupuesto`

---

### Requirement: Municipio without budget data

When a municipio is in the export set but Mongo returns no rows for a budget mode, the generator SHALL still write `public/export/csv/presupuestos/<codigo_ine>.csv` containing at least the header row.

#### Scenario: Empty municipio file

- **WHEN** a municipio has no presupuestos or liquidaciones data in Mongo
- **THEN** the file exists with header only and zero data rows

---

### Requirement: Static download from municipio presupuestos UI

The municipio ODS page SHALL expose a user-visible control that downloads or opens the static presupuestos CSV for the current `codigo_ine` at `/export/csv/presupuestos/<codigo_ine>.csv`, with label and description text covered by i18n keys in all supported locales.

#### Scenario: User downloads presupuestos export

- **WHEN** a visitor on `/muni/ods/<ine>` with the presupuestos tab active activates the presupuestos export control
- **THEN** the browser receives the prebuilt file for that `<ine>` without client-side CSV generation

---

### Requirement: Remove legacy client-side presupuestos download

The presupuestos tab component SHALL NOT invoke `buildAndDownloadCSV` or equivalent client-side blob generation for budget export.

#### Scenario: No in-tab download icon

- **WHEN** a user views the presupuestos ODS distribution table
- **THEN** no client-side CSV download button is rendered in `PresupuestosView.vue`

---

### Requirement: CI and environment contract

Release builds that ship presupuestos CSV exports SHALL provide MongoDB connection configuration (`ATLAS_URI`, `DB_NAME`, or documented equivalents aligned with the presupuestos tab runtime config) and MAY use `SKIP_MUNICIPIO_PRESUPUESTOS_CSV_EXPORT=1` only in documented local-dev scenarios.

#### Scenario: Reproducible release

- **WHEN** a release build completes successfully without the skip flag
- **THEN** deployed presupuestos CSV files are consistent with the same Mongo dataset version used by the presupuestos tab in that release
