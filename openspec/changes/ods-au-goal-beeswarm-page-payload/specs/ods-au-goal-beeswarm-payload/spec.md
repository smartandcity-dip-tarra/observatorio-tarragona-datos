## ADDED Requirements

### Requirement: ODS and AU goal pages expose beeswarm valores via page payload

The system SHALL load, during server render and prerender, all indicator “latest valores” data required by the indicator beeswarm gallery on each ODS goal page (`/ods/:objetivo`) and AU goal page (`/au/:objetivo`) using a single page-scoped async data entry (for example `useAsyncData`) whose result is included in the Nuxt payload for that route.

#### Scenario: Prerendered ODS goal page

- **WHEN** a prerendered ODS goal page is generated for a valid `objetivo`
- **THEN** the payload for that route includes the combined latest-valores dataset for every indicator listed in the page catalog for that goal without each gallery chart issuing its own `useFetch` to `/api/indicadores/valores` for that indicator

#### Scenario: Prerendered AU goal page

- **WHEN** a prerendered AU goal page is generated for a valid AU `objetivo`
- **THEN** the payload for that route includes the combined latest-valores dataset for every gallery indicator for that goal without per-chart independent fetches to `/api/indicadores/valores` for those indicators

### Requirement: Beeswarm gallery component consumes preloaded rows

The `OdsGoalIndicatorBeeswarm` component SHALL accept the latest-valores rows (or equivalent) via props for the ODS and AU goal gallery use case and SHALL render the same chart and empty states as when data was loaded internally, without requiring a component-level `useFetch` for `/api/indicadores/valores` on those pages.

#### Scenario: Chart receives rows from parent

- **WHEN** the parent page supplies rows for a given `indicatorId`
- **THEN** the beeswarm chart uses those rows to build datapoints and reference lines according to existing props (`ineAllowlist`, `showMetropolitanAggregateReference`, etc.) and does not fetch `/api/indicadores/valores` for that indicator on initial load of a prerendered page
