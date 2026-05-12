# beeswarm-auto-domain-padding

## ADDED Requirements

### Requirement: Padded data-derived x domain when `domain` is omitted
`BeeswarmChart` SHALL compute the horizontal scale domain from pooled finite x-values when the `domain` prop is omitted or undefined. The pool SHALL consist of every finite `datapoints[].valor` **and**, when `referenceLines` is non-empty, every finite `referenceLines[].value`. Let `lo` be the minimum pooled value, `hi` the maximum pooled value, and `span = hi - lo`. When `span > 0`, the domain SHALL be `[lo - m·span, hi + m·span]` where `m` is the auto-domain margin ratio (default **0.1**). When `span === 0`, the component SHALL use a degenerate-domain handling equivalent to the existing behaviour (finite interval around the single pooled value) without requiring relative padding that collapses the interval.

#### Scenario: Multiple distinct values without `domain`
- **WHEN** `domain` is not provided and the pooled values contain at least two distinct finite numbers
- **THEN** the x-scale domain SHALL extend symmetrically beyond the pooled min and max by the configured margin ratio times `span`
- **AND** the force simulation SHALL use this padded domain for horizontal positioning of dots

#### Scenario: Single finite pooled value without `domain`
- **WHEN** `domain` is not provided and all pooled values are equal to one finite number
- **THEN** the chart SHALL remain numerically stable and SHALL NOT produce a zero-width domain for the scale

#### Scenario: Reference-only pooled extent
- **WHEN** `domain` is not provided, `datapoints` is empty, and `referenceLines` contains at least one finite `value`
- **THEN** the x-scale domain SHALL be derived from those reference values using the same padding rules as when datapoints are present

### Requirement: Explicit `domain` is authoritative
When the `domain` prop is provided as a two-element numeric tuple, `BeeswarmChart` SHALL use that tuple **exactly** as the x-scale domain. The component SHALL NOT apply auto-domain margin padding to `domain` in this case.

#### Scenario: Parent passes `domain`
- **WHEN** `domain` is `[a, b]` with `a < b`
- **THEN** the x-scale domain SHALL be `[a, b]`
- **AND** auto-domain margin ratio SHALL NOT modify `a` or `b`

### Requirement: Configurable default margin ratio
The default margin ratio `m` for auto-domain padding SHALL be **0.1** unless overridden. The component SHALL expose a way to override `m` for the auto-derived case (e.g. optional prop) while keeping the default in a single named constant in implementation for easy adjustment.

#### Scenario: Override margin
- **WHEN** `domain` is omitted and the caller sets a valid override margin ratio (e.g. `0.05`)
- **THEN** padding SHALL use that ratio instead of the default

### Requirement: Backward compatibility for explicit domains
Callers that already pass `domain` SHALL observe no change in x-scale extent relative to pre-change behaviour for the same props.

#### Scenario: Homepage or ODS page with future explicit `domain`
- **WHEN** a page passes both `datapoints` and `domain`
- **THEN** the rendered scale domain SHALL match `domain` exactly

### Requirement: Simulation tracks `width` and `height`
The force simulation SHALL re-run when `width` or `height` changes so horizontal positions stay consistent with the x-scale pixel range. When drawable chart width or height is non-positive, the component SHALL not complete a simulation that would leave stale `node.x` coordinates. When `width` or `height` changes, the component SHALL NOT seed new runs with cached **x** positions from a previous layout size.

#### Scenario: Layout size updates after mount
- **WHEN** the parent passes a new `width` or `height` after the initial client render (e.g. `useElementSize` settling)
- **THEN** the simulation SHALL run again with forces derived from the updated scale
- **AND** dot `cx` positions SHALL align with `valor` on the axis and with tooltip placement
