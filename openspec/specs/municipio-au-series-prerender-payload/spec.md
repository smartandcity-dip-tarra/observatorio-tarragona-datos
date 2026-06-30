# Municipio AU series prerender payload

## Requirements

### Requirement: Primary municipio AU series included in prerender payload

The municipio AU page SHALL load the primary municipio's full AU historical indicator series through Nuxt async data calling `/api/au/indicadores-series` so that prerendered pages can serialize this data into the static Nuxt payload.

#### Scenario: Prerendered AUE municipio page loads primary series

- **WHEN** a prerendered municipio AU page is generated for `/muni/au/<codigo_ine>` or a localized equivalent
- **AND** the municipio participates in Agenda Metropolitana (`id_especial3 = 'aue'`)
- **THEN** the page's Nuxt payload includes the primary municipio's compact AU historical series
- **AND** the client can hydrate list/dashboard trend data from that payload without making per-indicator runtime requests for the primary municipio

### Requirement: Client normalizes compact AU payload into existing series cache

The client SHALL decode compact `[periodo, valor, indice]` tuples from AU batch responses into the existing normalized series shape used by charts, trend logic, and list/dashboard components.

#### Scenario: Compact AU tuples become chart-ready points

- **WHEN** the client receives compact AU series tuples for a municipio
- **THEN** the data layer stores them in the shared series cache keyed by municipio and indicator
- **AND** each cached point exposes `year`, `value`, and `indice` fields compatible with existing consumers

### Requirement: Ordinary AU page filtering does not trigger series fetches

After the primary municipio's AU batch series has been loaded from the prerender payload, UI interactions that only change the visible indicator set on the municipio AU page SHALL filter locally and SHALL NOT fetch additional historical series for the primary municipio.

#### Scenario: User changes indicator picker on primary AU municipio

- **WHEN** a user changes the selected indicators on a hydrated municipio AU page
- **AND** the primary municipio's AU batch series is already available from payload
- **THEN** the visible list/dashboard updates from local data
- **AND** no additional primary municipio historical series request is made solely because the indicator filter changed

### Requirement: AU hierarchy payload remains the metadata source

The compact AU historical series payload SHALL NOT duplicate metadata already provided by `/api/au/indicadores`, including indicator names, units, direction, thresholds, descriptions, or latest values.

#### Scenario: AU UI renders metadata and series together

- **WHEN** the municipio AU page renders an indicator row or chart
- **THEN** indicator labels, units, thresholds, and latest values come from the AU hierarchy data
- **AND** historical chart/trend points come from the normalized compact series cache

### Requirement: AU indicator panel uses shared series cache

The municipio AU seguimiento view SHALL pass evolution series from the shared cache into `MunicipioOdsIndicadoresPanel` so opening the slideover does not fetch `/api/indicadores/valores` when batch data is already available.

#### Scenario: User opens indicator panel on hydrated AU page

- **WHEN** a user opens the indicator slideover panel for an indicator on a municipio AU page
- **AND** that indicator's historical series is already present in the shared cache from batch payload or batch fetch
- **THEN** the panel evolution chart renders from the cached series
- **AND** no `/api/indicadores/valores` request is made for that evolution chart

### Requirement: AU series prerender routes cover AUE municipios only

The build SHALL prerender `/api/au/indicadores-series` only for municipios that participate in Agenda Metropolitana (`id_especial3 = 'aue'`), including metropolitan aggregate INE `43`, and SHALL NOT prerender AU series for every province INE in the ODS municipio list.

#### Scenario: Build prerender route list

- **WHEN** the static site is generated
- **THEN** nitro prerender includes `/api/au/indicadores-series?codigo_ine=<ine>` for each AUE municipio
- **AND** the prerender route count for AU series is not equal to the full province `codigos_ine` list used for ODS series prerender
