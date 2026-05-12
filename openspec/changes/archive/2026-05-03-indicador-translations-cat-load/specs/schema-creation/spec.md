## MODIFIED Requirements

### Requirement: Create METADATA table

The system SHALL create a `METADATA` table with columns: `id_indicador` (TEXT, PRIMARY KEY), `tipo` (TEXT, one of 'agenda', 'ods', 'descriptivo'), `direction` (TEXT, nullable, one of 'asc', 'desc', 'neutral'), and all extra data columns from the source metadata (unidad, tipo_dato, formula, umbral_optimo, umbral_malo, fuente, actualizacion, corte_muestra, muestra_ods, muestra_aue).

#### Scenario: Table created with correct schema
- **WHEN** the schema creation runs
- **THEN** the `METADATA` table exists with `id_indicador` as PRIMARY KEY and `tipo` as a NOT NULL TEXT column

#### Scenario: Direction column present and nullable
- **WHEN** the `METADATA` table is created
- **THEN** it SHALL include a `direction TEXT` column that is nullable
- **AND** that column SHALL accept the values `'asc'`, `'desc'`, `'neutral'`, and `NULL`

#### Scenario: Original formula column retained
- **WHEN** the `METADATA` table is created
- **THEN** it SHALL still include the original `formula TEXT` column for the deprecation window

### Requirement: Create METADATA_CAT table

The system SHALL create a `METADATA_CAT` table with columns: `id_indicador` (TEXT, PRIMARY KEY, FOREIGN KEY to METADATA), `nombre` (TEXT), `descripcion` (TEXT), `unidad` (TEXT, nullable).

#### Scenario: Foreign key to METADATA
- **WHEN** the `METADATA_CAT` table is created
- **THEN** `id_indicador` SHALL reference `METADATA(id_indicador)`

#### Scenario: Unidad column present and nullable
- **WHEN** the `METADATA_CAT` table is created
- **THEN** it SHALL include a `unidad TEXT` column that is nullable
- **AND** rows where the Catalan unidad equals the Spanish unidad SHALL store `unidad = NULL`

#### Scenario: Populated from CAT csv
- **WHEN** the schema is created and the data load runs against a `metadatos_agendas_cat.csv` with 161 rows
- **THEN** `METADATA_CAT` SHALL contain up to 161 rows (less any dropped due to unknown id), each with at least one of `nombre`, `descripcion`, or `unidad` populated
