## ADDED Requirements

### Requirement: Presupuestos tab uses INE code for Mongo lookup

The municipio presupuestos tab SHALL identify the selected municipio by `codigo_ine` and SHALL NOT require or consume a legacy presupuestos internal id.

#### Scenario: Municipio ODS page opens presupuestos tab

- **WHEN** a user opens `/muni/ods/<codigo_ine>` and selects the presupuestos tab
- **THEN** the tab SHALL request presupuestos data using the current route/catalog `codigo_ine`

#### Scenario: Legacy presupuestos id is absent

- **WHEN** the Nuxt prepare municipio catalog is generated
- **THEN** municipio catalog rows SHALL NOT include an `id_presupuestos` field

### Requirement: Mongo query targets the 2026 global long-table schema

The presupuestos data access layer SHALL query the configured global Mongo presupuestos data source by matching `codigo_ine` and SHALL support both `presupuestos` and `liquidaciones` datasets with the same schema contract.

#### Scenario: Presupuestos mode

- **WHEN** the user selects presupuestos mode for a municipio
- **THEN** the Mongo request SHALL target the `presupuestos` dataset and filter rows by that municipio's normalized INE code

#### Scenario: Liquidaciones mode

- **WHEN** the user selects liquidaciones mode for a municipio
- **THEN** the Mongo request SHALL target the `liquidaciones` dataset and filter rows by that municipio's normalized INE code

### Requirement: Long-table Mongo rows are aggregated into the existing budget row shape

The Mongo pipeline SHALL aggregate rows by year and functional program group, pivot economic chapters into chapter totals, compute `TOTAL`, and return rows compatible with the existing presupuestos processing functions.

#### Scenario: Chapter rows for one program and year

- **WHEN** Mongo contains multiple rows for the same `(codigo_ine, anyo, grupo_programa)` with different `cap_eco` values
- **THEN** the returned row SHALL contain that `year`, that `cdfgr`/program code, per-chapter numeric totals, and a `TOTAL` equal to the sum of the included chapter totals

#### Scenario: Multiple years exist

- **WHEN** Mongo contains rows for multiple `anyo` values for the same municipio
- **THEN** the returned data SHALL include every available year without hardcoding a fixed year list

### Requirement: Budget summaries handle grupo_programa data without level-1 rows

Budget processing SHALL compute the total budget from level-1 rows when such rows exist, and SHALL fall back to summing all returned program rows when the 2026 `grupo_programa` aggregation does not produce level-1 rows.

#### Scenario: Legacy-like rows include level 1

- **WHEN** returned budget rows include at least one row whose program code level is `1`
- **THEN** total budget SHALL be computed from those level-1 rows

#### Scenario: 2026 rows only include group-level programs

- **WHEN** returned budget rows do not include any level-1 rows
- **THEN** total budget SHALL be computed from all returned program rows

### Requirement: ODS and meta assignment are type-stable

Program-to-ODS and program-to-meta assignment SHALL compare mapping program codes and returned program codes as strings so assignments are stable regardless of whether CSV parsing produced numbers or strings.

#### Scenario: Mapping code parsed as number and program code parsed as string

- **WHEN** a mapping row code and a returned program code represent the same program but have different JavaScript primitive types
- **THEN** the program SHALL still receive the matching ODS/meta allocation

### Requirement: Legacy presupuestos id plumbing is removed from first-party app code

First-party Nuxt app code SHALL NOT use `id_presupuestos`, `getPipelineForId`, or `municipios_tarragona.csv` as part of the municipio presupuestos data flow.

#### Scenario: Developer searches presupuestos data flow

- **WHEN** a developer searches the app code for the municipio presupuestos fetch path
- **THEN** the path SHALL pass `codigo_ine` from the municipio page to the presupuestos component and call the INE-based Mongo pipeline helper

#### Scenario: Prepare handler runs

- **WHEN** the Nuxt prepare handler runs
- **THEN** it SHALL build the municipio catalog from the SQLite `REGIONES` source without merging presupuestos ids from `municipios_tarragona.csv`
