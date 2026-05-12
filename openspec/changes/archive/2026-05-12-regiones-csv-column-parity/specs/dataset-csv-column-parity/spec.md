## ADDED Requirements

### Requirement: Declared CSV header contract per tracked file
The system SHALL maintain, for each opted-in dataset CSV, a canonical list of allowed column names (header cells) for that file’s first data row definition. The initial opted-in file SHALL be `regiones.csv`; the structure SHALL allow adding more filenames without redesign.

#### Scenario: Contract lists all current regiones columns
- **WHEN** the contract for `regiones.csv` is evaluated
- **THEN** it SHALL include at minimum: `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`

### Requirement: Fail integrity when CSV headers drift from contract
The CSV integrity tooling (run via the existing check command, e.g. `npm run check:csv`) SHALL compare the parsed header row of each opted-in file to that file’s canonical column list.

#### Scenario: Unexpected column fails check
- **WHEN** an opted-in CSV contains a header cell that is not in the canonical list for that file
- **THEN** the check SHALL fail
- **AND THEN** the failure details SHALL name the file and the unexpected column(s)

#### Scenario: Missing contracted column fails check
- **WHEN** an opted-in CSV’s header row is missing a column that appears in the canonical list for that file
- **THEN** the check SHALL fail
- **AND THEN** the failure details SHALL name the file and the missing column(s)

#### Scenario: Exact parity passes
- **WHEN** the header row contains exactly the canonical columns (no extras, no omissions), modulo BOM trimming and whitespace trimming on header names
- **THEN** the header parity check for that file SHALL pass
