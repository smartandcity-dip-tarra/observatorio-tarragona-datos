## Why

The municipio ODS indicators view currently issues one runtime API request per indicator series after hydration, causing a storm of `/api/indicadores/valores` calls and unnecessary SQLite reads for ordinary visits to prerendered municipio pages. The data volume per municipio is small enough to ship primary historical series in the prerendered Nuxt payload and to fetch comparison municipios with one compact batch request when the user explicitly selects them.

## What Changes

- Add a compact batch API contract for ODS indicator historical series by municipio.
- Load the primary municipio's full ODS indicator series through Nuxt async data so prerendered pages can serve it from the static payload.
- Replace per-indicator runtime series requests with municipio-level batch loading.
- Fetch comparison municipio series only after user selection, using one batch request per selected municipio and filtering indicators locally.
- Keep SQLite index creation out of scope for this change; batching must work without schema/index changes, with indexing evaluated later as a separate optimization.
- Preserve existing list, dashboard, trend, and chart consumers by normalizing compact payloads into the current in-memory series cache shape.

## Capabilities

### New Capabilities
- `municipio-ods-series-batch-api`: Compact batch retrieval of historical ODS indicator series for one or more municipios.
- `municipio-ods-series-prerender-payload`: Prerender-aware loading of the primary municipio's historical series without post-hydration DB/API traffic for normal page views.

### Modified Capabilities
- `municipio-comparison-state`: Comparison selection remains user-driven, and selected comparison municipios trigger batch series loading only after selection.

## Impact

- Server API: new or extended endpoint for compact batch series responses backed by read-only SQLite queries.
- Nuxt page data: municipio ODS page gains a top-level async data fetch for primary historical series so payload extraction can serialize it during prerender.
- Frontend data layer: `useIndicadorValoresSeries` changes from per `(ine, indicator)` fetches to municipio-level batch fetches plus local cache normalization.
- UI components: list/dashboard/panel consumers should keep their existing normalized `IndicadorSeriePoint[]` expectations where practical.
- Database: no required index or schema migration in this change; a future task may add an index such as `(codigo_ine, id_indicador, periodo)`.
