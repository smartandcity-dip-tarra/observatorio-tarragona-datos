# Municipio AU page

## Requirements

### Requirement: Agenda Urbana municipio detail page exists
The system SHALL provide a dedicated Agenda Urbana detail page at `/muni/au/[ine]` for each municipio, parallel to the existing ODS page at `/muni/ods/[ine]`.

#### Scenario: Navigating to a valid AU municipio page
- **WHEN** a user navigates to `/muni/au/<ine>` with a valid INE code
- **THEN** the page renders showing the municipio name and two tabs: "Seguimiento" and "Descriptivo"

#### Scenario: Navigating to an AU municipio page with an invalid INE code
- **WHEN** a user navigates to `/muni/au/<ine>` with an unrecognised INE code
- **THEN** the application throws a 404 error

### Requirement: AU page syncs Pinia store mode on mount
The system SHALL set the visualization mode to `AU` in `useVisualizationStore` when the Agenda Urbana municipio page is mounted, so the header toggle reflects the active mode.

#### Scenario: Arriving at AU page directly via URL
- **WHEN** a user navigates directly to `/muni/au/<ine>` (e.g. via a bookmark or shared link)
- **THEN** `visualizationStore.setMode(VisualizationMode.AU)` is called on mount
- **AND** the header toggle is in the ODS-off position (reflecting AU mode)

### Requirement: AU page has "Seguimiento" and "Descriptivo" tabs
The AU municipio page SHALL render two tabs — "Seguimiento" and "Descriptivo" — using a `UTabs` component, in the same structural pattern as the ODS page.

#### Scenario: Default tab on page load
- **WHEN** the AU municipio page loads
- **THEN** the "Seguimiento" tab is active by default

#### Scenario: Switching to "Descriptivo" tab
- **WHEN** a user clicks the "Descriptivo" tab
- **THEN** the `MunicipioAuDescriptivo` component is displayed
- **AND** the "Seguimiento" component is hidden

#### Scenario: Switching to "Seguimiento" tab
- **WHEN** a user clicks the "Seguimiento" tab
- **THEN** the `MunicipioAuSeguimiento` component is displayed
- **AND** the "Descriptivo" component is hidden

### Requirement: AU page fetches hierarchy data and renders header
The `app/pages/muni/au/[ine].vue` page SHALL fetch the AU hierarchy via `useAsyncData` calling `/api/au/indicadores` and pass the response to `MunicipioAuSeguimiento`. The page SHALL also fetch header metadata (`/api/municipios/{ine}/header`) to display population and comarca information, matching the ODS page header pattern.

#### Scenario: Page loads with AU data
- **WHEN** a user navigates to `/muni/au/43148`
- **AND** the municipio participates in AU
- **THEN** the page SHALL display the municipio name, population, and comarca in the header
- **AND** the Seguimiento tab SHALL receive the fetched AU hierarchy data

#### Scenario: Page loads for non-AU municipio
- **WHEN** a user navigates to `/muni/au/43001`
- **AND** the municipio does NOT have `id_especial3 = 'aue'`
- **THEN** the Seguimiento view SHALL display the API error gracefully (error alert from the 404 response)

#### Scenario: Tabs remain functional
- **WHEN** the page loads
- **THEN** the "Seguimiento" and "Descriptivo" tabs SHALL both be present and functional
- **AND** the default active tab SHALL be "Seguimiento"
