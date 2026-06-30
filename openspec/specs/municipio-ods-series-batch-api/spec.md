# Municipio ODS series batch API

## Requirements

### Requirement: Compact batch endpoint for ODS indicator series

The system SHALL provide a server API endpoint that returns compact historical ODS indicator series for one or more requested municipios. The endpoint SHALL group rows by `codigo_ine` and `id_indicador` and SHALL represent each observation as a tuple ordered `[periodo, valor, indice]`.

#### Scenario: Request one municipio series

- **WHEN** a client requests ODS series for a valid `codigo_ine`
- **THEN** the response status is 200
- **AND** the response body contains a `series` object keyed by that `codigo_ine`
- **AND** each indicator entry contains an array of `[periodo, valor, indice]` tuples ordered by `periodo` ascending
- **AND** the response does not repeat indicator names, units, direction, or municipio code inside every tuple

#### Scenario: Request multiple municipio series

- **WHEN** a client requests ODS series for multiple valid `codigo_ine` values
- **THEN** the response status is 200
- **AND** the response body contains one grouped series object per requested municipio that has matching ODS indicator rows
- **AND** each municipio group is independently keyed by `id_indicador`

### Requirement: Endpoint covers all ODS indicators for requested municipios

The batch endpoint SHALL return all historical `INDICADORES` rows for indicators mapped under the ODS 2030 taxonomy for each requested municipio, rather than requiring the client to send the currently visible or filtered indicator ids.

#### Scenario: Client filters indicators locally

- **WHEN** a client has already fetched batch ODS series for a municipio
- **AND** the user changes the indicator picker/filter
- **THEN** the client can filter the already returned municipio series locally
- **AND** no additional batch series request is required solely because the visible indicator set changed

### Requirement: Batch endpoint validates request parameters

The batch endpoint SHALL validate municipio parameters before querying SQLite. Missing or empty municipio input SHALL return a 400 response.

#### Scenario: Missing municipio parameter

- **WHEN** a client requests the batch endpoint without any municipio identifier
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
- **THEN** the endpoint still returns correct compact series data
