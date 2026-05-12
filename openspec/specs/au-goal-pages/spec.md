# AU goal pages

## Purpose

Per-objective pages under `/au/{n}` that render the Agenda Urbana / Agenda Metropolitana de Tarragona goal experience: map with layer selector, aggregate choropleth from promedios, and indicator beeswarms aligned with the selected objective/línea estratégica.
## Requirements
### Requirement: Dynamic routes for Agenda Urbana objectives 1–10
The system SHALL provide pages at `/au/1` through `/au/6` that render the Tarragona línea-estratégica experience: map with layer selector, aggregate choropleth from Tarragona promedios, and indicator beeswarms section aligned with that línea. The segment SHALL be a positive integer between 1 and 6; values outside that range (including the former AUE ids `7..10`) SHALL not render as a valid goal page.

#### Scenario: Valid objective renders
- **WHEN** a user requests `/au/5`
- **THEN** the page SHALL render with content scoped to Tarragona línea estratégica 5
- **AND** page metadata (title) SHALL include línea 5 in the active locale

#### Scenario: Invalid objective is rejected
- **WHEN** a user requests `/au/0`, `/au/7`, `/au/10`, `/au/11`, or a non-numeric segment
- **THEN** the application SHALL respond with a 404 or redirect per project convention
- **AND** no goal-scoped API calls SHALL be made with invalid objective numbers

### Requirement: AU goal pages are limited to AUE municipalities
All map values, beeswarm datapoints, municipio naming, and selection targets used for the Tarragona goal experience SHALL be restricted to municipalities where `id_especial3` equals `aue` in the municipios catalog (the flag remains named `aue` in the database for URL stability; it identifies the metropolitan Tarragona subset). Non-participating municipalities SHALL not appear as interactive map targets for this page and SHALL not contribute beeswarm points.

#### Scenario: Beeswarm excludes non-participating municipios
- **WHEN** promedios or indicator values include a row for a municipio whose `id_especial3` is not `aue`
- **THEN** that row SHALL be excluded from beeswarm and map value aggregation on the goal page

### Requirement: AU goal map uses AUE-focused viewport
On Tarragona goal pages, the map SHALL apply the same class of viewport and emphasis behaviour used on the home page in Agenda Metropolitana de Tarragona mode: the view is focused on the metropolitan Tarragona municipio set and non-participating territory is not treated as part of the interactive "zoomed" exploration region (implementation MAY reuse the same map props as the home map).

#### Scenario: Map does not emphasize province-wide interaction for non-participating municipios
- **WHEN** the user views a Tarragona goal page
- **THEN** the map SHALL be constrained or emphasized such that only the metropolitan subset matches the focused exploration pattern
- **AND** clicking or hovering outside that policy SHALL not select non-participating municipios

### Requirement: AU objective indicator catalog API
The system SHALL expose an HTTP API that returns the ordered list of indicator metadata (id, name, unit) for a given Tarragona línea estratégica `n` (`1..6`), analogous to `GET /api/ods/objetivo-indicadores`, so goal pages can populate the indicator layer selector without embedding SQL in the client.

#### Scenario: Client requests indicators for objective 3
- **WHEN** a client calls the objective-indicadores endpoint with `objetivo=3` and a supported `lang`
- **THEN** the response SHALL include all indicators linked to Tarragona línea 3 in canonical order
- **AND** invalid `objetivo` values (including `7..10`) SHALL yield a 400 error

### Requirement: Indicator layer values reuse global valores API
When a Tarragona goal page selects a non-aggregate indicator layer, it SHALL load latest values via the same indicator valores endpoint used by ODS goal pages (`/api/indicadores/valores` with `indicator_id`), then apply the metropolitan-Tarragona municipio filter client-side for display.

#### Scenario: Per-indicator map layer on Tarragona page
- **WHEN** the user selects a specific indicator on a Tarragona goal page
- **THEN** the map and beeswarms SHALL reflect latest valores for that indicator restricted to metropolitan-Tarragona municipios

### Requirement: Static generation includes AU goal routes
Static generation SHALL include prerendered output for `/au/1` … `/au/6` (and the `/au` hub route) so deployed static hosting can serve these URLs. Static generation SHALL NOT emit pages for `/au/7` … `/au/10` anymore.

#### Scenario: Generate builds AU pages
- **WHEN** the static build runs
- **THEN** generated artifacts SHALL exist for each `/au/{n}` for `n` in `1..6` and for the `/au` hub per project convention
- **AND** no prerendered HTML SHALL be produced for `/au/{n}` with `n` in `7..10`

### Requirement: Explore municipio respects visualization mode
The Tarragona goal page SHALL offer navigation to the municipio detail path that matches the current visualization mode (`/muni/au/{ine}` when mode is Tarragona), consistent with the existing ODS goal page behaviour.

#### Scenario: User opens municipio from Tarragona goal page
- **WHEN** the user chooses to explore a selected metropolitan-Tarragona municipio from a Tarragona goal page in Tarragona mode
- **THEN** the application SHALL navigate to `/muni/au/{ine}`

