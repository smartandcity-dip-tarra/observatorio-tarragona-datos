# Mode-aware navigation

## Purpose

Global visualization mode (ODS vs Agenda Urbana / Agenda Metropolitana de Tarragona) that drives navigation targets, header menus, and municipio detail routes across the app.
## Requirements
### Requirement: Toggle navigates between ODS and AU municipio pages
When the header toggle changes mode and the user is currently on a mode-specific municipio page, the system SHALL automatically navigate to the equivalent page in the other mode, preserving the `ine` parameter.

#### Scenario: Switching from ODS to AU while on an ODS municipio page
- **WHEN** the user is on `/muni/ods/<ine>`
- **AND** they switch the toggle to Agenda Urbana
- **THEN** the application navigates to `/muni/au/<ine>`

#### Scenario: Switching from AU to ODS while on an AU municipio page
- **WHEN** the user is on `/muni/au/<ine>`
- **AND** they switch the toggle to ODS
- **THEN** the application navigates to `/muni/ods/<ine>`

### Requirement: Toggle does not navigate when not on a municipio page
When the header toggle changes mode and the user is NOT on a mode-specific municipio page, the system SHALL only update the Pinia store — no navigation occurs.

#### Scenario: Switching mode from the home page
- **WHEN** the user is on `/` (or any page other than `/muni/ods/*` or `/muni/au/*`)
- **AND** they switch the toggle
- **THEN** `visualizationStore.setMode(...)` is called
- **AND** no route navigation takes place

#### Scenario: Switching mode from a non-municipio page
- **WHEN** the user is on `/ods` or `/metodologia`
- **AND** they switch the toggle
- **THEN** the store mode is updated
- **AND** the user stays on the current page

### Requirement: ODS municipio page syncs Pinia store mode on mount
The system SHALL set the visualization mode to `ODS` in `useVisualizationStore` when the ODS municipio page is mounted.

#### Scenario: Arriving at ODS page directly via URL
- **WHEN** a user navigates directly to `/muni/ods/<ine>`
- **THEN** `visualizationStore.setMode(VisualizationMode.ODS)` is called on mount
- **AND** the header toggle is in the ODS-on position

### Requirement: Homepage map section reacts to mode toggle

When the user toggles between ODS and Agenda Urbana while on the home route, the map section (objective selector, data fetches, zoom/emphasis, and beeswarm input) and the introductory hero text (caption, title, and description above the map) SHALL update to match the new mode immediately, with no route change.

#### Scenario: Switching to AU on home refreshes AU visualization

- **WHEN** the user is on `/`
- **AND** they switch the header toggle to Agenda Urbana
- **THEN** the visualization store SHALL reflect Agenda Urbana mode (same as other non-municipio pages)
- **AND** the home map SHALL apply AU bounding zoom, AUE emphasis, and AU choropleth data
- **AND** the home hero SHALL show Agenda Urbana (AUE) introductory copy for the active locale
- **AND** no navigation away from `/` SHALL occur

#### Scenario: Switching back to ODS on home restores ODS visualization

- **WHEN** the user is on `/` in AU mode
- **AND** they switch the header toggle to ODS
- **THEN** the home map SHALL restore province-wide default zoom behavior used for ODS home
- **AND** the ODS objective selector and ODS promedios layer SHALL be shown again
- **AND** the home hero SHALL show ODS introductory copy for the active locale

### Requirement: Toggle translates between ODS and AU goal routes for shared objectives
When the header toggle changes mode and the user is on a goal detail page whose objective number exists in both taxonomies (`1..6`, the overlap between ODS `1..17` and Tarragona `1..6`), the system SHALL navigate from `/ods/{n}` to `/au/{n}` or from `/au/{n}` to `/ods/{n}`, preserving locale prefix rules used elsewhere.

#### Scenario: Switching from ODS to Tarragona on ODS goal 5
- **WHEN** the user is on `/ods/5`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au/5`

#### Scenario: Switching from Tarragona to ODS on Tarragona goal 5
- **WHEN** the user is on `/au/5`
- **AND** they switch the toggle to ODS
- **THEN** the application SHALL navigate to `/ods/5`

### Requirement: Toggle from ODS goal with no AU counterpart leaves goal context
When the user is on `/ods/{n}` with `n > 6` and switches to Agenda Metropolitana de Tarragona, the system SHALL navigate to a safe AU hub route (`/au`) rather than an invalid objective page.

#### Scenario: Switching from ODS 7 to Tarragona mode
- **WHEN** the user is on `/ods/7`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au` (or equivalent hub), not `/au/7`

#### Scenario: Switching from ODS 15 to Tarragona mode
- **WHEN** the user is on `/ods/15`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au` (or equivalent hub), not `/au/15`

### Requirement: AU goal page syncs Pinia store mode on mount
The system SHALL set the visualization mode to Agenda Metropolitana de Tarragona when a Tarragona goal detail page (`/au/{n}`, `n` in `1..6`) is mounted. The header toggle label SHALL read "Agenda Metropolitana de Tarragona" (or its approved short form) when this mode is active.

#### Scenario: Arriving at Tarragona goal via URL
- **WHEN** a user navigates directly to `/au/3`
- **THEN** `visualizationStore.setMode(VisualizationMode.AU)` SHALL be called on mount
- **AND** the header toggle SHALL show Agenda Metropolitana de Tarragona as active (with the updated label)

### Requirement: ODS goal page syncs Pinia store mode on mount
The system SHALL set the visualization mode to ODS when an ODS goal detail page is mounted.

#### Scenario: Arriving at ODS goal via URL
- **WHEN** a user navigates directly to `/ods/8`
- **THEN** `visualizationStore.setMode(VisualizationMode.ODS)` SHALL be called on mount
- **AND** the header toggle SHALL show ODS as active

### Requirement: Header mode switch hidden on AU page for metropolitan aggregate INE

When the user is on the Agenda Urbana municipio detail route for INE `43` only, the global ODS / Agenda Urbana header switch SHALL NOT be shown.

#### Scenario: Metropolitan AU municipio page has no mode switch

- **WHEN** the user is on `/muni/au/43` (or the locale-prefixed equivalent)
- **THEN** the sticky header area SHALL NOT render the ODS / Agenda Urbana switch control
- **AND** other header elements (logo, nav, language) MAY render unchanged

#### Scenario: Other municipio pages still show the switch

- **WHEN** the user is on `/muni/au/<ine>` with `<ine>` not equal to `43`
- **THEN** the header mode switch SHALL remain available per existing requirements

### Requirement: Mode toggle cannot navigate to ODS municipio route for INE 43

When programmatic or residual interactions would navigate from an AU municipio page to `/muni/ods/<ine>` with `ine` equal to `43`, the system SHALL NOT perform that navigation to the ODS municipio URL; the supported detail experience for INE `43` is AU only.

#### Scenario: No ODS municipio target for aggregate INE

- **WHEN** a code path would set navigation target to `/muni/ods/43`
- **THEN** the application SHALL either omit that navigation or redirect to `/muni/au/43` per the metropolitan aggregate routing requirement
- **AND** the user SHALL not end on `/muni/ods/43` as a municipio detail page

