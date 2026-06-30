## ADDED Requirements

### Requirement: Compact batch endpoint for AU indicator series

The system SHALL provide `GET /api/au/indicadores-series` that returns compact historical Agenda Metropolitana (TARRAGONA taxonomy) indicator series for one or more requested municipios. The endpoint SHALL group rows by `codigo_ine` and `id_indicador` and SHALL represent each observation as a tuple ordered `[periodo, valor, indice]`. The response body SHALL include `framework: 'au'`.

#### Scenario: Request one AUE municipio series

- **WHEN** a client requests AU series for a valid `codigo_ine` of a municipio with `id_especial3 = 'aue'`
- **THEN** the response status is 200
- **AND** the response body contains a `series` object keyed by that `codigo_ine`
- **AND** each indicator entry contains an array of `[periodo, valor, indice]` tuples ordered by `periodo` ascending
- **AND** the response does not repeat indicator names, units, direction, or municipio code inside every tuple

#### Scenario: Request multiple AUE municipio series

- **WHEN** a client requests AU series for multiple valid AUE `codigo_ine` values in one request
- **THEN** the response status is 200
- **AND** the response body contains one grouped series object per requested municipio that has matching AU indicator rows
- **AND** each municipio group is independently keyed by `id_indicador`

### Requirement: Endpoint covers all AU taxonomy indicators for requested municipios

The batch endpoint SHALL return all historical `INDICADORES` rows for indicators mapped under the TARRAGONA agenda taxonomy (DICCIONARIO `agenda = 'TARRAGONA'`, nivel 2 metas via ARQUITECTURA_L2) for each requested municipio, rather than requiring the client to send the currently visible or filtered indicator ids.

#### Scenario: Client filters indicators locally

- **WHEN** a client has already fetched batch AU series for a municipio
- **AND** the user changes the indicator picker or filter on the municipio AU page
- **THEN** the client can filter the already returned municipio series locally
- **AND** no additional batch series request is required solely because the visible indicator set changed

### Requirement: Batch endpoint enforces AUE municipio participation

The batch endpoint SHALL reject requests for municipios that do not participate in Agenda Metropolitana de Tarragona (`id_especial3 !== 'aue'`), consistent with `/api/au/indicadores`.

#### Scenario: Non-AUE municipio requested

- **WHEN** a client requests AU series for a `codigo_ine` that exists in REGIONES but has `id_especial3` other than `aue`
- **THEN** the response status is 404
- **AND** the response indicates the municipio does not participate in Agenda Metropolitana de Tarragona

#### Scenario: Metropolitan aggregate municipio requested

- **WHEN** a client requests AU series for `codigo_ine = '43'` (Área Metropolitana de Tarragona aggregate)
- **AND** that row has `id_especial3 = 'aue'` in REGIONES
- **THEN** the response status is 200
- **AND** the response contains compact AU series for that INE when data exists

### Requirement: Batch endpoint validates request parameters

The batch endpoint SHALL validate municipio parameters before querying SQLite. Missing or empty municipio input SHALL return a 400 response.

#### Scenario: Missing municipio parameter

- **WHEN** a client requests `/api/au/indicadores-series` without any `codigo_ine` value
- **THEN** the response status is 400
- **AND** the response body or status message indicates that a municipio identifier is required

### Requirement: Batch endpoint uses read-only parameterized SQLite queries

The batch endpoint SHALL use the existing read-only server database access and SHALL pass all user-controlled values as bound parameters. The endpoint SHALL NOT require any SQLite index or schema change to function correctly.

#### Scenario: Parameterized batch query

- **WHEN** the handler filters by one or more `codigo_ine` values
- **THEN** those values are passed as prepared statement parameters
- **AND** user input is not interpolated directly into SQL text

#### Scenario: No index dependency

- **WHEN** the deployed SQLite database has no index on `INDICADORES(codigo_ine, id_indicador, periodo)`
- **THEN** the endpoint still returns correct compact AU series data

### Requirement: ODS batch endpoint remains unchanged

The system SHALL NOT change the contract or ODS-only behavior of `GET /api/indicadores/series`. AU historical series SHALL be served exclusively through `/api/au/indicadores-series`.

#### Scenario: ODS client requests existing endpoint

- **WHEN** a client requests `GET /api/indicadores/series` with a valid ODS municipio `codigo_ine`
- **THEN** the response continues to return `framework: 'ods'` and ODS 2030 taxonomy indicator histories
- **AND** no `framework` query parameter is required
