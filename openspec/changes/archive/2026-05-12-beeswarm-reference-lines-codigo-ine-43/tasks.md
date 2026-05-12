## 1. Chart component (`BeeswarmChart.vue`)

- [x] 1.1 Add exported type `BeeswarmReferenceLine` (`label: string`, `value: number`, `color?: string`) next to `BeeswarmDatapoint`.
- [x] 1.2 Add optional prop `referenceLines` defaulting to `[]` and include it in watchers that rebuild scale/simulation where needed.
- [x] 1.3 Extend auto-domain computation so pooled min/max includes finite `referenceLines[].value` with the same margin behaviour as datapoints (aligned with `beeswarm-auto-domain-padding`).
- [x] 1.4 Render reference lines in SVG (vertical segment across plot height), default stroke when `color` omitted, no pointer-driven `selectMunicipio` emission.
- [x] 1.5 Add minimal accessibility (`title` or `aria-label` from `label`) on each line element.

## 2. Homepage AU data pipeline (`index.vue`)

- [x] 2.1 Split AU promedios rows: exclude `METROPOLITAN_AGGREGATE_INE` (`43`) from `beeswarmDatapoints` when building dot list in AU mode (keep existing AUE + non-null filters for dots).
- [x] 2.2 When AU mode and a finite value exists for INE `43`, pass `referenceLines` with `label` from `nombreByIne` (or agreed i18n/catalog fallback) and optional `color` consistent with the active línea.
- [x] 2.3 Confirm `mapValues` / legend / homogeneous year behaviour still matches specs (dots-only filtering for `43` only where required by `home-index-au-map-visualization`).

## 3. Audit other `BeeswarmChart` call sites

- [x] 3.1 Search the app for `BeeswarmChart` and `codigo_ine` / `43` in beeswarm-related builders; if any pass `43` as a dot in AU (or other modes), apply the same split pattern or document why not needed.

## 4. Verification

- [x] 4.1 Manually verify AU home: dots are AUE-only municipios, aggregate appears as a vertical line, scale includes the line, clicking the line does not select `43`.
- [x] 4.2 Run typecheck / unit tests if the repo has chart-related tests; fix any regressions on ODS home and ODS/AU goal pages using the chart.

## 5. Spec archive (after implementation, separate PR or `/opsx:apply` follow-up)

- [x] 5.1 When implementation is merged, propagate deltas from `openspec/changes/beeswarm-reference-lines-codigo-ine-43/specs/` into `openspec/specs/` per project archive workflow.
