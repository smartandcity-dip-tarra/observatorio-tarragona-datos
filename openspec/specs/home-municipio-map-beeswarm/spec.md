# home-municipio-map-beeswarm

## ADDED Requirements

### Requirement: Unified municipio selection (home and ODS goal page)

On the homepage (`index.vue`) and on each ODS goal page (`/ods/{n}`), the municipio chosen in the combobox SHALL be the single source of truth for persistent selection. Clicking a municipality on the map or a dot in any beeswarm that participates in this flow SHALL update that same selection (same INE) as choosing the municipality in the combobox.

#### Scenario: Home map click selects municipio
- **WHEN** the user clicks a municipality path on the home map (with `MapWrapper` in selection emit mode)
- **THEN** the combobox value SHALL update to that municipality’s INE
- **AND** map and beeswarm highlighting SHALL reflect the selected municipio per existing highlight rules

#### Scenario: Home beeswarm dot click selects municipio
- **WHEN** the user clicks a dot in the home beeswarm with click-selection enabled
- **THEN** the combobox value SHALL update to that dot’s `codigoIne`
- **AND** map and beeswarm highlighting SHALL reflect the selected municipio

#### Scenario: ODS goal map click selects municipio
- **WHEN** the user clicks a municipality on the ODS goal page map (with `MapWrapper` in selection emit mode)
- **THEN** the page’s municipio combobox SHALL update to that INE
- **AND** map and beeswarm views SHALL reflect the selection subject to existing region-filter rules

#### Scenario: ODS goal main beeswarm click selects municipio
- **WHEN** the user clicks a dot in the main layer beeswarm on the ODS goal page with click-selection enabled
- **THEN** the municipio combobox SHALL update to that `codigoIne`

#### Scenario: ODS indicator gallery beeswarm click selects municipio
- **WHEN** the user clicks a dot in an indicator beeswarm card on the ODS goal page with click-selection enabled
- **THEN** the municipio combobox SHALL update to that `codigoIne`

#### Scenario: Combobox still drives selection
- **WHEN** the user selects a municipality from the combobox only
- **THEN** the map and beeswarms SHALL show the same selected state as before this capability

---

### Requirement: MapWrapper region click modes

`MapWrapper` SHALL support a prop that chooses whether a map region click navigates to the municipio detail route immediately or emits the INE to the parent for selection binding. The default SHALL preserve prior navigate-on-click behavior for pages that do not opt in.

#### Scenario: Emit mode updates parent only
- **WHEN** `MapWrapper` is configured for selection emit mode and the user clicks a municipality
- **THEN** it SHALL emit the clicked INE to the parent
- **AND** it SHALL NOT call `navigateTo` for that click

#### Scenario: Default navigate mode unchanged
- **WHEN** `MapWrapper` uses the default click mode and the user clicks a municipality
- **THEN** the app SHALL navigate to the municipio detail URL for the active visualization mode (ODS vs agenda urbana)

---

### Requirement: Map click does not navigate on home or ODS goal page

On the homepage and on ODS goal pages, map clicks used for selection SHALL NOT navigate to the municipio detail route by themselves. Navigation to municipio data SHALL occur via the explore control (or other explicit navigation).

#### Scenario: Home map click stays on home
- **WHEN** the user clicks a municipality on the home map in emit mode
- **THEN** the app SHALL remain on the homepage
- **AND** selection SHALL update per the unified selection requirement

#### Scenario: ODS goal map click stays on ODS page
- **WHEN** the user clicks a municipality on an ODS goal page map in emit mode
- **THEN** the app SHALL remain on that ODS goal route
- **AND** selection SHALL update per the unified selection requirement

---

### Requirement: Explore municipio control when selected

When a municipality is selected, the UI SHALL show a clear control to open that municipality’s data page. The label SHALL include the municipality display name and SHALL use localized copy with name interpolation. The target URL SHALL match the active app mode (ODS vs agenda urbana). On the homepage, the control appears in the map/beeswarm panel (e.g. below the combobox). On the ODS goal page, the control appears below the municipio combobox in the filter row.

#### Scenario: Explore visible when selected
- **WHEN** a municipality is selected on the home or ODS goal page
- **THEN** the explore control SHALL be visible
- **AND** its text SHALL include that municipality’s name

#### Scenario: Explore hidden when none selected
- **WHEN** no municipality is selected
- **THEN** the explore control SHALL NOT be shown

#### Scenario: Explore navigates to detail
- **WHEN** the user activates the explore control while the app is in ODS mode
- **THEN** the app SHALL navigate to the ODS municipio route for the selected INE

#### Scenario: Localized explore label
- **WHEN** the user’s locale is Catalan or Spanish
- **THEN** the explore label SHALL use the corresponding locale string with the municipality name interpolated

---

### Requirement: Explore control navigates to AU municipio from home

When the visualization store is in Agenda Urbana mode, the homepage explore control SHALL navigate to the AU municipio detail route for the selected INE.

#### Scenario: Explore opens AU detail

- **WHEN** the user is on `/` in AU mode with a selected municipio
- **AND** they activate the explore control
- **THEN** the app SHALL navigate to `/muni/au/<ine>`

### Requirement: Home visualization data source follows store mode

The homepage map and beeswarm primary metric layer SHALL use ODS promedios when the store mode is ODS and AU promedios when the store mode is AU. Unified selection between combobox, map, and beeswarm applies to **all** municipios in ODS mode and **only** to municipios with `id_especial3 === 'aue'` in AU mode.

#### Scenario: AU mode uses AU promedios API

- **WHEN** the store mode is AU
- **THEN** the homepage SHALL load provincial averages from `/api/au/promedios` for the selected AU objective
- **AND** map and beeswarm interactions SHALL update `selectedIne` only when the target INE is in the AUE set
- **AND** the map SHALL not show tooltip or hover highlight for non-AUE municipios

#### Scenario: ODS mode unchanged

- **WHEN** the store mode is ODS
- **THEN** the homepage SHALL continue to load `/api/ods/promedios` for the selected ODS objective
- **AND** existing scenarios for unified selection and explore SHALL remain valid

### Requirement: Homepage ODS mode excludes INE 43 from unified selection

On the homepage only, when the visualization store is in ODS mode, the unified municipio selection (combobox, map region clicks in emit mode, beeswarm dot clicks that update selection) SHALL NOT set the selected INE to `43`. The dedicated metropolitan-area entry on the home page SHALL remain the intended way to open the aggregate experience.

#### Scenario: Home map click on aggregate region in ODS mode does not select 43

- **WHEN** the user is on `/` in ODS mode
- **AND** they click the map region corresponding to INE `43` in selection emit mode
- **THEN** the homepage selection SHALL NOT become `43`
- **AND** the previous selection state (including “none selected”) SHALL be preserved or updated per implementation without selecting `43`

#### Scenario: Home beeswarm cannot select 43 in ODS mode

- **WHEN** the user is on `/` in ODS mode
- **AND** they interact with a beeswarm that would otherwise set the selected municipio to INE `43`
- **THEN** the selected INE SHALL NOT become `43`

#### Scenario: Combobox cannot choose 43 in ODS mode on home

- **WHEN** the user is on `/` in ODS mode
- **AND** they open the municipio combobox used for unified selection
- **THEN** INE `43` SHALL NOT be offered as a selectable option
- **OR** if it appears in an underlying list, choosing it SHALL NOT leave `43` as the active selection

#### Scenario: Switching from AU to ODS clears disallowed metropolitan selection

- **WHEN** the user is on `/` in AU mode with INE `43` selected
- **AND** they switch the header toggle to ODS
- **THEN** the homepage SHALL NOT keep `43` as the selected municipio for ODS unified selection
- **AND** selection SHALL be cleared or moved to a valid ODS municipio per existing rules, without selecting `43`

---

### Requirement: AU home beeswarm treats INE 43 as non-selectable reference

When the visualization store is AU and the homepage renders the unified-selection beeswarm, INE `43` SHALL NOT appear as an interactive dot. Any aggregate value for INE `43` SHALL be communicated only via `referenceLines` on `BeeswarmChart`. Dot clicks SHALL therefore not select `43` via the beeswarm in AU mode.

#### Scenario: Beeswarm dot click does not select 43 in AU mode

- **WHEN** the user is on `/` in AU mode
- **AND** the beeswarm shows a metropolitan aggregate reference line for INE `43`
- **THEN** clicking that reference line SHALL NOT set the homepage `selectedIne` to `43` through the beeswarm component

#### Scenario: No dot click target for 43 in AU mode

- **WHEN** the user is on `/` in AU mode
- **AND** AU promedios include a value for INE `43`
- **THEN** the beeswarm SHALL not render a dot whose `codigoIne` is `43`
