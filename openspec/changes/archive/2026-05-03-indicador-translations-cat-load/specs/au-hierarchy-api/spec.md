## MODIFIED Requirements

### Requirement: AU hierarchy includes metadata and promedios

The endpoint SHALL enrich each indicator with metadata (`nombre`, `unidad`, `tipo`, `formula`, `direction`, `umbral_optimo`, `umbral_malo`, `fuente`, `actualizacion`) from `METADATA` and translation tables, and SHALL include `promedio_indice` for each objetivo and meta from `PROMEDIOS_AGENDAS` (using `id_dict` values prefixed `TARRAGONA-`).

#### Scenario: Indicator has metadata
- **WHEN** an indicator linked to a Tarragona meta has a row in `METADATA`
- **THEN** its `metadata` object SHALL include all available fields (`unidad`, `tipo`, `formula`, `direction`, `umbral_optimo`, `umbral_malo`, `fuente`, `actualizacion`)

#### Scenario: Direction enum surfaced
- **WHEN** an indicator's `METADATA.direction` is `'asc'`, `'desc'`, `'neutral'`, or `NULL`
- **THEN** its `metadata.direction` field SHALL contain the same value (string or `null`)

#### Scenario: Formula text retained for deprecation window
- **WHEN** an indicator has both `METADATA.formula` and `METADATA.direction` populated
- **THEN** the response SHALL include both `metadata.formula` (raw Spanish text) and `metadata.direction` (enum)

#### Scenario: Promedio available for objetivo
- **WHEN** `PROMEDIOS_AGENDAS` has a row for the municipio and the Tarragona objetivo `id_dict` (e.g. `TARRAGONA-3`)
- **THEN** the objetivo's `promedio_indice` SHALL be populated with the latest-period value

### Requirement: AU hierarchy supports language parameter

The endpoint SHALL accept an optional `lang` query parameter (`es` or `ca`) and return translated names from `DICCIONARIO_ES`/`DICCIONARIO_CAT` and `METADATA_ES`/`METADATA_CAT`. When `lang=ca`, the endpoint SHALL also serve a Catalan `unidad` whenever `METADATA_CAT.unidad` is non-NULL, falling back to `METADATA.unidad` otherwise.

#### Scenario: Catalan translations
- **WHEN** `lang=ca` is provided
- **THEN** dictionary names SHALL prefer `DICCIONARIO_CAT.nombre` over `DICCIONARIO_ES.nombre`
- **AND** metadata names SHALL prefer `METADATA_CAT.nombre` over `METADATA_ES.nombre`
- **AND** metadata descriptions SHALL prefer `METADATA_CAT.descripcion` over `METADATA_ES.descripcion`

#### Scenario: Catalan unidad override
- **WHEN** `lang=ca` is provided and `METADATA_CAT.unidad` is non-NULL for an indicator
- **THEN** `metadata.unidad` for that indicator SHALL contain the Catalan value

#### Scenario: Catalan unidad fallback
- **WHEN** `lang=ca` is provided and `METADATA_CAT.unidad` is `NULL` for an indicator
- **THEN** `metadata.unidad` for that indicator SHALL contain the Spanish value from `METADATA.unidad`

#### Scenario: Spanish lang ignores CAT.unidad
- **WHEN** `lang=es` (or `lang` is omitted)
- **THEN** `metadata.unidad` SHALL come from `METADATA.unidad` regardless of any value in `METADATA_CAT.unidad`
