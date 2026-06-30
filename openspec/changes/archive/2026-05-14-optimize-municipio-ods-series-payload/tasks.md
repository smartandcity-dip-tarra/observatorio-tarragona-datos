## 1. Batch API

- [x] 1.1 Add shared TypeScript types for the compact municipio ODS series response and tuple shape.
- [x] 1.2 Implement a read-only batch endpoint for ODS historical indicator series grouped by `codigo_ine` and `id_indicador`.
- [x] 1.3 Validate missing/empty municipio parameters and reject invalid requests with clear 400 errors.
- [x] 1.4 Ensure the endpoint uses bound SQL parameters and does not require any SQLite index or schema change.
- [x] 1.5 Add API tests or focused integration checks for compact payload shape, period ordering, multiple municipios, and no-index correctness.

## 2. Client Normalization

- [x] 2.1 Add a normalization helper that converts compact `[periodo, valor, indice]` tuples into `IndicadorSeriePoint[]`.
- [x] 2.2 Seed the existing series cache with normalized primary municipio data from page-level async data.
- [x] 2.3 Change `useIndicadorValoresSeries` to fetch missing municipio series in batch rather than per `(municipio, indicator)` pair.
- [x] 2.4 Cache loaded municipio series so indicator picker/filter changes update locally without new historical-series requests.
- [x] 2.5 Preserve existing cache keys from `indicadorSerieCacheKey(ine, id)` for list, dashboard, and trend consumers.

## 3. Prerender Payload

- [x] 3.1 Add top-level Nuxt async data on the municipio ODS page for the primary municipio compact ODS series.
- [x] 3.2 Pass the primary series payload into the indicators view/composable before client-side missing-data checks run.
- [ ] 3.3 Verify a prerendered primary municipio page hydrates without per-indicator `/api/indicadores/valores` calls for primary series.

## 4. Comparison Flow

- [x] 4.1 Keep comparison municipio series loading triggered only by user selection in the comparison store/UI flow.
- [x] 4.2 Fetch all ODS historical series for each selected comparison municipio with a single compact batch request per missing municipio.
- [ ] 4.3 Verify changing indicator filters after comparison data loads does not trigger additional comparison series requests.
- [ ] 4.4 Verify removing and re-adding an already loaded comparison municipio reuses cached session data when available.

## 5. Panel and Regression Checks

- [x] 5.1 Reuse the shared series cache in the indicator slideover panel where practical, or document any remaining panel-specific fetch as a follow-up.
- [x] 5.2 Run relevant typecheck/lint/test commands for changed API, composable, and municipio ODS page files.
- [ ] 5.3 Manually inspect browser network behavior for a prerendered municipio page and for selecting one comparison municipio.

## 6. Follow-Up Tracking

- [x] 6.1 Record SQLite indexing on `INDICADORES(codigo_ine, id_indicador, periodo)` as a separate future optimization, not part of this implementation.
