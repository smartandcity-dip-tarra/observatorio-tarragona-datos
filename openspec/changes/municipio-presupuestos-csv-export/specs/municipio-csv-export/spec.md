# Municipio CSV export (delta)

Delta for sibling presupuestos export and municipio page export UX.

## ADDED Requirements

### Requirement: Sibling presupuestos export path

The indicator municipio CSV at `public/export/csv/<codigo_ine>.csv` SHALL remain limited to ODS 2030 and AMT agenda indicator data. Presupuestos budget data SHALL be exported only via the separate path `public/export/csv/presupuestos/<codigo_ine>.csv` defined by the `municipio-presupuestos-csv-export` capability.

#### Scenario: Indicator file unchanged

- **WHEN** a user downloads `/export/csv/<codigo_ine>.csv`
- **THEN** the file contains no `budget_mode` or presupuestos `record_type` rows

#### Scenario: Presupuestos file is separate

- **WHEN** a user downloads `/export/csv/presupuestos/<codigo_ine>.csv`
- **THEN** the file contains presupuestos data and does not duplicate indicator `framework` / `record_type = indicador` rows from the indicator export

---

## MODIFIED Requirements

### Requirement: Static download from municipio ODS UI

The municipio ODS page SHALL expose user-visible export control(s) that download or open static CSV files for the current `codigo_ine` without runtime database queries for CSV generation. When the indicadores tab is active, the control SHALL target `/export/csv/<codigo_ine>.csv`. When the presupuestos tab is active, the control SHALL target `/export/csv/presupuestos/<codigo_ine>.csv`. Label and description text for each export SHALL be covered by i18n keys in all supported locales and SHALL clearly state which dataset each file contains.

#### Scenario: User downloads indicator export

- **WHEN** a visitor on `/muni/ods/<ine>` with the indicadores tab active activates the export control
- **THEN** the browser receives the prebuilt indicator file for that `<ine>` at `/export/csv/<ine>.csv`

#### Scenario: User downloads presupuestos export

- **WHEN** a visitor on `/muni/ods/<ine>` with the presupuestos tab active activates the export control
- **THEN** the browser receives the prebuilt presupuestos file for that `<ine>` at `/export/csv/presupuestos/<ine>.csv`
