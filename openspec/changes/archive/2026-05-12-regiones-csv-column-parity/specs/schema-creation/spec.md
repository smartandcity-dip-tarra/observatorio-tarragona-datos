## MODIFIED Requirements

### Requirement: Create REGIONES table
The system SHALL create a `REGIONES` table with columns: `codigo_ine` (TEXT, PRIMARY KEY), `nombre` (TEXT), and additional columns for `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`.

#### Scenario: Table with unique municipality codes
- **WHEN** the `REGIONES` table is created
- **THEN** `codigo_ine` is the PRIMARY KEY ensuring uniqueness

#### Scenario: Extended classification columns
- **WHEN** the schema creation runs
- **THEN** the `REGIONES` table SHALL include nullable `TEXT` columns `id_especial2` and `id_especial3`
