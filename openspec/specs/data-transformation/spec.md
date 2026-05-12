# data-transformation

## Purpose

CSV-to-SQLite data transformation pipeline that ingests the dataset CSV files (metadatos, diccionario, indicadores, descriptivos, promedios, etc.) and loads them into normalized SQLite tables consumed by the Nuxt application.
## Requirements
### Requirement: Map all non-descriptive indicators to INDICADORES
The system SHALL transform all indicator value rows from `indicadores_agendas.csv` whose `indicador` exists in metadata with `clase` of `"agendas"` or `"ods"` into rows for the unified `INDICADORES` table. Indicators with unknown `indicador` (not found in metadata) SHALL be skipped with a warning. Descriptive indicators are handled separately via `descriptivos.csv`.

#### Scenario: Agenda indicator mapping
- **WHEN** an indicator value row from `indicadores_agendas.csv` has an `indicador` whose metadata `clase` is `"agendas"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: ODS indicator mapping
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"ods"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: Unknown indicator skipped
- **WHEN** an indicator value row references an `indicador` not found in metadata
- **THEN** the system SHALL log a warning and skip the row

#### Scenario: Descriptivo indicators excluded
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"descriptivo"`
- **THEN** the row is NOT inserted into `INDICADORES` (descriptivos come from a separate CSV and go to `INDICADORES_DESCRIPTIVOS`)

#### Scenario: Row count preserved
- **WHEN** the transform completes
- **THEN** the total number of rows in `INDICADORES` SHALL equal the sum of rows that previously went into `INDICADORES_ODS` plus `INDICADORES_AGENDAS`

### Requirement: Populate METADATA from metadatos_agendas
The system SHALL transform each parsed metadata record into a `METADATA` row, mapping `indicador` → `id_indicador`, `clase` → `tipo` (normalizing: `"descriptivo"` stays, `"agendas"` → `"agenda"`, `"ods"` → `"ods"`), and all remaining fields as extra data.

#### Scenario: Type normalization
- **WHEN** a metadata record has `clase = "agendas"`
- **THEN** the `METADATA.tipo` column SHALL contain `"agenda"` (without trailing 's')

#### Scenario: All indicators populated
- **WHEN** all metadata rows are processed
- **THEN** every unique `indicador` from the CSV has exactly one row in `METADATA`

### Requirement: Populate METADATA_ES from metadata names
The system SHALL create `METADATA_ES` rows using `nombre` and `detalle` from each metadata record as `nombre` and `descripcion` respectively.

#### Scenario: Spanish metadata translations
- **WHEN** a metadata record has `nombre = "Superficie de cobertura artificial por municipio"` and `detalle` is empty
- **THEN** `METADATA_ES` contains a row with that `nombre` and `descripcion = NULL`

### Requirement: Extract ARQUITECTURA_L2 relationships
The system SHALL parse the semicolon-separated `ods`, `meta`, `le`, `le2` columns from metadata and produce `ARQUITECTURA_L2` rows linking parent dictionary dimensions to child indicators. The former `aue1` / `aue2` columns SHALL no longer be read.

#### Scenario: ODS parent-child from meta column
- **WHEN** an indicator has `meta = "2.4"` and `ods = "2"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent` referencing the diccionario entry for meta `2.4` (ODS) and `child` = the indicator ID

#### Scenario: Tarragona parent-child from le2 column
- **WHEN** an indicator has `le2 = "1.2;4.3"` and `le = "1;4"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent = 'TARRAGONA-1.2'` and `parent = 'TARRAGONA-4.3'`, each with `child` = the indicator ID

#### Scenario: Tarragona parent-child from le column
- **WHEN** an indicator has `le = "1;3;5"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent = 'TARRAGONA-1'`, `parent = 'TARRAGONA-3'`, `parent = 'TARRAGONA-5'`, each pointing to the same child indicator

#### Scenario: Multiple parents
- **WHEN** an indicator has `le = "1;2;3"` (semicolon-separated)
- **THEN** one `ARQUITECTURA_L2` row is created for each parent, all pointing to the same child indicator

#### Scenario: Empty parent columns
- **WHEN** an indicator has empty `ods` and `meta` columns (or empty `le` and `le2`)
- **THEN** no `ARQUITECTURA_L2` rows are created for that indicator's ODS (resp. Tarragona) relationships

#### Scenario: Legacy AUE columns are ignored
- **WHEN** the CSV still contains non-empty `aue1` or `aue2` columns (e.g. during a transitional client delivery)
- **THEN** the transform SHALL NOT produce `ARQUITECTURA_L2` rows from those columns
- **AND** no row in `ARQUITECTURA_L2` SHALL have a `parent` starting with `'AUE-'`

### Requirement: Transform diccionario to DICCIONARIO
The system SHALL transform parsed diccionario records into `DICCIONARIO` rows, constructing `id_dict` from the combination of `agenda` and `dimension`. Supported agenda values SHALL include `ODS`, `2030`, and `TARRAGONA`; the legacy `AUE` value SHALL no longer appear in rebuilt dictionaries.

#### Scenario: Tarragona dimension ID
- **WHEN** a diccionario record has `agenda = "TARRAGONA"` and `dimension = "1.2"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"TARRAGONA-1.2"`

#### Scenario: Tarragona level-1 ID
- **WHEN** a diccionario record has `agenda = "TARRAGONA"` and `dimension = "3"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"TARRAGONA-3"`

#### Scenario: ODS dimension ID
- **WHEN** a diccionario record has `agenda = "ODS"` and `dimension = "2"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"ODS-2"`

#### Scenario: AUE rows are not emitted
- **WHEN** the input `diccionario.csv` no longer contains rows with `agenda = 'AUE'`
- **THEN** the rebuilt `DICCIONARIO` SHALL contain no row with `id_dict` starting with `'AUE-'`

### Requirement: Populate DICCIONARIO_ES from diccionario names
The system SHALL create `DICCIONARIO_ES` rows using `nombre` and `detalle` from each diccionario record.

#### Scenario: Spanish dictionary translations
- **WHEN** a diccionario record has `nombre = "ORDENAR EL TERRITORIO..."` and `detalle` is empty
- **THEN** `DICCIONARIO_ES` contains a row with that `nombre` and `descripcion = NULL`

### Requirement: Transform promedios to target tables
The system SHALL map promedio records to the correct target tables:
- `promedios_municipio_meta_ods.csv` → `PROMEDIOS_ODS` with `id_dict` constructed from `meta_ods` (e.g., `"ODS-10.2"`)
- `promedios_municipio_ods_objetivo.csv` → `PROMEDIOS_ODS` with `id_dict` from `ods_objetivo` (e.g., `"ODS-10"`)
- `promedios_municipio_objetivo_aue.csv` → `PROMEDIOS_AGENDAS` with `id_dict` from `objetivo_aue`, prefixed with `TARRAGONA-` (e.g., `"TARRAGONA-1"` for a row where `objetivo_aue = "1"`)

Until the source file `promedios_municipio_objetivo_aue.csv` is renamed by the client, the transform SHALL keep reading it from that filename but SHALL reinterpret its `objetivo_aue` values as Tarragona línea-estratégica ids (`1..6`) and emit them under the `TARRAGONA-` prefix.

#### Scenario: Meta ODS promedios mapping
- **WHEN** a promedios_municipio_meta_ods row has `meta_ods = "10.2"` and `codigo_ine = "08096"`
- **THEN** a `PROMEDIOS_ODS` row is created with `id_dict = "ODS-10.2"` and `codigo_ine = "08096"` and `valor` = `promedio_indice`

#### Scenario: Tarragona promedios mapping
- **WHEN** a promedios_municipio_objetivo_aue row has `objetivo_aue = "3"` and `codigo_ine = "43148"`
- **THEN** a `PROMEDIOS_AGENDAS` row is created with `id_dict = "TARRAGONA-3"`, `codigo_ine = "43148"` and `valor` = `promedio_indice`

#### Scenario: No AUE-prefixed promedios emitted
- **WHEN** the promedios CSV is processed
- **THEN** no row SHALL be inserted into `PROMEDIOS_AGENDAS` with an `id_dict` starting with `'AUE-'`

### Requirement: Load regiones directly
The system SHALL load parsed `regiones.csv` records into the `REGIONES` table, mapping `codigo_ine` → `codigo_ine`, `nombre` → `nombre`, `poblacion` → `poblacion`, `id_poblacion` → `id_poblacion`, `id_especial` → `id_especial`, `id_especial3` → `id_especial3`, and mapping `id_especial2` through the slug function defined in the **Slug function for municipality typology labels** requirement before insert.

#### Scenario: Direct region loading
- **WHEN** `regiones.csv` contains 7 rows
- **THEN** the `REGIONES` table SHALL contain exactly 7 rows with matching data for all columns except `id_especial2` which SHALL contain slugs

#### Scenario: id_especial3 persisted unchanged
- **WHEN** a parsed region row has non-empty `id_especial3`
- **THEN** the corresponding `REGIONES` row SHALL store that value in `id_especial3` unchanged

### Requirement: Wrap insertions in transactions
The system SHALL execute all data insertions within a single SQLite transaction per table group to ensure atomicity and performance.

#### Scenario: Transaction rollback on error
- **WHEN** an insertion error occurs mid-batch
- **THEN** the entire transaction for that table group SHALL be rolled back, leaving the database in a consistent state

### Requirement: Idempotent execution
The system SHALL produce identical output when run multiple times with the same input. The database file SHALL be recreated from scratch on each run (delete if exists, then create).

#### Scenario: Re-run produces same result
- **WHEN** the pipeline runs twice with the same CSV input
- **THEN** the resulting database files SHALL be byte-equivalent

### Requirement: Metadata record exposes le and le2
The `MetadataRecord` produced by the parser SHALL expose the semicolon-parsed `le` (level-1 Tarragona ids) and `le2` (level-2 Tarragona dimensions) columns from `metadatos_agendas.csv`. The legacy `aue1` / `aue2` fields SHALL be removed from the `MetadataRecord` type.

#### Scenario: Parser populates le and le2
- **WHEN** `metadatos_agendas.csv` has a row with `le = "2;3"` and `le2 = "2.1;3.2"`
- **THEN** the parsed `MetadataRecord` SHALL have `le = ["2", "3"]` and `le2 = ["2.1", "3.2"]`

#### Scenario: Empty le/le2 parsed as empty arrays
- **WHEN** a row has empty `le` and `le2` columns
- **THEN** the parsed `MetadataRecord` SHALL have `le = []` and `le2 = []`

### Requirement: Strict validation of Tarragona orphan references
The build SHALL include an integrity check that verifies every distinct value of `le` and `le2` in `metadatos_agendas.csv` corresponds to a row in `diccionario.csv` with `agenda = 'TARRAGONA'` and the matching `nivel` (1 for `le`, 2 for `le2`). If any value is unknown, the build SHALL fail with a non-zero exit code and SHALL print a summary listing each orphan code and the indicator ids in which it appears.

#### Scenario: Unknown le value fails the build
- **WHEN** an indicator has `le = "99"` and no row with `agenda = 'TARRAGONA'`, `nivel = 1`, `dimension = '99'` exists in the dictionary
- **THEN** the integrity check SHALL fail
- **AND** the build SHALL exit with a non-zero status
- **AND** the error message SHALL include the orphan value `"99"` and the indicator id

#### Scenario: Unknown le2 value fails the build
- **WHEN** an indicator has `le2 = "1.1"` and no row with `agenda = 'TARRAGONA'`, `nivel = 2`, `dimension = '1.1'` exists in the dictionary
- **THEN** the integrity check SHALL fail with a clear summary of the orphan code(s) and their indicator ids

#### Scenario: All references known passes the check
- **WHEN** every `le` and `le2` value has a corresponding `TARRAGONA` row in the dictionary at the matching level
- **THEN** the integrity check SHALL pass without output to stderr

### Requirement: Populate METADATA_CAT from metadata_cat records

The system SHALL transform parsed `metadatos_agendas_cat` records into `METADATA_CAT` rows, mapping `indicador` → `id_indicador`, `nombre` → `nombre`, `detalle` → `descripcion`, and applying the sparse-override rule for `unidad` (see catalan-translations capability). The CAT `clase` and CAT `formula` columns SHALL NOT be written to `METADATA_CAT`.

#### Scenario: Catalan name and description populated
- **WHEN** a CAT metadata record has `indicador = "1"`, `nombre = "Proporció de persones..."`, `detalle = "Valor central de la distribució..."`
- **THEN** `METADATA_CAT` contains a row with `id_indicador = "1"`, `nombre = "Proporció de persones..."`, `descripcion = "Valor central de la distribució..."`

#### Scenario: Sparse unidad override
- **WHEN** the CAT `unidad` for an indicator equals the ES `unidad`
- **THEN** the `METADATA_CAT.unidad` for that indicator SHALL be `NULL`

#### Scenario: Differing unidad stored
- **WHEN** the CAT `unidad` for an indicator differs from the ES `unidad` and is non-empty
- **THEN** the `METADATA_CAT.unidad` for that indicator SHALL contain the CAT value

#### Scenario: Unknown id dropped with warning
- **WHEN** a CAT metadata record has an `indicador` not present in the ES `metadatos_agendas` records
- **THEN** the row SHALL NOT be inserted into `METADATA_CAT`
- **AND** the transform SHALL emit `[catalan] WARN: dropping CAT translation for unknown id <indicador>`

#### Scenario: ES indicator without CAT row logged once
- **WHEN** an ES indicator has no corresponding CAT row (or its CAT `nombre` is empty)
- **THEN** the transform SHALL emit `[catalan] WARN: missing CAT translation for <indicador>` exactly once for that indicator

### Requirement: Populate DICCIONARIO_CAT from diccionario_cat records

The system SHALL transform parsed `diccionario_cat` records into `DICCIONARIO_CAT` rows, mapping the composite key `(agenda, dimension)` to `id_dict = "<agenda>-<dimension>"`, `nombre` → `nombre`, `detalle` → `descripcion`. Only records whose `agenda` is in the supported set (`'2030'`, `'TARRAGONA'`) SHALL be inserted, mirroring the existing ES rule.

#### Scenario: Catalan dictionary entry inserted
- **WHEN** a CAT diccionario record has `agenda = "TARRAGONA"`, `dimension = "1"`, `nombre = "ORDENAR EL TERRITORI..."`
- **THEN** `DICCIONARIO_CAT` contains a row with `id_dict = "TARRAGONA-1"`, `nombre = "ORDENAR EL TERRITORI..."`, and `descripcion` from the CAT `detalle`

#### Scenario: Unsupported agenda skipped silently
- **WHEN** a CAT diccionario record has `agenda = "AUE"`
- **THEN** the row SHALL NOT be inserted into `DICCIONARIO_CAT` (the AUE agenda is also skipped on the ES side)

#### Scenario: Unknown id_dict dropped with warning
- **WHEN** a CAT diccionario record's computed `id_dict` does not exist in the ES `DICCIONARIO`
- **THEN** the row SHALL NOT be inserted into `DICCIONARIO_CAT`
- **AND** the transform SHALL emit `[catalan] WARN: dropping CAT diccionario translation for unknown id_dict <id_dict>`

### Requirement: Populate METADATA_EN from metadata_en records

The system SHALL transform parsed `metadatos_agendas_en` records into `METADATA_EN` rows using the same field and sparse-`unidad` rules as `METADATA_CAT`, with log prefix `[english]` instead of `[catalan]`. The EN `clase` and EN `formula` columns SHALL NOT be written to `METADATA_EN`.

#### Scenario: English name populated
- **WHEN** an EN metadata record has `indicador = "1"` and a non-empty English `nombre`
- **THEN** `METADATA_EN` contains a row with `id_indicador = "1"` and that `nombre`

#### Scenario: Unknown id dropped with warning
- **WHEN** an EN metadata record has an `indicador` not present in the ES `metadatos_agendas` records
- **THEN** the row SHALL NOT be inserted into `METADATA_EN`
- **AND** the transform SHALL emit `[english] WARN: dropping EN translation for unknown id <indicador>`

### Requirement: Populate DICCIONARIO_EN from diccionario_en records

The system SHALL transform parsed `diccionario_en` records into `DICCIONARIO_EN` rows, mapping the composite key `(agenda, dimension)` to `id_dict = "<agenda>-<dimension>"`, `nombre` → `nombre`, `detalle` → `descripcion`, using the same supported-agenda filter as `DICCIONARIO_CAT`.

#### Scenario: Unknown id_dict dropped with warning
- **WHEN** an EN diccionario record's computed `id_dict` does not exist in the ES `DICCIONARIO`
- **THEN** the row SHALL NOT be inserted into `DICCIONARIO_EN`
- **AND** the transform SHALL emit `[english] WARN: dropping EN diccionario translation for unknown id_dict <id_dict>`

### Requirement: Load PROYECTOS from parsed proyectos records

The system SHALL insert every parsed `proyectos.csv` record into `PROYECTOS` with a one-to-one column mapping. Duplicate `codigo` values SHALL fail the build before insert completes.

#### Scenario: All proyectos loaded
- **WHEN** `proyectos.csv` contains N valid data rows with unique `codigo`
- **THEN** `PROYECTOS` contains exactly N rows after load

### Requirement: Slug function for municipality typology labels

Before loading `REGIONES`, the system SHALL replace each non-null `id_especial2` value from `regiones.csv` with `slugifyTypologyLabel(value)` where that function: NFKD-normalizes Unicode, strips combining marks, lowercases ASCII letters, replaces each maximal run of characters that are not `[a-z0-9]` with a single hyphen, trims hyphens from both ends, and returns `NULL` if the result is empty. If two distinct non-empty source labels produce the same slug, the build SHALL exit with non-zero status and print the slug and both source labels.

#### Scenario: Accented Spanish label becomes ASCII slug
- **WHEN** a region row has `id_especial2 = "Municipios de servicios generales"`
- **THEN** the value inserted into `REGIONES.id_especial2` SHALL be `municipios-de-servicios-generales`

#### Scenario: Empty id_especial2 stays null
- **WHEN** a region row has an empty `id_especial2` in the CSV
- **THEN** the loaded `REGIONES.id_especial2` SHALL be `NULL`

### Requirement: Derive METADATA.direction from Spanish formula

The system SHALL derive a `direction` value for every `METADATA` row from the Spanish `formula` column using the curated mapping defined in the catalan-translations capability. The original `formula` text SHALL remain in `METADATA.formula` unchanged.

#### Scenario: Direction populated for recognized sentinel
- **WHEN** the ES `formula` for an indicator is `"↑ Ascendente (más = mejor)"`
- **THEN** `METADATA.direction` for that indicator SHALL be `"asc"`
- **AND** `METADATA.formula` for that indicator SHALL retain `"↑ Ascendente (más = mejor)"`

#### Scenario: Direction NULL for empty formula
- **WHEN** the ES `formula` for an indicator is empty or missing
- **THEN** `METADATA.direction` for that indicator SHALL be `NULL`

#### Scenario: Direction NULL for unrecognized sentinel
- **WHEN** the ES `formula` for an indicator is non-empty but not in the recognized mapping
- **THEN** `METADATA.direction` for that indicator SHALL be `NULL`
- **AND** the transform SHALL emit `[catalan] WARN: unknown formula sentinel "<text>" for indicator <id> — direction = NULL`

### Requirement: regiones_cat is not ingested

The transform pipeline SHALL NOT read `dataset/regiones_cat.csv`. `REGIONES` SHALL be populated solely from `regiones.csv`. Human-readable typology strings for `id_especial2` SHALL not be stored in SQLite; consumers SHALL resolve display labels using the slug in `REGIONES.id_especial2` with locale-specific resources outside this table.

#### Scenario: regiones_cat present but ignored
- **WHEN** `dataset/regiones_cat.csv` exists on disk
- **THEN** no parser or transform module SHALL read it
- **AND** `REGIONES.id_especial2` SHALL contain only slug values derived from `regiones.csv` as defined in this specification

### Requirement: Per-build Catalan summary is emitted

After all transform steps complete, the pipeline SHALL emit a single summary line to stdout reporting Catalan ingestion health.

#### Scenario: Summary line printed at end of transform
- **WHEN** the transform completes successfully (zero or more `[catalan] WARN` lines emitted)
- **THEN** stdout SHALL contain a line of the form `[catalan] METADATA_CAT: <n> loaded, <d> dropped, <m> missing — DICCIONARIO_CAT: <n> loaded, <d> dropped — direction: <ok> mapped, <unk> unknown (NULL)`

#### Scenario: Summary present even when CAT files are absent
- **WHEN** the transform completes with `metadatos_agendas_cat.csv` and `diccionario_cat.csv` both missing
- **THEN** the summary line SHALL still be emitted with `0 loaded, 0 dropped, <m> missing` for both tables, where `<m>` equals the count of ES rows that lack a CAT translation

