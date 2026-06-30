# ods-goal-indicator-beeswarm-reference-line

## ADDED Requirements

### Requirement: Metropolitan aggregate reference on ODS indicator beeswarms

For each ODS goal indicator gallery instance implemented by `OdsGoalIndicatorBeeswarm`, the embedded `BeeswarmChart` SHALL receive `referenceLines` derived from the same latest-indicator value series used to build `datapoints`, without an additional HTTP request.

When the series contains a row whose `codigo_ine` identifies the metropolitan aggregate (**INE `43`**) per `isMetropolitanAggregateIne`, and that row’s `valor` is a finite number, the component SHALL pass exactly one reference line object with:

- `value` equal to that row’s `valor`
- `label` equal to `nombreByIne[codigo_ine]` when defined, otherwise the row’s `codigo_ine`
- `color` equal to the ODS goal colour supplied to the component (`odsColor`)
- `showMetropolitanHoverLabel` set to `true`

When no such row exists, or `valor` is null or non-finite, `referenceLines` SHALL be an empty array (or the prop omitted such that the chart’s default empty behaviour applies).

#### Scenario: Aggregate present for indicator

- **WHEN** the fetched rows include a metropolitan aggregate row for INE `43` with a finite `valor`
- **THEN** `BeeswarmChart` SHALL be invoked with `referenceLines` containing one element whose `value` matches that `valor`
- **AND** the reference line SHALL use `odsColor` for stroke when provided
- **AND** `showMetropolitanHoverLabel` SHALL be `true` on that element

#### Scenario: Aggregate absent or invalid

- **WHEN** the fetched rows contain no INE `43` row, or its `valor` is null or not finite
- **THEN** `BeeswarmChart` SHALL behave as if no reference lines were supplied (no vertical aggregate guide)

### Requirement: Reference line independent of municipio allowlist filtering

The aggregate reference line SHALL be resolved from the full fetched row set **before** applying `ineAllowlist` filtering used to build `datapoints`, so the provincial/metropolitan aggregate value is still shown when the dot cloud is restricted to a subset of municipios.

#### Scenario: Allowlist excludes aggregate dot but line remains

- **WHEN** `ineAllowlist` is a non-empty list that does not include INE `43`
- **AND** the full series still includes a valid INE `43` row
- **THEN** `referenceLines` SHALL still include that aggregate reference
- **AND** `datapoints` SHALL not include a dot for INE `43` (existing allowlist behaviour preserved)
