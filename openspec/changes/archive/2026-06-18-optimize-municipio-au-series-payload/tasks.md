## 1. AU batch API

- [x] 1.1 Add `getAuTarragonaL3IndicatorIds(db)` mirroring `getOds2030L3IndicatorIds` for `agenda = 'TARRAGONA'`.
- [x] 1.2 Add `IndicadorAuSeriesCompactResponse` type with `framework: 'au'` in `app/types/indicadoresSeriesApi.ts`.
- [x] 1.3 Implement `GET /api/au/indicadores-series` with compact grouped tuples, AUE gate, and parameterized SQLite queries.
- [x] 1.4 Validate missing/empty `codigo_ine`, unknown INEs (400), and non-AUE municipios (404).
- [x] 1.5 Add integration tests for AU id-set parity, tuple ordering, multi-INE requests, and AUE validation.

## 2. Client normalization and composable

- [x] 2.1 Extend `useIndicadorValoresSeries` with `au_batch` mode fetching `/api/au/indicadores-series`.
- [x] 2.2 Seed cache from `primaryInitialSeries` when `framework === 'au'`.
- [x] 2.3 Reuse or rename `applyCompactOdsSeriesToCache` so AU tuples normalize to `IndicadorSeriePoint[]`.
- [x] 2.4 Cache loaded municipio AU series so picker/filter changes do not refetch histories.
- [x] 2.5 Preserve `indicadorSerieCacheKey(ine, id)` for list, dashboard, and trend consumers.

## 3. Municipio AU page and Seguimiento

- [x] 3.1 Add top-level `useAsyncData` on `muni/au/[ine].vue` for `/api/au/indicadores-series`.
- [x] 3.2 Pass `primaryAuSeriesCompact` prop into `MunicipioAuSeguimiento`.
- [x] 3.3 Switch `Seguimiento.vue` to `au_batch` mode; remove `indicatorIds` from series args.
- [x] 3.4 Pass `:evolution-series-from-cache` to `MunicipioOdsIndicadoresPanel` (mirror ODS `IndicadoresView`).
- [x] 3.5 Align loading UX with ODS (`municipioSeriesLoading` / overview spinner if needed).

## 4. Prerender and build

- [x] 4.1 Derive AUE municipio INE list (`id_especial3 === 'aue'`, including `43`) for prerender routes.
- [x] 4.2 Add `auIndicadoresSeriesApiRoutes` to `nuxt.config.ts` nitro prerender routes (AUE subset only).
- [x] 4.3 Ensure non-AUE `muni/au/*` prerender does not fail when series `useAsyncData` receives 404.

## 5. Comparison flow

- [x] 5.1 Fetch missing comparison municipio AU series via `/api/au/indicadores-series` on user selection only.
- [x] 5.2 Verify indicator filter changes after comparison load do not trigger new AU series requests.
- [x] 5.3 Verify re-adding a previously loaded AUE comparison municipio reuses session cache.

## 6. Verification

- [x] 6.1 Confirm `/api/indicadores/series` behavior unchanged (ODS-only, no `framework` param).
- [x] 6.2 Run typecheck/lint/tests for changed API, composable, page, and Seguimiento files.
- [x] 6.3 Manually inspect network on prerendered `/muni/au/43038`: no per-indicator `valores` storm for primary series; one AU batch per comparison selection.

## 7. Follow-up tracking

- [x] 7.1 Record SQLite indexing on `INDICADORES(codigo_ine, id_indicador, periodo)` as a separate future optimization if AU+ODS batch latency warrants it.
