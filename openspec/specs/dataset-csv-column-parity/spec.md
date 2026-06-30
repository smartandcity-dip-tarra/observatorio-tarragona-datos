# dataset-csv-column-parity

## Purpose

Enforce exact header parity between on-disk dataset CSV files and declared column contracts so schema drift is caught by `npm run check:csv` before transform or load.

## Requirements

### Requirement: Declared CSV header contract per tracked file
The system SHALL maintain, for each opted-in dataset CSV, a canonical list of allowed column names (header cells) for that file's first data row definition. The initial opted-in file SHALL be `regiones.csv`; the structure SHALL allow adding more filenames without redesign.

#### Scenario: Contract lists all current regiones columns
- **WHEN** the contract for `regiones.csv` is evaluated
- **THEN** it SHALL include at minimum: `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`

### Requirement: Declared CSV header contract for proyectos.csv
The system SHALL maintain a canonical column list for `proyectos.csv` that includes all client-delivered header fields. The contracted columns SHALL be, in order: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`, `logro`.

#### Scenario: Contract lists all current proyectos columns
- **WHEN** the contract for `proyectos.csv` is evaluated
- **THEN** it SHALL include: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`, `logro`

#### Scenario: proyectos header with logro passes parity
- **WHEN** `proyectos.csv` header row is exactly `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`, `logro` (after BOM and whitespace trimming)
- **THEN** the header parity check for `proyectos.csv` SHALL pass

#### Scenario: proyectos missing logro fails parity
- **WHEN** `proyectos.csv` header row omits `logro` but includes the other five contracted columns
- **THEN** the header parity check for `proyectos.csv` SHALL fail
- **AND THEN** the failure details SHALL name the missing column `logro`

### Requirement: Fail integrity when CSV headers drift from contract
The CSV integrity tooling (run via the existing check command, e.g. `npm run check:csv`) SHALL compare the parsed header row of each opted-in file to that file's canonical column list.

#### Scenario: Unexpected column fails check
- **WHEN** an opted-in CSV contains a header cell that is not in the canonical list for that file
- **THEN** the check SHALL fail
- **AND THEN** the failure details SHALL name the file and the unexpected column(s)

#### Scenario: Missing contracted column fails check
- **WHEN** an opted-in CSV's header row is missing a column that appears in the canonical list for that file
- **THEN** the check SHALL fail
- **AND THEN** the failure details SHALL name the file and the missing column(s)

#### Scenario: Exact parity passes
- **WHEN** the header row contains exactly the canonical columns (no extras, no omissions), modulo BOM trimming and whitespace trimming on header names
- **THEN** the header parity check for that file SHALL pass
