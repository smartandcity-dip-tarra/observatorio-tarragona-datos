# csv-parsing

## Purpose

Parse dataset CSV files under `dataset/` into typed in-memory structures used by the transform pipeline before SQLite load.
## Requirements
### Requirement: Parse metadata CSV
The system SHALL read `metadatos_agendas.csv` and produce a structured array of metadata records. Each record SHALL contain all columns: `indicador`, `clase`, `nombre`, `detalle`, `fuente`, `actualizacion`, `corte_muestra`, `unidad`, `tipo`, `formula`, `umbral_optimo`, `umbral_malo`, `ods`, `meta`, `aue1`, `aue2`, `muestra_ods`, `muestra_aue`. Empty fields SHALL be represented as `null`.

#### Scenario: Standard metadata file
- **WHEN** the parser reads a valid `metadatos_agendas.csv` with 154 data rows
- **THEN** it produces 154 metadata records with `indicador` as the unique key and `clase` set to one of `"descriptivo"`, `"agendas"`, or `"ods"`

#### Scenario: Semicolon-separated fields
- **WHEN** a metadata row has `ods` value `"1;3"` and `aue1` value `"1;2;3;4;5;6;7;8;9;10"`
- **THEN** the parser produces arrays `[1, 3]` and `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` respectively

#### Scenario: Empty optional fields
- **WHEN** a metadata row has empty `fuente`, `actualizacion`, `corte_muestra`, `umbral_optimo`, `umbral_malo` fields
- **THEN** those fields SHALL be `null` in the parsed record

### Requirement: Parse diccionario CSV
The system SHALL read `diccionario.csv` and produce structured records with fields: `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`.

#### Scenario: Standard diccionario file
- **WHEN** the parser reads `diccionario.csv`
- **THEN** it produces records where `dimension` is the unique identifier within each `agenda`, and `nivel` is either `1` or `2`

### Requirement: Parse indicadores agendas CSV
The system SHALL read `indicadores_agendas.csv` and produce records with: `indicador`, `periodo`, `codigo_ine`, `valor`, `indice`, `categoria`, `no_agregar`, `texto`.

#### Scenario: Numeric indicator IDs
- **WHEN** the parser reads `indicadores_agendas.csv` containing rows with numeric `indicador` values like `1`, `3`
- **THEN** indicator IDs SHALL be stored as strings for consistency with the unified ID scheme

#### Scenario: Null optional columns
- **WHEN** a row has empty `categoria`, `no_agregar`, `texto` columns
- **THEN** those fields SHALL be `null`

### Requirement: Parse descriptivos CSV
The system SHALL read `descriptivos.csv` and produce records with: `indicador`, `periodo`, `codigo_ine`, `valor`, `umbral`.

#### Scenario: Standard descriptivos file
- **WHEN** the parser reads `descriptivos.csv`
- **THEN** all records have a string `indicador` starting with `"D-"`, a numeric `valor`, and a string `umbral` category

### Requirement: Parse regiones CSV
The system SHALL read `regiones.csv` and produce records with: `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`.

#### Scenario: Standard regiones file
- **WHEN** the parser reads `regiones.csv` with 7 municipality rows
- **THEN** it produces 7 records with `codigo_ine` as the unique key

#### Scenario: Optional id_especial2 and id_especial3
- **WHEN** a row has empty `id_especial2` or `id_especial3` cells
- **THEN** those fields SHALL be `null` in the parsed record

### Requirement: Parse umbrales CSV
The system SHALL read `umbrales.csv` and produce records with all statistical threshold fields: `indicador`, `nombre`, `unidad`, `conteo`, `minimo`, `maximo`, `desv_tipica`, `percentil25`, `percentil75`, `percentil10`, `percentil90`, `origen`, `umbral_optimo`, `umbral_malo`.

#### Scenario: Standard umbrales file
- **WHEN** the parser reads `umbrales.csv`
- **THEN** numeric fields (`conteo`, `minimo`, `maximo`, etc.) SHALL be parsed as numbers, not strings

### Requirement: Parse promedios CSVs
The system SHALL read the three promedio files and produce structured records for each.

#### Scenario: Parse promedios_municipio_meta_ods
- **WHEN** the parser reads `promedios_municipio_meta_ods.csv`
- **THEN** it produces records with: `codigo_ine`, `meta_ods`, `promedio_indice`, `n_indicadores`, `periodo_max`, `ods_objetivo`

#### Scenario: Parse promedios_municipio_objetivo_aue
- **WHEN** the parser reads `promedios_municipio_objetivo_aue.csv`
- **THEN** it produces records with: `codigo_ine`, `objetivo_aue`, `promedio_indice`, `n_indicadores`, `periodo_max`

#### Scenario: Parse promedios_municipio_ods_objetivo
- **WHEN** the parser reads `promedios_municipio_ods_objetivo.csv`
- **THEN** it produces records with: `codigo_ine`, `ods_objetivo`, `promedio_metas`, `n_metas`

### Requirement: Parse rangos descriptivos CSV
The system SHALL read `rangos_descriptivos.csv` and produce records with: `code`, `id`, `NMun`, `1Q`, `MEDIO`, `3Q`.

#### Scenario: Standard rangos file
- **WHEN** the parser reads `rangos_descriptivos.csv`
- **THEN** it produces records where `id` links to a descriptive indicator and `NMun` represents a population range category

### Requirement: Parse diccionario CAT CSV

The system SHALL read `diccionario_cat.csv` and produce structured records with the same shape as `diccionario.csv` records: `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`. Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[catalan] WARN: dataset/diccionario_cat.csv not found — Catalan tables left empty` to stdout.

#### Scenario: Standard diccionario_cat file
- **WHEN** the parser reads a valid `diccionario_cat.csv` with 246 data rows
- **THEN** it produces 246 records where `dimension` is the unique identifier within each `agenda`, and `nombre`/`detalle` contain the Catalan strings

#### Scenario: Same composite-key shape as ES
- **WHEN** the parser reads `diccionario_cat.csv`
- **THEN** each record SHALL be uniquely identifiable by the tuple `(agenda, dimension)` mirroring the ES convention

#### Scenario: Empty optional fields
- **WHEN** a row in `diccionario_cat.csv` has an empty `detalle` or `logo`
- **THEN** those fields SHALL be `null` in the parsed record

#### Scenario: File missing
- **WHEN** `dataset/diccionario_cat.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[catalan] WARN: dataset/diccionario_cat.csv not found — Catalan tables left empty` to stdout

### Requirement: Parse metadata CAT CSV

The system SHALL read `metadatos_agendas_cat.csv` and produce structured records with the columns the file actually contains: `indicador`, `clase`, `nombre`, `detalle`, `unidad`, `formula`. Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[catalan] WARN: dataset/metadatos_agendas_cat.csv not found — Catalan tables left empty` to stdout.

#### Scenario: Standard metadata_cat file
- **WHEN** the parser reads a valid `metadatos_agendas_cat.csv` with 161 data rows
- **THEN** it produces 161 records keyed by `indicador`, each containing the Catalan `nombre`, `detalle`, `unidad`, and `formula` (and `clase` retained for the integrity check only)

#### Scenario: Empty optional fields
- **WHEN** a row in `metadatos_agendas_cat.csv` has an empty `detalle`, `unidad`, or `formula`
- **THEN** those fields SHALL be `null` in the parsed record

#### Scenario: File missing
- **WHEN** `dataset/metadatos_agendas_cat.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[catalan] WARN: dataset/metadatos_agendas_cat.csv not found — Catalan tables left empty` to stdout

#### Scenario: CAT-only columns are ignored gracefully
- **WHEN** the CAT csv contains a column not declared in the parser shape
- **THEN** that column SHALL be ignored without error

### Requirement: Parse diccionario EN CSV

The system SHALL read `diccionario_en.csv` and produce structured records with the same shape as `diccionario.csv` records: `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`. Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[english] WARN: dataset/diccionario_en.csv not found — English tables left empty` to stdout.

#### Scenario: Standard diccionario_en file
- **WHEN** the parser reads a valid `diccionario_en.csv` with at least one row
- **THEN** it produces records where `dimension` is the identifier within each `agenda`, mirroring the ES parser

#### Scenario: File missing
- **WHEN** `dataset/diccionario_en.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[english] WARN: dataset/diccionario_en.csv not found — English tables left empty` to stdout

### Requirement: Parse metadata EN CSV

The system SHALL read `metadatos_agendas_en.csv` and produce structured records with the columns the file actually contains, at minimum: `indicador`, `nombre`, `detalle`, `unidad`, `formula` (and `clase` when present). Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[english] WARN: dataset/metadatos_agendas_en.csv not found — English tables left empty` to stdout.

#### Scenario: Standard metadata_en file
- **WHEN** the parser reads a valid `metadatos_agendas_en.csv`
- **THEN** it produces records keyed by `indicador` with English `nombre`, `detalle`, `unidad`, and `formula` where present

#### Scenario: File missing
- **WHEN** `dataset/metadatos_agendas_en.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[english] WARN: dataset/metadatos_agendas_en.csv not found — English tables left empty` to stdout

### Requirement: Parse proyectos CSV

The system SHALL read `proyectos.csv` and produce records with fields: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`. Empty `descripcion` SHALL be `null`.

#### Scenario: Row shape
- **WHEN** the parser reads `proyectos.csv` with a row `linea=1`, `objetivo=1.1`, `codigo=1.1.1`
- **THEN** the parsed record SHALL expose those five fields as strings (after trimming)

