# au-hierarchy-api

## Purpose

Server endpoint that returns the Agenda Urbana / Agenda Metropolitana de Tarragona indicator hierarchy for a given municipio, mirroring the ODS hierarchy endpoint's response shape so the client can render the Seguimiento view uniformly.
## Requirements
### Requirement: AU hierarchy endpoint
The system SHALL expose `GET /api/au/indicadores` that returns the Agenda Metropolitana de Tarragona indicator hierarchy for a given municipio, using the same response shape as `OdsHierarchyResponse`. The endpoint SHALL source dimensions from `DICCIONARIO` rows with `agenda = 'TARRAGONA'` and SHALL no longer read `agenda = 'AUE'` rows.

#### Scenario: Successful hierarchy response
- **WHEN** client sends `GET /api/au/indicadores?codigo_ine=43148`
- **AND** the municipio exists in `REGIONES` with `id_especial3 = 'aue'`
- **THEN** the response SHALL contain `codigo_ine`, `nombre_municipio`, and an `objetivos` array
- **AND** each objetivo SHALL correspond to a `DICCIONARIO` entry with `agenda = 'TARRAGONA'` and `nivel = 1`
- **AND** the `objetivos` array SHALL contain at most 6 entries (one per Tarragona línea estratégica)
- **AND** each objetivo SHALL contain a `metas` array of `nivel = 2` entries whose `id_dict` starts with the parent objetivo's dimension (e.g. `TARRAGONA-1.2`, `TARRAGONA-1.3` under `TARRAGONA-1`)
- **AND** each meta SHALL contain an `indicadores` array with the latest-period values from `INDICADORES` for that municipio, linked via `ARQUITECTURA_L2`

#### Scenario: Municipio does not participate in AU
- **WHEN** client sends `GET /api/au/indicadores?codigo_ine=43001`
- **AND** the municipio exists but `id_especial3` is NOT `'aue'`
- **THEN** the endpoint SHALL return HTTP 404 with message `"Municipality does not participate in Agenda Metropolitana de Tarragona"`

#### Scenario: Missing codigo_ine parameter
- **WHEN** client sends `GET /api/au/indicadores` without `codigo_ine`
- **THEN** the endpoint SHALL return HTTP 400

#### Scenario: Municipio not found
- **WHEN** client sends `GET /api/au/indicadores?codigo_ine=99999`
- **AND** no matching row exists in `REGIONES`
- **THEN** the endpoint SHALL return HTTP 404 with message `"Municipality not found"`

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

### Requirement: AU hierarchy supports periodo filter
The endpoint SHALL accept an optional `periodo` query parameter to return indicator values for a specific period instead of the latest.

#### Scenario: Specific period requested
- **WHEN** `periodo=2022` is provided
- **THEN** indicator values SHALL be from `INDICADORES` where `periodo = 2022`

