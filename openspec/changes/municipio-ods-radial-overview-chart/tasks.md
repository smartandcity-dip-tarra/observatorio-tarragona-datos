## 1. Shared polar layout

- [x] 1.1 Add pure layout module (e.g. `app/utils/odsPolarLayout.ts`) exporting `angleForIndex(i, axisCount)` aligned with current `DoubleSpiderMinMax` top-at-ODS-1 clockwise convention, plus any small helpers both charts need.
- [x] 1.2 Refactor `DoubleSpiderMinMax.vue` to import angles (and optionally `DEFAULT_ODS_COLORS`) from the shared module without changing spider behavior (rim labels, dots, comparisons).

## 2. Radial rose component

- [x] 2.1 Create new SFC under `app/components/municipio/ods/presupuestos/charts/` (name TBD, e.g. `OdsRadialOverviewRose.vue`) using `useElementSize`, `height` prop, and `d3.arc` (or equivalent) to emit path `d` strings for gray full wedges and colored value wedges per index.
- [x] 2.2 Implement `rInner` / `rOuter` scaling from container `min(width,height)` with a minimum width floor consistent with `DoubleSpiderMinMax` usability.
- [x] 2.3 Add seventeen always-visible label groups outside `rOuter` with `text-anchor` start/end by half-plane; wire `axisLabels` / i18n `ods_*` like the spider.
- [x] 2.4 Implement `selectedOds` opacity emphasis for wedges and/or labels for all seventeen indices.
- [x] 2.5 Reserve center donut (`rInner`): default slot or props placeholder for future global index; no `rInner=0` default.
- [x] 2.6 Optional: transparent full-wedge hit targets and hover tooltip for value (if spec parity with interaction needs it); keep `pointer-events` sensible.

## 3. Host wiring and transitions

- [x] 3.1 In `IndicadoresView.vue` overview card, render radial component when `spiderComparisons` is empty and `DoubleSpiderMinMax` when non-empty; pass the same `values`, `selectedOds`, `axis-colors`, `axis-labels`, `name-municipio`, and `height` as today.
- [x] 3.2 Wrap the mutually exclusive charts in `<Transition name="ods-overview-chart">` (or chosen name) with CSS enter/leave; set wrapper `min-height` if needed to reduce layout shift.
- [x] 3.3 Grep for other `DoubleSpiderMinMax` usages (e.g. `Seguimiento.vue`); apply the same empty-vs-non-empty comparison rule if that overview shares the same semantics.

## 4. Styling, i18n, and QA

- [x] 4.1 Add any new i18n keys (ca/es) only if label copy cannot reuse existing `ods_N_name` strings.
- [x] 4.2 Add scoped CSS for transition classes under the host or a small shared stylesheet fragment.
- [x] 4.3 Manually verify: single-city radial matches reference structure; add one comparison → spider + legend; clear comparisons → radial; `selectedOds` filter from parent still de-emphasizes correctly on both charts.
