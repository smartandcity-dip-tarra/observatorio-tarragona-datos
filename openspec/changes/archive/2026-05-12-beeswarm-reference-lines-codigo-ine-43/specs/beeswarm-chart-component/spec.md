## MODIFIED Requirements

### Requirement: Configurable scale domain

The component SHALL accept an optional `domain` prop of type `[number, number]` to set the X axis range.

#### Scenario: Custom domain provided

- **WHEN** `domain` is set to `[0, 100]`
- **THEN** the X axis SHALL range from 0 to 100, regardless of actual data values

#### Scenario: No domain provided (auto-scale)

- **WHEN** `domain` is not provided
- **THEN** the X axis domain SHALL be derived by pooling every finite `valor` in `datapoints` **and** every finite `referenceLines[].value` before applying symmetric padding per `beeswarm-auto-domain-padding`
- **AND** when there are no datapoints but at least one reference line, the domain SHALL still be numerically stable and SHALL include those reference values in the pooled min/max
