## MODIFIED Requirements

### Requirement: Load regiones directly
The system SHALL load parsed `regiones.csv` records directly into the `REGIONES` table without transformation, mapping `codigo_ine` → `codigo_ine`, `nombre` → `nombre`, `poblacion` → `poblacion`, `id_poblacion` → `id_poblacion`, `id_especial` → `id_especial`, `id_especial2` → `id_especial2`, `id_especial3` → `id_especial3`.

#### Scenario: Direct region loading
- **WHEN** `regiones.csv` contains 7 rows
- **THEN** the `REGIONES` table SHALL contain exactly 7 rows with matching data

#### Scenario: id_especial2 and id_especial3 persisted
- **WHEN** a parsed region row has non-empty `id_especial2` or `id_especial3`
- **THEN** the corresponding `REGIONES` row SHALL store those values in the same-named columns
