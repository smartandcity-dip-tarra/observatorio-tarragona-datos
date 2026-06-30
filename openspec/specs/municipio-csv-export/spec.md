# Municipio CSV export

Capabilities: build-time static CSV per `codigo_ine` (ODS 2030 + AMT when AUE), long-form full history, municipio ODS/AU UI download, CI contract.

## Requirements

### Requirement: Build-time CSV materialization

The Nuxt application build SHALL materialize one CSV file per municipio under `public/export/csv/` using a Node build hook (Nitro or Nuxt lifecycle) such that files are present in the deployed static output after `nuxt build` or `nuxt generate` without requiring runtime SQLite queries for download.

#### Scenario: Successful production build

- **WHEN** the build runs with a valid read-only SQLite database path configured for the generator
- **THEN** the output directory `public/export/csv/` contains a file named `<codigo_ine>.csv` for every municipio in the export set before the site bundle is finalized

#### Scenario: Missing database fails the build

- **WHEN** the build runs in a configuration where municipio CSV export is required and the SQLite file is missing or unreadable
- **THEN** the build SHALL fail with a non-zero exit code and a clear error message (no partial silent skip)

---

### Requirement: Export set and agenda eligibility

The generator SHALL determine the list of `codigo_ine` values from the same authoritative municipio inventory as the shipped dataset (default: all municipios in `REGIONES` eligible for ODS data). For each municipio, the generator SHALL include Agenda Metropolitana (AMT) rows only if `REGIONES.id_especial3 = 'aue'` for that `codigo_ine`, matching the eligibility rule used by `/api/au/indicadores`.

#### Scenario: Non-AUE municipio receives ODS-only file

- **WHEN** a municipio row exists with `id_especial3` not equal to `'aue'`
- **THEN** its CSV contains only `framework = ODS_2030` records (no `AGENDA_AMT` indicator or promedio rows)

#### Scenario: AUE municipio receives ODS and AMT rows

- **WHEN** a municipio row exists with `id_especial3 = 'aue'`
- **THEN** its CSV contains both `ODS_2030` and `AGENDA_AMT` records according to taxonomy scope rules

---

### Requirement: Long-form CSV schema

Each municipio CSV SHALL be UTF-8 comma-separated, long format, with a header row. Every data row MUST include at minimum: `codigo_ine`, `nombre_municipio`, `framework` (`ODS_2030` or `AGENDA_AMT`), `record_type` (`indicador` | `promedio_meta` | `promedio_objetivo`), hierarchy identifiers and labels (`id_objetivo`, `nombre_objetivo_es`, `nombre_objetivo_ca`, `id_meta`, `nombre_meta_es`, `nombre_meta_ca` for `indicador` rows; appropriate `id_dict` fields for promedio rows), `id_indicador` (nullable for promedio rows), indicator names (`nombre_indicador_es`, `nombre_indicador_ca` nullable for promedio), `periodo`, `valor`, `indice`, `categoria`, and metadata columns mirroring the interactive API (`descripcion_es`/`descripcion_ca`, `unidad_es`/`unidad_ca`, `tipo`, `formula`, `direction`, `umbral_optimo`, `umbral_malo`, `fuente`, `actualizacion`) where applicable. The generator SHALL include a `generated_at` column (same ISO timestamp value on all rows of a file) or a single leading metadata convention documented in `design.md`—**default SHALL be a repeated `generated_at` column** for simplicity.

#### Scenario: Full indicator history

- **WHEN** `record_type = indicador`
- **THEN** the row represents one `(id_indicador, periodo)` observation from `INDICADORES` for that `codigo_ine` for every year present in the database for indicators mapped under the relevant framework taxonomy (not latest-only)

#### Scenario: Full promedio history

- **WHEN** `record_type` is `promedio_meta` or `promedio_objetivo`
- **THEN** the row represents one `(id_dict, periodo)` observation from `PROMEDIOS_ODS` or `PROMEDIOS_AGENDAS` respectively for that `codigo_ine` for all stored periods (including NULL period handling consistent with existing API semantics)

---

### Requirement: Exclusions

The municipio CSV export SHALL NOT include presupuestos tables, presupuestos-linked indicators, descriptivos-only series, or any columns sourced solely from external presupuestos pipelines.

#### Scenario: Presupuestos absent

- **WHEN** a user opens any `<codigo_ine>.csv`
- **THEN** no row or column exists whose sole purpose is to represent presupuestos program or budget line data

---

### Requirement: Static download from municipio ODS UI

The municipio ODS page SHALL expose a user-visible control (button or link) that downloads or opens the static CSV for the current `codigo_ine` at `/export/csv/<codigo_ine>.csv`, with label text covered by i18n keys in both supported locales.

#### Scenario: User downloads their municipio export

- **WHEN** a visitor on `/muni/ods/<ine>` activates the export control
- **THEN** the browser receives the prebuilt file for that `<ine>` without invoking a Nitro handler that queries SQLite for CSV generation

---

### Requirement: CI and environment contract

The continuous integration pipeline that produces static deploys SHALL provide the SQLite artifact path expected by the generator (documented variable name in `design.md` / project README). Generated `public/export/csv/**` files MAY be gitignored if the build always regenerates them.

#### Scenario: Reproducible release

- **WHEN** a release build completes successfully
- **THEN** the deployed site includes CSV files consistent with the same database version embedded or co-versioned with that release
