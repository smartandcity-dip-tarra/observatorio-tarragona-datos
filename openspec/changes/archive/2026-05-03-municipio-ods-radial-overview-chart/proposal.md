## Why

Stakeholders want the municipio ODS overview to match the single-city “rose / radial bar” presentation used on [Visor2030](https://visor2030.diba.cat/#/municipis/08002): one colored wedge per ODS, always-visible side labels, and a central area reserved for a global index (specified later). The existing `DoubleSpiderMinMax` spider chart remains the right metaphor when comparison municipios are selected; switching charts at the Vue boundary keeps each visualization maintainable while still allowing a polished transition.

## What Changes

- Add a **new Vue component** for the 17-segment radial (rose) overview chart, visually aligned with the reference SVG: gray full wedge backgrounds, value-proportional colored arcs, optional full-wedge hit targets, fixed **left/right** label columns with `text-anchor` rules, and a **donut** center for future global index copy.
- Extract or add a **small shared module** (composable or plain TS) for **radial layout** constants and helpers used by both the spider chart and the radial chart: axis count (17), angle per index, and agreed inner/outer radius conventions so the two charts feel like the same “clock”.
- Update the **municipio ODS indicadores overview** host (e.g. `IndicadoresView.vue`, and any parallel use such as AU `Seguimiento.vue` if it shares the same overview pattern) to render **radial** when `comparisons.length === 0` and **DoubleSpider** when there is at least one comparison, with a **Vue-level `<Transition>`** (mode and name to be chosen in implementation) between the two components.
- **No** requirement to merge spider and radial into one SFC or one imperative D3 root; **no** backend or dataset contract changes for the 17-value overview vector.

## Capabilities

### New Capabilities

- `ods-radial-overview-chart`: Radial overview chart component (marks, labels, sizing, i18n, selection/opacity behavior), shared polar layout helpers consumed with the spider chart, and host wiring plus Vue transitions between spider and radial modes.

### Modified Capabilities

- *(none — spider chart requirements in `presupuestos-double-spider-chart` remain valid when the spider is mounted; routing between charts is host responsibility.)*

## Impact

- **App repo** (`diputacion_tarragona`): new chart component under `app/components/municipio/ods/presupuestos/charts/` (or adjacent charts folder), possible small refactor of `DoubleSpiderMinMax.vue` to import shared layout helpers, updates to `IndicadoresView.vue` / `Seguimiento.vue` as applicable, i18n keys for label strings if not fully covered by existing `ods_*` keys.
- **Data repo** (`diputacion_tarragona_data`): OpenSpec only — this change documents behavior; no CSV/SQLite pipeline changes.
