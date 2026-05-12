## MODIFIED Requirements

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

### Requirement: Choropleth and beeswarm use AU promedios on home

When the store mode is AU, map fill values, legend stops, homogeneous reference year (when applicable), and beeswarm datapoints on the homepage SHALL be derived from `/api/au/promedios` for the selected objective, scoped to AUE municipios for beeswarm dot rows and selection as specified above. The aggregate INE `43` value MAY still be read from the same payload for `referenceLines` and for map styling if the map layer includes that INE independently of dot simulation.

#### Scenario: Map and beeswarm stay in sync in AU mode

- **WHEN** the user changes the selected AU objective or municipio selection on `/` in AU mode
- **THEN** map shading and beeswarm positions SHALL reflect the same underlying AU promedio rows for AUE municipios
- **AND** highlighted and selected INE behaviour SHALL match the existing home interaction patterns among AUE municipios only

#### Scenario: Non-AUE municipios use no-data fill

- **WHEN** the home page is in AU mode
- **THEN** the choropleth value layer SHALL include only AUE municipios
- **AND** non-AUE municipios SHALL use the same fill as missing data (e.g. white), not the active objective color scale, even if the API returned a row for that INE
