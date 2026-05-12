# beeswarm-chart-component

## ADDED Requirements

### Requirement: Generic datapoint input

The `BeeswarmChart` component SHALL accept a `datapoints` prop containing an array of objects. Each object MUST have the following shape:

```ts
interface BeeswarmDatapoint {
  valor: number
  codigoIne: string
  unidad: string
  nombre: string
  periodo?: number | null
}
```

The component SHALL NOT depend on any specific data domain (ODS, agenda urbana, etc.) — it renders whatever datapoints it receives.

#### Scenario: Datapoints are provided
- **WHEN** the component receives an array of datapoints
- **THEN** it SHALL render one dot per datapoint positioned along the X axis according to its `valor`

#### Scenario: Empty datapoints
- **WHEN** the component receives an empty array
- **THEN** it SHALL render an empty chart with the axis but no dots

#### Scenario: Datapoints change reactively
- **WHEN** the `datapoints` prop value changes (e.g. different ODS selected)
- **THEN** the chart SHALL re-compute positions and re-animate the dots

### Requirement: Datapoint may include reference period

Each `BeeswarmDatapoint` MAY include an optional **`periodo`** (number | null): the reference calendar year for that dot’s `valor`. The component SHALL accept and preserve this field through simulation and hover state.

#### Scenario: Datapoint with periodo

- **WHEN** a datapoint includes `periodo: 2022`
- **THEN** the component SHALL render without error
- **AND** the hover tooltip SHALL include that year as specified in the tooltip requirement below

#### Scenario: Datapoint without periodo

- **WHEN** `periodo` is omitted
- **THEN** the tooltip SHALL not show a year fragment from `periodo` (unless a future prop supplies a layer-level caption outside this component)

---

### Requirement: Configurable chart dimensions

The component SHALL accept optional `width` and `height` props controlling the SVG viewport size.

#### Scenario: Default dimensions
- **WHEN** no `width` or `height` props are provided
- **THEN** the chart SHALL render at 480px wide and 320px tall

#### Scenario: Custom dimensions
- **WHEN** `width` is set to 600 and `height` to 400
- **THEN** the SVG SHALL have a viewBox and dimensions of 600x400

---

### Requirement: Configurable dot color

The component SHALL accept a `color` prop (CSS color string) that sets the fill color of the dots.

#### Scenario: Custom color provided
- **WHEN** `color` is set to `"#e97e00"`
- **THEN** all non-faded dots SHALL render with fill `#e97e00`

#### Scenario: No color provided
- **WHEN** the `color` prop is omitted
- **THEN** dots SHALL render with a default color (project primary)

---

### Requirement: Configurable scale domain

The component SHALL accept an optional `domain` prop of type `[number, number]` to set the X axis range.

#### Scenario: Custom domain provided
- **WHEN** `domain` is set to `[0, 100]`
- **THEN** the X axis SHALL range from 0 to 100, regardless of actual data values

#### Scenario: No domain provided (auto-scale)
- **WHEN** `domain` is not provided
- **THEN** the X axis domain SHALL be derived by pooling every finite `valor` in `datapoints` **and** every finite `referenceLines[].value` before applying symmetric padding per `beeswarm-auto-domain-padding`
- **AND** when there are no datapoints but at least one reference line, the domain SHALL still be numerically stable and SHALL include those reference values in the pooled min/max

---

### Requirement: D3 force-directed Y-axis positioning

Dots SHALL be positioned on the Y axis using a D3 force simulation to avoid overlaps. The X position MUST be strictly mapped to the `valor` (data-driven). Only the Y position is adjusted by the simulation.

#### Scenario: Dots with similar values spread vertically
- **WHEN** multiple datapoints have similar `valor` values
- **THEN** the force simulation SHALL spread them vertically so no two dots overlap

#### Scenario: X position fidelity
- **WHEN** a datapoint has a specific `valor`
- **THEN** its X position SHALL correspond precisely to that value on the linear scale (force X strength ≈ 1.0)

---

### Requirement: Animated entrance on load

The chart SHALL animate dots into their positions when first rendered or when datapoints change.

#### Scenario: Initial load animation
- **WHEN** the component mounts with datapoints
- **THEN** dots SHALL transition from a centered Y position to their force-computed positions with a staggered animation

#### Scenario: Data update animation
- **WHEN** datapoints change (new ODS selected)
- **THEN** dots SHALL animate to their new positions

---

### Requirement: Tooltip on hover

The chart SHALL display a tooltip when the user hovers over a dot.

#### Scenario: Hover shows tooltip
- **WHEN** the user hovers over a dot
- **THEN** a tooltip SHALL appear near the dot showing: municipality name, formatted value with unit when `unidad` is non-empty
- **AND** when the datapoint’s `periodo` is a non-null number, the tooltip SHALL also show the reference year in a user-visible way (same line or second line)

#### Scenario: Hover leaves hides tooltip
- **WHEN** the user moves the mouse away from a dot
- **THEN** the tooltip SHALL disappear

---

### Requirement: Optional highlight filtering

The component SHALL accept an optional `highlights` prop — an array of `codigoIne` strings. When provided, only dots matching those codes are rendered in full color; others are faded.

#### Scenario: Highlights provided — matching dot
- **WHEN** `highlights` contains `"43148"` and a datapoint has `codigoIne: "43148"`
- **THEN** that dot SHALL render with the configured `color` at full opacity

#### Scenario: Highlights provided — non-matching dot
- **WHEN** `highlights` is provided and a datapoint's `codigoIne` is NOT in the list
- **THEN** that dot SHALL render in grey (`#d4d4d8`) with reduced opacity (~0.2)

#### Scenario: No highlights provided
- **WHEN** the `highlights` prop is not provided or is empty
- **THEN** all dots SHALL render with the configured `color` at full opacity (no fading)

---

### Requirement: X axis with labeled ticks

The chart SHALL render a horizontal X axis at the bottom with tick marks and labels.

#### Scenario: Axis renders with scale
- **WHEN** the chart renders with datapoints
- **THEN** a horizontal axis SHALL appear at the bottom with numeric tick labels matching the scale domain

#### Scenario: Unit label on axis
- **WHEN** datapoints have a `unidad` value
- **THEN** the axis SHALL display the unit (e.g., "%") as a label at the right end

---

### Requirement: SSR compatibility via ClientOnly

The component MUST be wrapped in `<ClientOnly>` when used, with a skeleton fallback for SSR.

#### Scenario: Server-side rendering
- **WHEN** the page is server-rendered
- **THEN** a skeleton placeholder SHALL appear instead of the chart

#### Scenario: Client hydration
- **WHEN** the client hydrates
- **THEN** the D3 chart SHALL initialize and render with animation

---

### Requirement: Integration with home page ODS selector

When used on the home page, the `BeeswarmChart` SHALL display data for the same ODS objective shown on the map above it.

#### Scenario: ODS selection syncs chart
- **WHEN** the user selects ODS objective 7 via the ODS selector
- **THEN** the beeswarm chart SHALL show per-municipality values for objective 7

#### Scenario: ODS change updates chart
- **WHEN** the user changes the ODS selector from objective 7 to objective 13
- **THEN** the chart SHALL re-animate with data for objective 13

---

### Requirement: Optional click to commit municipio selection

The `BeeswarmChart` component SHALL support an optional mode in which a primary click (or activation) on a dot emits the clicked datapoint’s `codigoIne` to the parent for binding as persistent selection. When this mode is disabled (default), the component SHALL NOT emit selection on click and SHALL behave as today (hover highlight / tooltip only).

#### Scenario: Opt-in click emits INE
- **WHEN** the parent enables the documented opt-in prop for click selection
- **AND** the user clicks a rendered dot
- **THEN** the component SHALL emit the corresponding `codigoIne` for the parent to store as selection

#### Scenario: Default no selection on click
- **WHEN** the opt-in prop is not enabled
- **AND** the user clicks a dot
- **THEN** the component SHALL NOT emit the selection event used for combobox binding

#### Scenario: Click does not replace hover highlight contract
- **WHEN** click selection is enabled
- **THEN** hover behavior for `update:highlightedIne` and tooltip SHALL remain available unless a future requirement explicitly constrains it
