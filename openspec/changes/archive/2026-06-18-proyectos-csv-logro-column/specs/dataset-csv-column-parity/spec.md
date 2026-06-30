## ADDED Requirements

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
