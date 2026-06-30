## MODIFIED Requirements

### Requirement: Comparison series loading is user-driven

The system SHALL fetch historical series for comparison municipios only after the user selects one or more comparison municipios. The system SHALL NOT preload historical series for all possible comparison municipios in the prerendered primary municipio page payload. This requirement applies to both municipio ODS pages and municipio AU (Agenda Metropolitana) pages.

#### Scenario: Page loads without comparison selection

- **WHEN** a user opens a municipio ODS page or municipio AU page with no comparison municipios selected
- **THEN** the page does not request historical series for any non-primary municipio
- **AND** no comparison municipio historical series data is included in the primary page payload

#### Scenario: User selects a comparison municipio on ODS page

- **WHEN** the user selects a comparison municipio on a municipio ODS page
- **THEN** the system requests historical ODS series for that selected municipio
- **AND** the request uses the compact batch series endpoint (`/api/indicadores/series`) rather than one request per indicator

#### Scenario: User selects a comparison municipio on AU page

- **WHEN** the user selects a comparison municipio on a municipio AU page
- **AND** the selected municipio has `id_especial3 = 'aue'`
- **THEN** the system requests historical AU series for that selected municipio
- **AND** the request uses `/api/au/indicadores-series` rather than one request per indicator

### Requirement: Comparison filtering uses local batch data

Once a selected comparison municipio's batch series have been fetched, indicator picker/filter changes SHALL use the cached comparison series locally and SHALL NOT trigger new historical series requests solely because the visible indicator set changed. This requirement applies to both ODS and AU municipio comparison flows.

#### Scenario: User filters after comparison load on ODS page

- **WHEN** a comparison municipio's batch ODS series have already loaded
- **AND** the user changes the selected indicator filter on a municipio ODS page
- **THEN** the comparison list/dashboard updates from the cached comparison series
- **AND** no additional comparison historical series request is made solely because the visible indicator set changed

#### Scenario: User filters after comparison load on AU page

- **WHEN** a comparison municipio's batch AU series have already loaded
- **AND** the user changes the selected indicator filter on a municipio AU page
- **THEN** the comparison list/dashboard updates from the cached comparison series
- **AND** no additional comparison historical series request is made solely because the visible indicator set changed

### Requirement: Comparison cache reuses municipio-level series

The system SHALL cache comparison historical series at municipio granularity so removing and re-adding a previously loaded comparison municipio can reuse data during the active app session when available. Cached series for ODS and AU comparisons SHALL remain scoped to their respective batch endpoints and taxonomy indicator sets.

#### Scenario: User re-adds a loaded comparison municipio on AU page

- **WHEN** the user removes a comparison municipio and later selects the same AUE municipio again on a municipio AU page in the same app session
- **THEN** the system reuses the cached municipio AU series when it is still available
- **AND** the system does not issue duplicate `/api/au/indicadores-series` requests for data already present in the cache
