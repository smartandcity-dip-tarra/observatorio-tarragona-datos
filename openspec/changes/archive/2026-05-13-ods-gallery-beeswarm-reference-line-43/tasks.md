## 1. Component logic

- [x] 1.1 In `OdsGoalIndicatorBeeswarm.vue`, import `BeeswarmReferenceLine` from `~/components/BeeswarmChart.vue` and `isMetropolitanAggregateIne` from `~/utils/metropolitanAggregateIne`.
- [x] 1.2 Add a computed `referenceLines` that scans **raw** `rows.value` (before `ineAllowlist` filter) for the first row where `isMetropolitanAggregateIne(codigo_ine)` and `valor` is finite; return one-element array with `label`, `value`, `color: props.odsColor`, `showMetropolitanHoverLabel: true`, or `[]` if none.

## 2. Template and verification

- [x] 2.1 Pass `:reference-lines="referenceLines"` to `BeeswarmChart` inside `OdsGoalIndicatorBeeswarm.vue`.
- [x] 2.2 Manually verify on an ODS goal page (`ods/[objetivo]` or AU ODS section using this component): vertical guide appears per indicator when API returns INE `43`; hover shows metropolitan i18n string; with `ineAllowlist`, line still appears when `43` is not in the allowlist.
