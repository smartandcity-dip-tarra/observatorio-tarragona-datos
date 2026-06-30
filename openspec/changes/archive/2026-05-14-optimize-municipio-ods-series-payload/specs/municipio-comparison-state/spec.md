## ADDED Requirements

### Requirement: Comparison series loading is user-driven
The system SHALL fetch historical series for comparison municipios only after the user selects one or more comparison municipios. The system SHALL NOT preload historical series for all possible comparison municipios in the prerendered primary municipio page payload.

#### Scenario: Page loads without comparison selection
- **WHEN** a user opens a municipio ODS page with no comparison municipios selected
- **THEN** the page does not request historical series for any non-primary municipio
- **AND** no comparison municipio historical series data is included in the primary page payload

#### Scenario: User selects a comparison municipio
- **WHEN** the user selects a comparison municipio
- **THEN** the system requests historical ODS series for that selected municipio
- **AND** the request uses the compact batch series endpoint rather than one request per indicator

### Requirement: Comparison filtering uses local batch data
Once a selected comparison municipio's ODS series have been fetched, indicator picker/filter changes SHALL use the cached comparison series locally and SHALL NOT trigger new historical series requests solely because the visible indicator set changed.

#### Scenario: User filters after comparison load
- **WHEN** a comparison municipio's batch ODS series has already loaded
- **AND** the user changes the selected indicator filter
- **THEN** the comparison list/dashboard updates from the cached comparison series
- **AND** no additional comparison historical series request is made solely because the visible indicator set changed

### Requirement: Comparison cache reuses municipio-level series
The system SHALL cache comparison historical series at municipio granularity so removing and re-adding a previously loaded comparison municipio can reuse data during the active app session when available.

#### Scenario: User re-adds a loaded comparison municipio
- **WHEN** the user removes a comparison municipio and later selects the same municipio again in the same app session
- **THEN** the system reuses the cached municipio series when it is still available
- **AND** the system does not issue duplicate batch requests for data already present in the cache
