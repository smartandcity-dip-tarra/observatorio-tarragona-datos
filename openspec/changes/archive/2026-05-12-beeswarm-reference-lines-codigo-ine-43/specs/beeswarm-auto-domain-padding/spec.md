## MODIFIED Requirements

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
