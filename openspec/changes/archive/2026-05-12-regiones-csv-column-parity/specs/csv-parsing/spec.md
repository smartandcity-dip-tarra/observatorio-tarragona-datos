## MODIFIED Requirements

### Requirement: Parse regiones CSV
The system SHALL read `regiones.csv` and produce records with: `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`.

#### Scenario: Standard regiones file
- **WHEN** the parser reads `regiones.csv` with 7 municipality rows
- **THEN** it produces 7 records with `codigo_ine` as the unique key

#### Scenario: Optional id_especial2 and id_especial3
- **WHEN** a row has empty `id_especial2` or `id_especial3` cells
- **THEN** those fields SHALL be `null` in the parsed record
