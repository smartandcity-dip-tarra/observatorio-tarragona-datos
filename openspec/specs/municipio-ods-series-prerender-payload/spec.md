# Municipio ODS series prerender payload

## Requirements

### Requirement: Primary municipio series included in prerender payload

The municipio ODS page SHALL load the primary municipio's full ODS historical indicator series through Nuxt async data so that prerendered pages can serialize this data into the static Nuxt payload.

#### Scenario: Prerendered municipio page loads primary series

- **WHEN** a prerendered municipio ODS page is generated for `/muni/ods/<codigo_ine>` or a localized equivalent
- **THEN** the page's Nuxt payload includes the primary municipio's compact ODS historical series
- **AND** the client can hydrate the list/dashboard trend and evolution data from that payload without making per-indicator runtime requests for the primary municipio

### Requirement: Client normalizes compact payload into existing series cache

The client SHALL decode compact `[periodo, valor, indice]` tuples into the existing normalized series shape used by charts, trend logic, and list/dashboard components.

#### Scenario: Compact tuples become chart-ready points

- **WHEN** the client receives compact series tuples for a municipio
- **THEN** the data layer stores them in the shared series cache keyed by municipio and indicator
- **AND** each cached point exposes `year`, `value`, and `indice` fields compatible with existing consumers

### Requirement: Ordinary page filtering does not trigger series fetches

After the primary municipio batch series has been loaded from the prerender payload, UI interactions that only change the visible indicator set SHALL filter locally and SHALL NOT fetch additional historical series for the primary municipio.

#### Scenario: User changes indicator picker on primary municipio

- **WHEN** a user changes the selected indicators on a hydrated municipio ODS page
- **AND** the primary municipio's batch series is already available from payload
- **THEN** the visible list/dashboard updates from local data
- **AND** no additional primary municipio historical series request is made solely because the indicator filter changed

### Requirement: Existing hierarchy payload remains the metadata source

The compact historical series payload SHALL NOT duplicate metadata already provided by the municipio ODS hierarchy response, including indicator names, units, direction, thresholds, descriptions, or latest values.

#### Scenario: UI renders metadata and series together

- **WHEN** the municipio ODS page renders an indicator row or chart
- **THEN** indicator labels, units, thresholds, and latest values come from the hierarchy data
- **AND** historical chart/trend points come from the normalized compact series cache
