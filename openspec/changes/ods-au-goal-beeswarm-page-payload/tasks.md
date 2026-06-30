## 1. Component contract

- [x] 1.1 Extend `OdsGoalIndicatorBeeswarm` to accept optional preloaded latest-valores rows via props; when provided, skip `useFetch` and derive `datapoints` / `referenceLines` from props; keep types aligned with `/api/indicadores/valores` response.

## 2. ODS goal page

- [x] 2.1 On `app/pages/ods/[objetivo].vue`, add `useAsyncData` (keyed by `objetivo` and locale) that loads all gallery indicator valores (e.g. `Promise.all` over catalog indicator ids using `$fetch` to the existing valores endpoint).
- [x] 2.2 Build a map or lookup from `id_indicador` to rows; pass the slice for each `OdsGoalIndicatorBeeswarm`; align loading UI (pending / empty) with current behavior.

## 3. AU goal page

- [x] 3.1 On `app/pages/au/[objetivo].vue`, add the same pattern with AU catalog indicator ids and the same component props.
- [x] 3.2 Verify AU-only props (`ineAllowlist`, `showMetropolitanAggregateReference`) still work with preloaded rows.

## 4. Verification

- [x] 4.1 Run typecheck or build for `diputacion_tarragona` and confirm no duplicate fetches remain for gallery beeswarms on ODS/AU goal pages.
