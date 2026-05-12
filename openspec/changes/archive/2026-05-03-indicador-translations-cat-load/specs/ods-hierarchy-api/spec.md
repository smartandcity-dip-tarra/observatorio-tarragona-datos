## MODIFIED Requirements

### Requirement: Language support

The system SHALL support an optional `lang` query parameter (`es` or `ca`) to select the language for indicator and dictionary names, descriptions, and units. Default is `es`. When `lang=ca`, the endpoint SHALL also serve a Catalan `unidad` whenever `METADATA_CAT.unidad` is non-NULL, falling back to `METADATA.unidad` otherwise.

#### Scenario: Spanish language (default)
- **WHEN** `lang` is omitted or set to `es`
- **THEN** names and descriptions SHALL come from `METADATA_ES` and `DICCIONARIO_ES`
- **AND** `metadata.unidad` SHALL come from `METADATA.unidad` regardless of any value in `METADATA_CAT.unidad`

#### Scenario: Catalan language with fallback
- **WHEN** `lang=ca` and a `METADATA_CAT` entry exists for an indicator
- **THEN** the Catalan name and description SHALL be used

#### Scenario: Catalan language without translation
- **WHEN** `lang=ca` and no `METADATA_CAT` entry exists for an indicator (or its `nombre`/`descripcion` fields are NULL)
- **THEN** the system SHALL fall back to the Spanish translation from `METADATA_ES`

#### Scenario: Catalan unidad override
- **WHEN** `lang=ca` and `METADATA_CAT.unidad` is non-NULL for an indicator
- **THEN** `metadata.unidad` for that indicator SHALL contain the Catalan value

#### Scenario: Catalan unidad fallback
- **WHEN** `lang=ca` and `METADATA_CAT.unidad` is `NULL` for an indicator
- **THEN** `metadata.unidad` for that indicator SHALL contain the Spanish value from `METADATA.unidad`

### Requirement: Indicator includes full metadata

Each indicator in the response SHALL include its value fields (`valor`, `indice`, `categoria`, `periodo`) and a `metadata` object with technical fields from the `METADATA` table.

#### Scenario: Complete indicator object
- **WHEN** an indicator is included in the response
- **THEN** it SHALL contain: `id_indicador`, `nombre`, `descripcion`, `valor`, `indice`, `categoria`, `periodo`, and `metadata` with fields: `unidad`, `tipo`, `formula`, `direction`, `umbral_optimo`, `umbral_malo`, `fuente`, `actualizacion`

#### Scenario: Direction enum surfaced
- **WHEN** an indicator's `METADATA.direction` is `'asc'`, `'desc'`, `'neutral'`, or `NULL`
- **THEN** its `metadata.direction` field SHALL contain the same value (string or `null`)

#### Scenario: Formula text retained for deprecation window
- **WHEN** an indicator has both `METADATA.formula` and `METADATA.direction` populated
- **THEN** the response SHALL include both `metadata.formula` (raw Spanish text) and `metadata.direction` (enum)
