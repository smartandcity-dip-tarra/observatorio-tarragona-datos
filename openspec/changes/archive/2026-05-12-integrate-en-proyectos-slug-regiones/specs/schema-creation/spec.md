# schema-creation

## ADDED Requirements

### Requirement: Create METADATA_EN table

The system SHALL create a `METADATA_EN` table with columns: `id_indicador` (TEXT, PRIMARY KEY, FOREIGN KEY to `METADATA`), `nombre` (TEXT), `descripcion` (TEXT), `unidad` (TEXT, nullable).

#### Scenario: Foreign key to METADATA
- **WHEN** the `METADATA_EN` table is created
- **THEN** `id_indicador` SHALL reference `METADATA(id_indicador)`

#### Scenario: Unidad column present and nullable
- **WHEN** the `METADATA_EN` table is created
- **THEN** it SHALL include a `unidad TEXT` column that is nullable
- **AND** rows where the English `unidad` equals the Spanish `unidad` SHALL store `unidad = NULL` after transform rules are applied

### Requirement: Create DICCIONARIO_EN table

The system SHALL create a `DICCIONARIO_EN` table with columns: `id_dict` (TEXT, PRIMARY KEY, FOREIGN KEY to `DICCIONARIO`), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Foreign key to DICCIONARIO
- **WHEN** the `DICCIONARIO_EN` table is created
- **THEN** `id_dict` SHALL reference `DICCIONARIO(id_dict)`

### Requirement: Create PROYECTOS table

The system SHALL create a `PROYECTOS` table with columns: `codigo` (TEXT PRIMARY KEY NOT NULL), `linea` (TEXT NOT NULL), `objetivo` (TEXT NOT NULL), `nombre` (TEXT NOT NULL), `descripcion` (TEXT).

#### Scenario: Table exists after schema migration
- **WHEN** schema creation runs
- **THEN** a `PROYECTOS` table exists with `codigo` as PRIMARY KEY

## MODIFIED Requirements

### Requirement: Create REGIONES table

The system SHALL create a `REGIONES` table with columns: `codigo_ine` (TEXT, PRIMARY KEY), `nombre` (TEXT), and additional columns for `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`. The `id_especial2` column SHALL store a **deterministic slug** derived from the typology label present in `regiones.csv` using the canonical slug function defined in the data-transformation capability; it SHALL NOT store the raw label text from the CSV.

#### Scenario: Table with unique municipality codes
- **WHEN** the `REGIONES` table is created
- **THEN** `codigo_ine` is the PRIMARY KEY ensuring uniqueness

#### Scenario: Extended classification columns
- **WHEN** the schema creation runs
- **THEN** the `REGIONES` table SHALL include nullable `TEXT` columns `id_especial2` and `id_especial3`

#### Scenario: id_especial2 stores slug not display text
- **WHEN** the slug function maps the source label `"Municipios industriales"` to `municipios-industriales`
- **THEN** a `REGIONES` row whose source CSV had that label SHALL have `id_especial2 = 'municipios-industriales'`
