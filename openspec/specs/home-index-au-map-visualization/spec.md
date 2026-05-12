# home-index-au-map-visualization

## Purpose

Home page rendering in Agenda Urbana / Agenda Metropolitana de Tarragona mode: objective selector, aggregate choropleth from AU promedios, and beeswarm views restricted to participating municipios.
## Requirements
### Requirement: AU objective selector on home

When the visualization store mode is Agenda Metropolitana de Tarragona, the homepage SHALL show a Tarragona línea-estratégica selector in place of the ODS objective selector, using labels and colors from the Tarragona taxonomy (provided by `tarragona-metropolitan-taxonomy`; `objetivos_agenda` is now the 6-entry re-export of that taxonomy).

#### Scenario: Selector shows the 6 Tarragona líneas

- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **THEN** the selector SHALL expose exactly 6 options with `id` in `1..6`
- **AND** each option SHALL use the label and color from the Tarragona taxonomy module

#### Scenario: Selector switches Tarragona objective

- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **AND** they choose a different línea estratégica in the selector
- **THEN** subsequent fetches for map and beeswarm data SHALL use that objective id as the query parameter to `/api/au/promedios`
- **AND** the visible active objective styling SHALL match the selected línea color

### Requirement: Map zoom and emphasis for AUE municipios

When the store mode is AU, the home map SHALL fit the viewport to the geographic union of all municipios whose `id_especial3` value is `aue` (as returned by the municipios list API), and SHALL de-emphasize fills for all other municipios while leaving the full provincial GeoJSON in place.

#### Scenario: Bounding zoom for AUE set

- **WHEN** the home page renders the map in AU mode and GeoJSON is loaded
- **THEN** `MapTarragona` SHALL receive a `zoomRegion` array containing every INE with `id_especial3 === 'aue'`
- **AND** the computed view SHALL be the bounding region that contains those features (with existing padding behavior)

#### Scenario: Non-AUE municipios faded

- **WHEN** the home page map is in AU mode
- **THEN** municipios not in the AUE INE set SHALL use reduced fill opacity consistent with existing `fadeUnselected` / emphasis behavior
- **AND** AUE municipios with a choropleth value SHALL use the full opacity and color scale for the active AU objective

### Requirement: Non-AUE municipios ignore hover and click on the home map in AU mode

When the store mode is AU, pointer interaction with a municipality whose INE is not in the AUE set SHALL NOT show the map tooltip, SHALL NOT emit hover-driven highlight updates used for map/beeswarm sync, and SHALL NOT update the homepage’s selected municipio state.

#### Scenario: Hover on faded municipio does nothing

- **WHEN** the user moves the pointer over a non-AUE municipality on the home map in AU mode
- **THEN** the map SHALL NOT display its value tooltip for that municipality
- **AND** `highlightedIne` from the map SHALL NOT change to that INE (any prior highlight from an AUE municipio SHALL clear when leaving that AUE region per normal `mouseleave` behavior)

#### Scenario: Click on faded municipio ignored

- **WHEN** the user clicks a non-AUE municipality on the home map in AU mode
- **THEN** `selectedIne` SHALL remain unchanged
- **AND** no navigation SHALL occur

#### Scenario: Hover and click on AUE municipio behave as today

- **WHEN** the user hovers or clicks an AUE municipality on the home map in AU mode
- **THEN** tooltip and `update:highlightedIne` SHALL behave like the existing ODS home map for that INE
- **AND** a click SHALL update selection per existing emit-mode behavior

### Requirement: AUE-only municipio combobox on home

When the store mode is AU, the homepage municipio search/combobox SHALL list only municipios with `id_especial3 === 'aue'`.

#### Scenario: Combobox items are AUE only

- **WHEN** the user opens the municipio selector on `/` in AU mode
- **THEN** every option SHALL have `id_especial3 === 'aue'` according to the municipios list API

#### Scenario: Invalid selection cleared when entering AU mode

- **WHEN** the store switches to AU mode and the previously selected INE is not in the AUE set
- **THEN** the homepage SHALL clear the selected municipio so the combobox shows no invalid selection

### Requirement: Beeswarm shows only AUE municipios on home

When the store mode is AU, the homepage beeswarm SHALL include datapoints only for municipios in the AUE INE set **excluding** the synthetic aggregate INE `43` from dot `datapoints` (still omitting rows without a numeric value for the active objective, consistent with the ODS layer). When the AU promedios response includes a numeric value for INE `43`, the homepage SHALL pass that value to `BeeswarmChart` via `referenceLines` per `beeswarm-reference-lines`, using an appropriate display `label` for the aggregate.

#### Scenario: No dots for non-AUE municipios

- **WHEN** the homepage beeswarm renders in AU mode
- **THEN** no dot SHALL represent a municipio whose `id_especial3` is not `aue`
- **AND** AUE municipios with a null or missing promedio for the selected objective SHALL still be omitted from the plot like the ODS beeswarm omits null `valor`

#### Scenario: Aggregate INE 43 is not a dot in AU home beeswarm

- **WHEN** the homepage beeswarm renders in AU mode
- **AND** the AU promedios payload includes a finite value for INE `43`
- **THEN** no beeswarm dot SHALL use `codigoIne` `43`
- **AND** the chart SHALL receive `referenceLines` that include that aggregate value with a user-facing `label`

#### Scenario: No reference line when 43 is missing

- **WHEN** the homepage beeswarm renders in AU mode
- **AND** there is no usable numeric value for INE `43` in the active objective data
- **THEN** the chart SHALL omit any `referenceLines` entry for `43` (empty array or absent prop)

### Requirement: MapWrapper parent-controlled zoom region

`MapWrapper` SHALL accept an optional prop that supplies a list of INEs to pass as `zoomRegion` to `MapTarragona`. When that prop is set, the wrapper SHALL not rely solely on the internal Camp de Tarragona toggle for home-page AU zoom.

#### Scenario: Override zoom region on home

- **WHEN** the parent passes a non-empty INE list for AU bounding zoom
- **THEN** `MapTarragona` SHALL receive that list as `zoomRegion`
- **AND** pages that omit the prop SHALL keep the previous default behavior

### Requirement: Choropleth and beeswarm use AU promedios on home

When the store mode is AU, map fill values, legend stops, homogeneous reference year (when applicable), and beeswarm datapoints on the homepage SHALL be derived from `/api/au/promedios` for the selected objective, scoped to AUE municipios for beeswarm dot rows and selection as specified above. The aggregate INE `43` value MAY still be read from the same payload for `referenceLines` and for map styling if the map layer includes that INE independently of dot simulation.

#### Scenario: Map and beeswarm stay in sync in AU mode

- **WHEN** the user changes the selected AU objective or municipio selection on `/` in AU mode
- **THEN** map shading and beeswarm positions SHALL reflect the same underlying AU promedio rows for AUE municipios
- **AND** highlighted and selected INE behavior SHALL match the existing home interaction patterns among AUE municipios only

#### Scenario: Non-AUE municipios use no-data fill

- **WHEN** the home page is in AU mode
- **THEN** the choropleth value layer SHALL include only AUE municipios
- **AND** non-AUE municipios SHALL use the same fill as missing data (e.g. white), not the active objective color scale, even if the API returned a row for that INE

### Requirement: MapTarragona optional interaction INE allowlist

`MapTarragona` SHALL support an optional prop listing INEs that are eligible for tooltip, hover highlight emission, pointer cursor, and region click. When the prop is unset or empty, all municipios remain interactive as before.

#### Scenario: Non-listed INEs skip hover UI

- **WHEN** the prop is a non-empty INE list and the pointer is over a municipio not in that list
- **THEN** the map SHALL not show the value tooltip for that municipio
- **AND** it SHALL not emit `update:highlightedIne` for that hover

#### Scenario: Omitted prop preserves legacy behavior

- **WHEN** the prop is omitted
- **THEN** every municipio path SHALL behave as before this capability for hover, tooltip, and click

### Requirement: Home AU mode uses Tarragona copy

When the visualization store mode is Agenda Metropolitana de Tarragona, user-facing copy on the home page (mode title, selector heading, map legend prefix, page meta title segment) SHALL read "Agenda Metropolitana de Tarragona" (or its short form "Tarragona" / "Líneas Estratégicas" where space is constrained). No user-facing text on the home page SHALL refer to "Agenda Urbana Española" or "AUE" after the migration.

#### Scenario: Home mode heading is Tarragona
- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **THEN** the mode heading SHALL contain "Agenda Metropolitana de Tarragona" (or its approved short form)
- **AND** SHALL NOT contain "Agenda Urbana" or "AUE"

