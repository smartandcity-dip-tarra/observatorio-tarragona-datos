# data-transformation

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Load regiones directly

The system SHALL load parsed `regiones.csv` records into the `REGIONES` table, mapping `codigo_ine` → `codigo_ine`, `nombre` → `nombre`, `poblacion` → `poblacion`, `id_poblacion` → `id_poblacion`, `id_especial` → `id_especial`, `id_especial3` → `id_especial3`, and mapping `id_especial2` through the slug function defined in the **Slug function for municipality typology labels** requirement before insert.

#### Scenario: Direct region loading
- **WHEN** `regiones.csv` contains 7 rows
- **THEN** the `REGIONES` table SHALL contain exactly 7 rows with matching data for all columns except `id_especial2` which SHALL contain slugs

#### Scenario: id_especial3 persisted unchanged
- **WHEN** a parsed region row has non-empty `id_especial3`
- **THEN** the corresponding `REGIONES` row SHALL store that value in `id_especial3` unchanged

### Requirement: regiones_cat is not ingested

The transform pipeline SHALL NOT read `dataset/regiones_cat.csv`. `REGIONES` SHALL be populated solely from `regiones.csv`. Human-readable typology strings for `id_especial2` SHALL not be stored in SQLite; consumers SHALL resolve display labels using the slug in `REGIONES.id_especial2` with locale-specific resources outside this table.

#### Scenario: regiones_cat present but ignored
- **WHEN** `dataset/regiones_cat.csv` exists on disk
- **THEN** no parser or transform module SHALL read it
- **AND** `REGIONES.id_especial2` SHALL contain only slug values derived from `regiones.csv` as defined in this change
