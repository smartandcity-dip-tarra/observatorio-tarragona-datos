# ods-hierarchy-api

## Purpose

Expose the ODS (2030 Agenda) indicator hierarchy for a municipality as nested objetivos, metas, and indicadores for the Nuxt municipio views.
## Requirements
### Requirement: Endpoint returns ODS hierarchy for a municipality
The system SHALL expose `GET /api/ods/indicadores` which returns the ODS indicator hierarchy for a given municipality, structured as Objetivo -> Metas -> Indicadores.

#### Scenario: Successful request with all ODS
- **WHEN** a GET request is made to `/api/ods/indicadores?codigo_ine=43001`
- **THEN** the response SHALL contain a JSON object with `codigo_ine`, `nombre_municipio`, and an `objetivos` array containing all 17 ODS objectives that have indicators for that municipality

#### Scenario: Each objetivo contains nested metas
- **WHEN** the response includes an objetivo (e.g., `2030-1`)
- **THEN** it SHALL contain `id`, `nombre`, `logo`, and a `metas` array with the meta entries (nivel 2) that belong to that objective

#### Scenario: Each meta contains its indicators
- **WHEN** the response includes a meta (e.g., `2030-1.1`)
- **THEN** it SHALL contain `id`, `nombre`, and an `indicadores` array with indicators linked to that meta via `ARQUITECTURA_L2`

### Requirement: codigo_ine parameter is required
The system SHALL require the `codigo_ine` query parameter and return an error if it is missing or invalid.

#### Scenario: Missing codigo_ine
- **WHEN** a GET request is made to `/api/ods/indicadores` without `codigo_ine`
- **THEN** the response SHALL be HTTP 400 with message "Missing required query parameter: codigo_ine"

#### Scenario: Invalid codigo_ine
- **WHEN** a GET request is made with a `codigo_ine` that does not exist in `REGIONES`
- **THEN** the response SHALL be HTTP 404 with message "Municipality not found"

### Requirement: Filter by ODS objetivo
The system SHALL support an optional `objetivo` query parameter (integer 1-17) to filter the response to a single ODS objective.

#### Scenario: Single objetivo filter
- **WHEN** a GET request includes `objetivo=5`
- **THEN** the `objetivos` array SHALL contain only the objective `2030-5` (if it has indicators for the municipality)

#### Scenario: Invalid objetivo value
- **WHEN** a GET request includes `objetivo=0` or `objetivo=18` or a non-integer
- **THEN** the response SHALL be HTTP 400 with message "Parameter 'objetivo' must be an integer between 1 and 17"

#### Scenario: No objetivo parameter returns all
- **WHEN** a GET request omits the `objetivo` parameter
- **THEN** the response SHALL include all ODS objectives (1-17) that have indicators for the municipality

### Requirement: Filter by periodo
The system SHALL support an optional `periodo` query parameter to filter indicator values to a specific year. When omitted, the most recent period per indicator SHALL be used.

#### Scenario: Default to latest period
- **WHEN** a GET request omits the `periodo` parameter and an indicator has values for periods 2021 and 2023
- **THEN** the indicator SHALL appear with `periodo: 2023` and the corresponding value

#### Scenario: Explicit period filter
- **WHEN** a GET request includes `periodo=2021`
- **THEN** only indicator values from period 2021 SHALL be included; indicators without data for 2021 SHALL be omitted

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

### Requirement: Multi-ODS indicators appear under each linked meta
An indicator that is linked to multiple ODS metas via `ARQUITECTURA_L2` SHALL appear under each meta it belongs to.

#### Scenario: Indicator in two ODS objectives
- **WHEN** indicator 54 is linked to `2030-5.2` and `2030-8.5` via `ARQUITECTURA_L2`
- **THEN** indicator 54 SHALL appear in the `indicadores` array of both meta `2030-5.2` (under objetivo `2030-5`) and meta `2030-8.5` (under objetivo `2030-8`)

### Requirement: Empty objectives and metas are omitted
Objectives or metas that have no indicators for the given municipality (or for the filtered period) SHALL NOT appear in the response.

#### Scenario: Objetivo without indicators
- **WHEN** no indicator for `2030-14` has a value for the requested municipality
- **THEN** objetivo `2030-14` SHALL NOT appear in the `objetivos` array

#### Scenario: Meta without indicators
- **WHEN** meta `2030-1.2` has no linked indicators with values for the municipality
- **THEN** meta `2030-1.2` SHALL NOT appear in the `metas` array of objetivo `2030-1`

### Requirement: Objetivos and metas include promedio_indice
Each objetivo and each meta in the response SHALL include a `promedio_indice` field (number or null). The value SHALL be the aggregate average index for that ODS dimension and the requested municipality, from the `PROMEDIOS_ODS` table (column `valor` for the matching `id_dict` and `codigo_ine`). If no row exists for that dimension and municipality, `promedio_indice` SHALL be null.

#### Scenario: Objetivo has promedio_indice
- **WHEN** the response includes an objetivo (e.g. `2030-5`) and `PROMEDIOS_ODS` contains a row for that `id_dict` and the requested `codigo_ine`
- **THEN** that objetivo SHALL include `promedio_indice` with the numeric `valor` from that row

#### Scenario: Meta has promedio_indice
- **WHEN** the response includes a meta (e.g. `2030-5.2`) and `PROMEDIOS_ODS` contains a row for that `id_dict` and the requested `codigo_ine`
- **THEN** that meta SHALL include `promedio_indice` with the numeric `valor` from that row

#### Scenario: No promedio row
- **WHEN** there is no `PROMEDIOS_ODS` row for a given objetivo or meta `id_dict` and the requested `codigo_ine`
- **THEN** that objetivo or meta SHALL include `promedio_indice: null`

