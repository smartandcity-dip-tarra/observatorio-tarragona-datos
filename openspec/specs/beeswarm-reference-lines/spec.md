# beeswarm-reference-lines

## ADDED Requirements

### Requirement: Reference line input contract

`BeeswarmChart` SHALL accept an optional prop `referenceLines` whose value is an array (default empty). Each element SHALL be an object with:

- `label` (string): human-readable description shown in chart UI associated with that guide (e.g. tooltip on the line, legend snippet, or `title` accessibility).
- `value` (finite number): x-position on the same numeric axis as `datapoints[].valor`.
- `color` (optional string): CSS color for that line’s stroke when provided.
- `showMetropolitanHoverLabel` (optional boolean): when `true`, pointer hover over the line uses the app i18n key **`area_metropolitana_de_tarragona`** for the floating label and SVG `title`; when omitted or `false`, hover copy SHALL fall back to **`label`**.

The component SHALL export a public TypeScript type (e.g. `BeeswarmReferenceLine`) describing this shape alongside `BeeswarmDatapoint`.

#### Scenario: Empty reference lines preserves legacy behaviour

- **WHEN** `referenceLines` is omitted or an empty array
- **THEN** the chart SHALL render with no vertical reference guides beyond existing axis/grid behaviour
- **AND** no reference-line-specific DOM layer is required to receive pointer events

#### Scenario: Parent passes one reference line

- **WHEN** `referenceLines` contains one object with `label`, `value`, and optional `color`
- **THEN** the chart SHALL render a vertical guide at the x-position corresponding to `value` on the active linear scale
- **AND** that guide SHALL use `color` for stroke when `color` is set

### Requirement: Reference line hover chip

When the pointer hovers a reference line’s interactive hit target, the chart MAY show a small, non-blocking label **above** the plot band, **to the right** of the vertical line. The label text SHALL be **`area_metropolitana_de_tarragona`** (via `vue-i18n`) when `showMetropolitanHoverLabel` is `true`, otherwise the line’s **`label`**. The same string SHALL be exposed on the hit target’s SVG **`title`** for accessibility. When a **dot** tooltip is active, the reference-line hover chip SHALL not be shown (dot hover takes precedence).

#### Scenario: Metropolitan hover uses locale key

- **WHEN** a reference line sets `showMetropolitanHoverLabel: true` and the user hovers that line
- **THEN** the hover chip and `title` SHALL resolve to the translated string for `area_metropolitana_de_tarragona` (e.g. Catalan and Spanish strings maintained in app locale files)

#### Scenario: Non-metropolitan hover uses `label`

- **WHEN** a reference line does not set `showMetropolitanHoverLabel` to `true` and the user hovers that line
- **THEN** the hover chip and `title` SHALL use that line’s `label` string

### Requirement: Reference lines are not force nodes

Numeric entries in `referenceLines` SHALL NOT be instantiated as force-simulation nodes and SHALL NOT affect collision or Y packing of dots.

#### Scenario: Reference value equals a municipio value

- **WHEN** a reference line’s `value` equals some dot’s `valor`
- **THEN** the dot SHALL still participate in the force simulation as today
- **AND** the reference line SHALL render independently (overlapping in x is allowed)

### Requirement: Reference lines do not drive municipio selection

When `selectOnClick` is enabled on `BeeswarmChart`, pointer interaction with a reference line SHALL NOT emit `selectMunicipio` and SHALL NOT mutate `codigoIne` selection state.

#### Scenario: Click on reference line in select-on-click mode

- **WHEN** `selectOnClick` is true and the user activates a reference line graphic
- **THEN** the component SHALL NOT emit `selectMunicipio` for that interaction

### Requirement: Explicit domain does not auto-expand for lines

When the parent passes a finite `domain` tuple, the chart SHALL use that tuple exactly as the x-scale domain per existing rules; reference lines outside `[domain[0], domain[1]]` MAY clip and the component SHALL NOT silently widen an explicit `domain` to include them.

#### Scenario: Clipped reference with explicit domain

- **WHEN** `domain` is `[0, 10]` and a reference line has `value` 20
- **THEN** the line SHALL be positioned according to the scale (possibly outside the visible plot clip) without changing `domain`
