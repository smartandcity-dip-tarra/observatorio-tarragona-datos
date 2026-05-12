## ADDED Requirements

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
