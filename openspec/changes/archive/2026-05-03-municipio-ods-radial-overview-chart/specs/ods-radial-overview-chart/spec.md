## ADDED Requirements

### Requirement: Shared polar angle layout for ODS overview charts

The system SHALL provide a single module of **pure functions** (or equivalent non-component export) used by both the municipio ODS spider overview chart and the radial rose overview chart to compute the **direction** of each axis index. For `axisCount === 17`, axis index `i` in `[0,16]` SHALL map to the same polar angle in both charts so ODS **1** appears at the **top** and indices increase **clockwise**, matching the existing `DoubleSpiderMinMax` convention (`-π/2` start, full turn in index order).

#### Scenario: Spider chart after refactor

- **WHEN** `DoubleSpiderMinMax` renders axis lines and rim labels for index `i`
- **THEN** the angle used for that index SHALL be obtained from the shared module (or an identical formula re-exported only from that module)

#### Scenario: Radial rose chart

- **WHEN** the radial overview chart renders wedge `i` for the same `axisCount`
- **THEN** the wedge SHALL be centered on the same angle convention as the spider for that index

### Requirement: Radial overview rose chart structure

The radial overview component SHALL render a single responsive SVG (or equivalent vector root) inside the same **container sizing pattern** as `DoubleSpiderMinMax`: measure container width (e.g. `useElementSize`), enforce a **minimum width** appropriate for mobile, and accept a **`height` prop** that controls the overall vertical budget including space for any below-chart legend if present. The chart SHALL contain, in paint order: (1) seventeen **full** background annular sectors from fixed inner radius `rInner` to fixed outer radius `rOuter` using a neutral fill equivalent to the reference (`#f9fafb` or theme token); (2) seventeen **value-colored** annular sectors sharing the same `rInner` and extending outward by a length proportional to the corresponding overview value; (3) an optional transparent or low-visual **hit** wedge layer spanning `rInner`→`rOuter` per index if pointer interaction is implemented. The seventeen ODS colors SHALL default to the same palette as `DEFAULT_ODS_COLORS` in the spider chart unless overridden by props.

#### Scenario: Background wedges always full depth

- **WHEN** any overview value is less than the maximum
- **THEN** the gray background wedge for that index SHALL still span from `rInner` to `rOuter` (full slot), and the colored arc SHALL be shorter than or equal to that slot

#### Scenario: Responsive sizing

- **WHEN** the host container width changes
- **THEN** the SVG viewBox or width/height SHALL update so the chart remains readable without horizontal clipping of labels within the component’s documented minimum width constraints

### Requirement: Always-visible ODS labels outside the ring

The radial overview SHALL display **human-readable** labels for all seventeen ODS without requiring hover. Each label group SHALL be positioned **outside** `rOuter` using precomputed translations; indices whose bisector lies in the **right** half-plane SHALL use `text-anchor="start"`, and indices in the **left** half-plane SHALL use `text-anchor="end"`, matching the reference SVG behavior. Label text SHALL use existing i18n keys or the same `t('ods_<n>_name')` pattern as the spider’s axis labels unless props supply pre-resolved strings.

#### Scenario: No hover needed to read names

- **WHEN** the chart renders in a static view with no pointer interaction
- **THEN** every ODS label SHALL remain visible (opacity not gated on hover)

### Requirement: Selected ODS emphasis

When `selectedOds` is a strict subset of `1..axisCount`, the chart SHALL de-emphasize non-selected dimensions (implementation-defined: lower opacity on non-selected wedges and/or labels) while **keeping** all seventeen labels present, analogous in spirit to the spider rim label emphasis requirement.

#### Scenario: Filtered ODS subset

- **WHEN** `selectedOds` contains only some ODS numbers
- **THEN** selected indices SHALL read visually stronger than non-selected indices

### Requirement: Center reserved for global index

The radial overview SHALL reserve the **inner circular region** (radius ≤ `rInner`) for future content: either a **named slot**, optional props for title/value, or an empty accessible group. The component SHALL NOT collapse `rInner` to zero in the default configuration so the layout matches the donut reference.

#### Scenario: Placeholder until metric exists

- **WHEN** no global index props or slot content are provided
- **THEN** the center area SHALL still leave a visible hole (donut) and MAY remain blank without shifting wedge geometry

### Requirement: Host switches radial vs spider with Vue transition

The municipio ODS indicators overview host SHALL mount the **radial rose** component when the comparison list is **empty** and SHALL mount `DoubleSpiderMinMax` when **at least one** comparison entry exists, using the **same** primary `values`, `selectedOds`, `axisColors`, `axisLabels`, `nameMunicipio`, and `height` budget as today. The host SHALL wrap the mutually exclusive chart components in a **Vue `<Transition>`** (or Nuxt-documented equivalent) with enter/leave CSS so the swap is visually smooth. `ClientOnly` and skeleton behavior for the overview card SHALL remain consistent with existing municipio ODS patterns.

#### Scenario: Add first comparison municipio

- **WHEN** the user selects a first comparison municipio so `comparisons.length` becomes `1`
- **THEN** the UI SHALL transition from the radial overview to the spider overview without a full page reload

#### Scenario: Remove all comparisons

- **WHEN** the user clears all comparison municipios
- **THEN** the UI SHALL transition from the spider overview back to the radial overview
