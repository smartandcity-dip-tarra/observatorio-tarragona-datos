## Why

The municipio Agenda Metropolitana (AU) page at `/muni/au/<codigo_ine>` still loads historical indicator series with one `/api/indicadores/valores` request per visible indicator after hydration, while the ODS municipio page was already optimized to batch-load compact series and embed the primary municipio payload at prerender time. AU pages suffer the same request storm and bypass Nuxt payload serialization for evolution charts, even though the data volume per AUE municipio is modest (on the order of hundreds of rows).

## What Changes

- Add a compact batch API at `GET /api/au/indicadores-series` for Agenda Metropolitana (TARRAGONA taxonomy) historical indicator series by municipio.
- Resolve indicator ids from the same AU taxonomy scope as `/api/au/indicadores` (DICCIONARIO `agenda = 'TARRAGONA'`, nivel 2 → ARQUITECTURA_L2 children).
- Enforce the AUE participation gate (`id_especial3 = 'aue'`) on the batch endpoint, matching `/api/au/indicadores`.
- Load the primary municipio's full AU historical series through top-level Nuxt async data on `muni/au/[ine].vue` so prerendered pages can serve it from the static payload.
- Switch `Seguimiento.vue` from per-indicator fetches to municipio-level batch loading via `useIndicadorValoresSeries` in an AU batch mode.
- Prerender AU series API routes only for AUE municipios (~31 + metropolitan aggregate INE `43`), not all province INEs.
- Pass cached evolution series into `MunicipioOdsIndicadoresPanel` so opening the slideover does not re-fetch `/api/indicadores/valores`.
- Reuse the existing compact tuple normalization (`[periodo, valor, indice]`) and shared series cache shape; do not change `/api/indicadores/series` (ODS-only).

## Capabilities

### New Capabilities

- `municipio-au-series-batch-api`: Compact batch retrieval of historical AU (TARRAGONA taxonomy) indicator series for one or more AUE municipios via `/api/au/indicadores-series`.
- `municipio-au-series-prerender-payload`: Prerender-aware loading of the primary AUE municipio's historical series on the municipio AU page without post-hydration per-indicator API traffic for normal views.

### Modified Capabilities

- `municipio-comparison-state`: Extend comparison series-loading requirements from ODS-only to also cover AU municipio pages (user-driven batch fetch for selected AUE comparison municipios, local filter reuse).

## Impact

- **Server API**: new `server/api/au/indicadores-series.get.ts`; new `getAuTarragonaL3IndicatorIds` helper mirroring `getOds2030L3IndicatorIds`.
- **Nuxt app**: `app/pages/muni/au/[ine].vue`, `app/components/municipio/au/Seguimiento.vue`, `app/composables/useIndicadorValoresSeries.ts`, types in `app/types/indicadoresSeriesApi.ts`.
- **Build/prerender**: `nuxt.config.ts` gains AUE-only prerender routes for `/api/au/indicadores-series?codigo_ine=…`.
- **Tests**: integration tests for AU batch endpoint and id-set parity with `/api/au/indicadores`.
- **Out of scope**: changes to `/api/indicadores/series`, ODS municipio pages, SQLite indexes, CSV export, non-AUE municipio AU data.
