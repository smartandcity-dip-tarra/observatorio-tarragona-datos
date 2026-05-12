# english-translations

## Purpose

English CSV ingestion for indicator metadata and agenda dictionary: `metadatos_agendas_en.csv` and `diccionario_en.csv` into `METADATA_EN` and `DICCIONARIO_EN`, with the same non-blocking integrity posture as Catalan (`warn`, continue, empty tables on missing files, API fallback via `COALESCE` when the app adds `lang=en`).

## ADDED Requirements

### Requirement: English translation source files

The data ingestion pipeline SHALL recognize two Google Sheets tabs as the canonical sources of English translations: `diccionario_en` and `metadatos_agendas_en`. The download step SHALL fetch them into `dataset/diccionario_en.csv` and `dataset/metadatos_agendas_en.csv`. Both files SHALL be ingested into the database when present.

#### Scenario: EN csvs downloaded with Catalan and Spanish sources
- **WHEN** `pullAndBuild/download_and_build.py` runs successfully
- **THEN** `dataset/diccionario_en.csv` and `dataset/metadatos_agendas_en.csv` SHALL exist on disk alongside the Spanish and Catalan CSVs

#### Scenario: EN files ingested into SQLite
- **WHEN** the transform pipeline runs with both EN files present and valid
- **THEN** `METADATA_EN` and `DICCIONARIO_EN` SHALL each contain the successfully validated rows per the alignment rules in this specification

### Requirement: Warn-and-fall-back integrity policy for English data

The transform pipeline SHALL never exit with a non-zero status solely because of English-translation problems. Every English-related warning SHALL be emitted to stdout with the stable prefix `[english]` so it is greppable in CI logs. Application-layer queries SHALL use `COALESCE` to fall back from English to Spanish (and Catalan where applicable) when this change is consumed by the API spec.

#### Scenario: Missing EN file does not fail the build
- **WHEN** `dataset/diccionario_en.csv` or `dataset/metadatos_agendas_en.csv` is absent at transform time
- **THEN** the transform SHALL emit `[english] WARN: <file> not found — English tables left empty`
- **AND** the transform SHALL continue and exit 0
- **AND** the corresponding EN table (`DICCIONARIO_EN` or `METADATA_EN`) SHALL exist but contain no rows

#### Scenario: EN row referencing unknown indicator id is dropped
- **WHEN** `metadatos_agendas_en.csv` contains a row whose `indicador` does not exist in `metadatos_agendas.csv`
- **THEN** the transform SHALL emit `[english] WARN: dropping EN translation for unknown id <indicador>`
- **AND** that row SHALL NOT be inserted into `METADATA_EN`
- **AND** the build SHALL continue

#### Scenario: ES indicator missing EN translation
- **WHEN** `metadatos_agendas.csv` contains an indicator that has no corresponding row in `metadatos_agendas_en.csv` (or its EN `nombre` is empty while ES `nombre` is non-empty)
- **THEN** the transform SHALL emit `[english] WARN: missing EN translation for <indicador>` (one log line per missing id)
- **AND** the build SHALL continue

#### Scenario: Per-build English summary line
- **WHEN** the transform completes
- **THEN** stdout SHALL contain a single line of the form `[english] METADATA_EN: <n> loaded, <d> dropped, <m> missing — DICCIONARIO_EN: <n> loaded, <d> dropped`

### Requirement: EN clase column SHALL NOT influence classification

The `clase` column from `metadatos_agendas_en.csv` SHALL be read only for an integrity comparison against the Spanish-derived semantic tipo and SHALL NOT be written to any database column. Indicator classification (`METADATA.tipo`) SHALL continue to be derived exclusively from the Spanish `clase` column in `metadatos_agendas.csv`.

#### Scenario: EN clase divergence does not propagate to METADATA.tipo
- **WHEN** an indicator has `clase = "Descriptivo AUE"` in `metadatos_agendas.csv` and a different `clase` string in `metadatos_agendas_en.csv`
- **THEN** `METADATA.tipo` SHALL still reflect only the Spanish `clase` mapping
- **AND** the `METADATA_EN` table schema SHALL define only `id_indicador`, `nombre`, `descripcion`, and `unidad` (no `clase` column)

### Requirement: English unidad override is sparse

`METADATA_EN.unidad` SHALL be written only when the English `unidad` value is non-empty AND differs from the Spanish `unidad` value for the same indicator. When the English and Spanish values are identical (or the English value is empty), `METADATA_EN.unidad` SHALL remain `NULL`.

#### Scenario: Identical units stored as NULL
- **WHEN** an indicator has the same non-empty `unidad` in `metadatos_agendas.csv` and `metadatos_agendas_en.csv`
- **THEN** the row in `METADATA_EN` for that indicator SHALL have `unidad = NULL`

#### Scenario: Differing units stored as override
- **WHEN** an indicator has a non-empty English `unidad` that differs from the Spanish `unidad`
- **THEN** the row in `METADATA_EN` for that indicator SHALL have `unidad` equal to the English value

### Requirement: EN formula column is not stored

The English `formula` column from `metadatos_agendas_en.csv` SHALL NOT be persisted in SQLite. When non-empty, it MAY be validated against recognized English equivalents of the same direction sentinels used for Catalan validation; unrecognized values SHALL log `[english] WARN` and SHALL NOT fail the build.

#### Scenario: EN formula not present in METADATA_EN
- **WHEN** a row in `metadatos_agendas_en.csv` contains a non-empty `formula`
- **THEN** no column in `METADATA_EN` SHALL store that formula text
