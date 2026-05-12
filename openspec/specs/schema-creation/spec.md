# schema-creation

## Purpose

Define the SQLite table DDL produced by the transform pipeline so the static database matches what the Nuxt server and integrity checks expect.
## Requirements
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

### Requirement: Create METADATA_ES table
The system SHALL create a `METADATA_ES` table with columns: `id_indicador` (TEXT, FOREIGN KEY to METADATA), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Foreign key to METADATA
- **WHEN** the `METADATA_ES` table is created
- **THEN** `id_indicador` SHALL reference `METADATA(id_indicador)`

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

### Requirement: Create INDICADORES table
The system SHALL create a single `INDICADORES` table with columns: `id_indicador` (TEXT, FK to METADATA), `codigo_ine` (TEXT, FK to REGIONES), `periodo` (INTEGER, NOT NULL), `valor` (REAL), `indice` (REAL), `categoria` (TEXT), `no_agregar` (TEXT), `texto` (TEXT). This table stores all non-descriptive indicator values regardless of their metadata `tipo`.

#### Scenario: Table created with correct schema
- **WHEN** the schema creation runs
- **THEN** the `INDICADORES` table exists with foreign keys to `METADATA(id_indicador)` and `REGIONES(codigo_ine)`

#### Scenario: No tipo column in INDICADORES
- **WHEN** the `INDICADORES` table is created
- **THEN** it SHALL NOT contain a `tipo` or `clase` column — the indicator type is available via `JOIN METADATA`

#### Scenario: Contains both ODS and agenda indicators
- **WHEN** data is loaded
- **THEN** `INDICADORES` contains rows for indicators with `METADATA.tipo = 'ods'` AND `METADATA.tipo = 'agenda'`

#### Scenario: Does not contain descriptive indicators
- **WHEN** data is loaded
- **THEN** `INDICADORES` SHALL NOT contain rows for indicators with `METADATA.tipo = 'descriptivo'` — those remain in `INDICADORES_DESCRIPTIVOS`

### Requirement: Create INDICADORES_DESCRIPTIVOS table
The system SHALL create an `INDICADORES_DESCRIPTIVOS` table with columns: `id_indicador` (TEXT, FK), `codigo_ine` (TEXT, FK), `periodo` (INTEGER), `valor` (REAL), `umbral` (TEXT).

#### Scenario: Descriptive indicator storage
- **WHEN** the table is created
- **THEN** it includes the `umbral` text column specific to descriptive indicators

### Requirement: Create DICCIONARIO table
The system SHALL create a `DICCIONARIO` table with columns: `id_dict` (TEXT, PRIMARY KEY), `nivel` (INTEGER), `agenda` (TEXT), `logo` (TEXT), and extra data columns.

#### Scenario: Dictionary with composite ID
- **WHEN** the table is created
- **THEN** `id_dict` SHALL encode the dimension identifier (the `dimension` value from the CSV) qualified by agenda type

### Requirement: Create DICCIONARIO_ES and DICCIONARIO_CAT tables
The system SHALL create translation tables for the dictionary with: `id_dict` (TEXT, FK), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Spanish translations populated
- **WHEN** the schema and data are loaded
- **THEN** `DICCIONARIO_ES` contains Spanish names/descriptions from the source CSV

#### Scenario: Catalan translations empty
- **WHEN** the schema is created
- **THEN** `DICCIONARIO_CAT` exists with correct schema but no rows

### Requirement: Create ARQUITECTURA_L2 table
The system SHALL create an `ARQUITECTURA_L2` table with columns: `parent` (TEXT), `child` (TEXT), representing parent-child relationships between dictionary entries and metadata indicators.

#### Scenario: Junction table structure
- **WHEN** the table is created
- **THEN** `parent` references a diccionario dimension and `child` references a metadata indicator

### Requirement: Create PROMEDIOS_ODS table
The system SHALL create a `PROMEDIOS_ODS` table with columns: `id_dict` (TEXT, FK to DICCIONARIO), `codigo_ine` (TEXT, FK to REGIONES), `periodo` (INTEGER), `valor` (REAL), and additional aggregation columns (`n_indicadores`, `ods_objetivo`).

#### Scenario: ODS averages storage
- **WHEN** the table is created
- **THEN** it stores promedio data from both `promedios_municipio_meta_ods` and `promedios_municipio_ods_objetivo` sources

### Requirement: Create PROMEDIOS_AGENDAS table
The system SHALL create a `PROMEDIOS_AGENDAS` table with columns: `id_dict` (TEXT, FK), `codigo_ine` (TEXT, FK), `periodo` (INTEGER), `valor` (REAL), and additional columns (`n_indicadores`).

#### Scenario: Agenda averages storage
- **WHEN** the table is created
- **THEN** it stores promedio data from `promedios_municipio_objetivo_aue`

### Requirement: Enable foreign key enforcement
The system SHALL enable SQLite foreign key enforcement (`PRAGMA foreign_keys = ON`) before any data insertion.

#### Scenario: Foreign key pragma
- **WHEN** the database connection is opened
- **THEN** the system executes `PRAGMA foreign_keys = ON` before creating tables or inserting data

