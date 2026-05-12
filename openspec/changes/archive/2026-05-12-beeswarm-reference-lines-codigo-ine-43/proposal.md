## Why

The regions catalog exposes a synthetic aggregate entry with `codigo_ine` **43** (whole Tarragona metropolitan / provincial reference). In Agenda Urbana mode that value is meaningful context, but plotting it as a beeswarm dot makes it look like another municipality and distorts the visual cluster. The product needs a clear visual treatment: the aggregate as a **reference line** on the same horizontal scale, while municipio dots remain only real municipios.

## What Changes

- Extend `BeeswarmChart` with an optional **`referenceLines`** prop: zero or more vertical guides at numeric x-positions, each with a **label** and optional **stroke color**, drawn in chart coordinates (same x-scale as dots).
- When reference lines are present, the chart SHALL still lay out **only** `datapoints` in the force simulation; reference values MUST NOT participate as nodes.
- **Auto domain** (when `domain` is omitted) SHALL consider both `datapoints[].valor` **and** each reference line’s numeric value so lines at extremes remain inside the padded domain.
- **Parents** that today pass INE `43` inside `datapoints` (Agenda / AU flows where the API returns that row) SHALL **filter `43` out** of the dot list and, when a numeric value exists, pass it as a **reference line** (label from catalog / i18n as today for names).
- The API remains reusable for other thresholds later (multiple lines, optional colors).

## Capabilities

### New Capabilities

- `beeswarm-reference-lines`: Contract and behaviour for optional vertical reference lines on `BeeswarmChart` (props/types, rendering, interaction with x-domain and accessibility).

### Modified Capabilities

- `beeswarm-chart-component`: Amend the component requirement set so the public contract explicitly includes `referenceLines` and domain computation rules when lines are supplied.
- `home-index-au-map-visualization`: When AU mode supplies promedios that include INE `43`, the homepage beeswarm SHALL omit `43` from `datapoints` and SHALL surface its value as a reference line when present.
- `home-municipio-map-beeswarm`: Align unified home beeswarm behaviour with the aggregate line (no dot for `43` in AU when used as aggregate; selection / highlight rules unchanged for real municipios).
- `beeswarm-auto-domain-padding`: When `domain` is omitted, pooled min/max for padding SHALL include numeric `referenceLines` values as well as `datapoints[].valor`.

## Impact

- **App repo** (`diputacion_tarragona`): `app/components/BeeswarmChart.vue`; homepage `app/pages/index.vue` beeswarm data pipeline; any other view passing `43` in beeswarm data (search `BeeswarmChart` / `METROPOLITAN_AGGREGATE_INE`).
- **Data repo**: OpenSpec only (this change); no CSV pipeline change required unless integrity docs need a note.
- **Specs**: New delta under this change for `beeswarm-reference-lines` plus deltas for the modified capabilities above.
