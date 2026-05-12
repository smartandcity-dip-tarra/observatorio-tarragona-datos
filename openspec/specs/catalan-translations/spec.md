# catalan-translations Specification

## Purpose

Catalan CSV ingestion, sparse `METADATA_CAT.unidad` overrides, `formula`→`direction` mapping, and warn-and-fall-back integrity rules for the SQLite build and API `lang=ca` behaviour.

## Requirements
### Requirement: Catalan translation source files

The data ingestion pipeline SHALL recognize three Google Sheets tabs as the canonical sources of Catalan translations: `regiones_cat`, `diccionario_cat`, and `metadatos_agendas_cat`. The download step SHALL fetch all three into `dataset/regiones_cat.csv`, `dataset/diccionario_cat.csv`, and `dataset/metadatos_agendas_cat.csv`. Of these, only `diccionario_cat.csv` and `metadatos_agendas_cat.csv` SHALL be ingested into the database; `regiones_cat.csv` SHALL be retained on disk but ignored by the transform step. English translation sheets (`metadatos_agendas_en`, `diccionario_en`) SHALL be specified and tested under the `english-translations` capability, not under this specification.

#### Scenario: All three CAT csvs downloaded
- **WHEN** `pullAndBuild/download_and_build.py` runs successfully
- **THEN** `dataset/regiones_cat.csv`, `dataset/diccionario_cat.csv`, and `dataset/metadatos_agendas_cat.csv` SHALL exist on disk

#### Scenario: regiones_cat is intentionally not ingested
- **WHEN** the transform pipeline runs
- **THEN** `REGIONES` SHALL be populated solely from `regiones.csv`
- **AND** no parser SHALL read `regiones_cat.csv`

### Requirement: Warn-and-fall-back integrity policy for Catalan data

The transform pipeline SHALL never exit with a non-zero status because of Catalan-translation problems. Every Catalan-related warning SHALL be emitted to stdout with the stable prefix `[catalan]` so it is greppable in CI logs. The COALESCE-based fallback to Spanish in API queries SHALL remain the safety net for missing or invalid Catalan rows.

#### Scenario: Missing CAT file does not fail the build
- **WHEN** `dataset/diccionario_cat.csv` or `dataset/metadatos_agendas_cat.csv` is absent at transform time
- **THEN** the transform SHALL emit `[catalan] WARN: <file> not found — Catalan tables left empty`
- **AND** the transform SHALL continue and exit 0
- **AND** the corresponding CAT table (`DICCIONARIO_CAT` or `METADATA_CAT`) SHALL be created but contain no rows

#### Scenario: CAT row referencing unknown id is dropped
- **WHEN** `metadatos_agendas_cat.csv` contains a row whose `indicador` does not exist in `metadatos_agendas.csv`
- **THEN** the transform SHALL emit `[catalan] WARN: dropping CAT translation for unknown id <indicador>`
- **AND** that row SHALL NOT be inserted into `METADATA_CAT`
- **AND** the build SHALL continue

#### Scenario: ES indicator missing CAT translation
- **WHEN** `metadatos_agendas.csv` contains an indicator that has no corresponding row in `metadatos_agendas_cat.csv` (or its `nombre` is empty in CAT while non-empty in ES)
- **THEN** the transform SHALL emit `[catalan] WARN: missing CAT translation for <indicador>` (one log line per missing id)
- **AND** the build SHALL continue
- **AND** the API SHALL fall back to the Spanish translation via `COALESCE`

#### Scenario: Per-build summary line
- **WHEN** the transform completes
- **THEN** stdout SHALL contain a single line of the form `[catalan] METADATA_CAT: <n> loaded, <d> dropped, <m> missing — DICCIONARIO_CAT: <n> loaded, <d> dropped — direction: <ok> mapped, <unk> unknown (NULL)`

### Requirement: CAT clase column SHALL NOT influence classification

The `clase` column from `metadatos_agendas_cat.csv` SHALL be read only for an integrity comparison and SHALL NOT be written to any database column. Indicator classification (`METADATA.tipo`) SHALL continue to be derived exclusively from the Spanish `clase` column in `metadatos_agendas.csv` via the existing `normalizeTipo` mapping.

#### Scenario: CAT clase divergence does not propagate to METADATA.tipo
- **WHEN** an indicator has `clase = "Descriptivo AUE"` in `metadatos_agendas.csv` and `clase = "Descriptiu AUE"` in `metadatos_agendas_cat.csv`
- **THEN** `METADATA.tipo` SHALL contain only the value derived from the Spanish `clase` (e.g. `"descriptivo"`)
- **AND** no row anywhere in the database SHALL contain `"Descriptiu AUE"`

#### Scenario: CAT clase introducing a new tipo logs a warning
- **WHEN** the CAT `clase` column for an indicator maps to a `tipo` value that is absent from the ES csv (i.e. could not have come from translating any ES `clase`)
- **THEN** the transform SHALL emit `[catalan] WARN: CAT clase introduces unknown tipo <value> for indicator <id>`
- **AND** the build SHALL continue

### Requirement: Catalan unidad override is sparse

`METADATA_CAT.unidad` SHALL be written only when the Catalan `unidad` value is non-empty AND differs from the Spanish `unidad` value for the same indicator. When the Catalan and Spanish values are identical (or the Catalan value is empty), `METADATA_CAT.unidad` SHALL remain `NULL` and the API SHALL fall back to `METADATA.unidad` via `COALESCE`.

#### Scenario: Identical units stored as NULL
- **WHEN** indicator `D-1` has `unidad = "%"` in both `metadatos_agendas.csv` and `metadatos_agendas_cat.csv`
- **THEN** the row in `METADATA_CAT` for `D-1` SHALL have `unidad = NULL`

#### Scenario: Differing units stored as override
- **WHEN** indicator `227` has `unidad = "x1.000 mujeres"` in `metadatos_agendas.csv` and `unidad = "x1.000 dones"` in `metadatos_agendas_cat.csv`
- **THEN** the row in `METADATA_CAT` for `227` SHALL have `unidad = "x1.000 dones"`

#### Scenario: Empty CAT unidad falls back
- **WHEN** indicator `42` has `unidad = "plazas/habitante"` in ES and an empty `unidad` in CAT
- **THEN** the row in `METADATA_CAT` for `42` SHALL have `unidad = NULL`
- **AND** the transform SHALL NOT log a warning (empty CAT unidad is a valid "use ES" signal)

### Requirement: formula sentinel normalized to direction enum

The transform pipeline SHALL derive a `direction` value from the Spanish `formula` column using a curated mapping and store it in `METADATA.direction`. Recognized mappings SHALL include at minimum:

- `"↑ Ascendente (más = mejor)"` → `"asc"`
- `"↓ Descendente (menos = mejor)"` → `"desc"`
- empty / `NULL` → `NULL`

The original Spanish `formula` text SHALL continue to be stored in `METADATA.formula` unchanged for the deprecation window. The Catalan `formula` column SHALL NOT be stored anywhere; it is only validated against the Catalan equivalents of the recognized mappings (`"↑ Ascendent (més = millor)"` → `"asc"`, `"↓ Descendent (menys = millor)"` → `"desc"`).

#### Scenario: Recognized Spanish formula maps to direction
- **WHEN** an indicator has `formula = "↑ Ascendente (más = mejor)"` in `metadatos_agendas.csv`
- **THEN** `METADATA.direction` for that indicator SHALL be `"asc"`
- **AND** `METADATA.formula` SHALL retain the original Spanish text

#### Scenario: Empty formula maps to NULL direction
- **WHEN** an indicator has an empty or missing `formula` in `metadatos_agendas.csv`
- **THEN** `METADATA.direction` for that indicator SHALL be `NULL`

#### Scenario: Unknown Spanish formula sentinel logs warning
- **WHEN** an indicator's `formula` value is non-empty but not present in the recognized mapping
- **THEN** the transform SHALL emit `[catalan] WARN: unknown formula sentinel "<text>" for indicator <id> — direction = NULL`
- **AND** `METADATA.direction` for that indicator SHALL be `NULL`
- **AND** `METADATA.formula` SHALL retain the original text
- **AND** the build SHALL continue

#### Scenario: Unknown Catalan formula sentinel logs warning
- **WHEN** an indicator's CAT `formula` value is non-empty but not present in the recognized Catalan mapping
- **THEN** the transform SHALL emit `[catalan] WARN: unknown CAT formula sentinel "<text>" for indicator <id>`
- **AND** the build SHALL continue (CAT `formula` is not stored regardless)

