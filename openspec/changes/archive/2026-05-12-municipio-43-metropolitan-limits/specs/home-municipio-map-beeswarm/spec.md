# home-municipio-map-beeswarm

## ADDED Requirements

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
