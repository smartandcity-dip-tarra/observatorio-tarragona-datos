## Context

The municipio ODS page already loads the primary hierarchy with `useAsyncData('/api/ods/indicadores')`, which gives the page latest values and metadata in a Nuxt-aware data payload. Historical series are different: `useIndicadorValoresSeries` currently watches the primary INE, comparison INEs, and indicator ids, then issues one `$fetch('/api/indicadores/valores')` per `(municipio, indicator)` pair.

That pattern creates visible API request storms after hydration. It also bypasses Nuxt payload serialization, so ordinary users of prerendered municipio pages still hit the backend for historical series. The historical data volume per municipio is modest: roughly hundreds of rows and single-digit gzip KB when encoded compactly.

The target usage split is:

- normal municipio page visitors receive prerendered HTML and payload data without runtime DB traffic for primary historical series;
- users who select comparison municipios or other special interactive modes fetch additional data on demand;
- comparison and filter interactions reuse locally cached municipio series instead of refetching per indicator.

## Goals / Non-Goals

**Goals:**
- Replace per-indicator historical series requests with municipio-level batch loading.
- Serialize primary municipio series into the prerendered Nuxt payload.
- Fetch comparison municipio series only after the user selects comparison municipios.
- Use a compact historical-series transport shape that avoids repeating metadata already present in `/api/ods/indicadores`.
- Keep list, dashboard, trend, and chart components consuming normalized `IndicadorSeriePoint[]` data.
- Allow indicator picker/filter changes to filter locally without new series requests.

**Non-Goals:**
- Do not add or require SQLite indexes as part of this change.
- Do not preload all possible comparison municipios into each page payload.
- Do not change the existing `/api/indicadores/valores` response contract unless needed for compatibility; prefer a separate batch endpoint.
- Do not redesign comparison selection rules or raise the maximum number of comparison municipios.
- Do not include non-ODS histories or CSV export behavior in this change.

## Decisions

### Municipio-level series fetches

Fetch all ODS historical series for a requested municipio instead of only the currently visible indicator ids.

Rationale: the payload per municipio is small, and local filtering avoids coupling backend calls to picker state. This keeps the cache simple: once a municipio's ODS series are loaded, list/dashboard toggles and indicator filters do not trigger additional backend calls.

Alternative considered: request only filtered indicator ids. This reduces a small amount of data but adds complexity around refetching when filters change, cache completeness, and avoiding partial-cache bugs.

### Compact transport shape

Use a compact, grouped payload for historical series, with metadata omitted because it is already available from the hierarchy response. The intended shape is:

```json
{
  "framework": "ods",
  "series": {
    "43021": {
      "47": [
        [2015, 2.5, 70.83333333],
        [2016, 2.4, 75]
      ]
    }
  }
}
```

Tuple order is `[periodo, valor, indice]`. `indice` may be `null`; rows with null `valor` may be omitted by the client normalization if charts and trend logic require numeric values.

Rationale: repeated row objects duplicate `codigo_ine`, `id_indicador`, indicator names, units, and direction for every period. Grouped tuples keep the network shape small while allowing a single normalization step to restore the existing client shape.

Alternative considered: return full row objects from the batch endpoint. This is simpler to inspect but repeats data heavily and weakens the purpose of this change.

### Separate batch API endpoint

Prefer a new endpoint, for example `/api/indicadores/series`, over changing `/api/indicadores/valores`.

Rationale: `/api/indicadores/valores` already has a broad contract for single values, latest values, all municipios, and row-object time series. A dedicated endpoint can express "compact historical series for ODS indicator histories" without risking regressions for existing callers.

Alternative considered: add new query parameters to `/api/indicadores/valores`. This keeps endpoint count low but makes the existing contract more conditional and harder to test.

### Primary payload and comparison runtime loading

The municipio ODS page should call the batch endpoint via top-level Nuxt async data for the primary INE. During prerender, Nuxt can serialize that result into the static payload. `useIndicadorValoresSeries` should accept this initial primary dataset and seed its cache before deciding what runtime data is missing.

Comparison municipios remain user-driven. When the comparison store receives one or two selected INEs, the composable fetches all ODS series for each selected comparison municipio with batch requests. No comparison series are fetched before selection.

Rationale: this matches the desired traffic model: static payload for most users, runtime DB/API only for deliberate comparison use.

### Normalized client cache remains the UI boundary

The compact payload should be decoded at the data layer into the existing cache keyed by `indicadorSerieCacheKey(ine, id)`, with values shaped like `IndicadorSeriePoint[]`.

Rationale: chart, dashboard, list, and trend components already work against normalized series arrays. Keeping that boundary avoids pushing compact tuple concerns into UI components.

### SQLite index is deferred

This change does not require a database index. The current database can answer the batch query correctly without one, and batching already reduces repeated scans and serverless/API overhead. A future change can add or validate an index such as `(codigo_ine, id_indicador, periodo)`.

Rationale: separating endpoint/payload behavior from DB physical design keeps this change smaller and easier to verify. It also avoids coupling the spec to a database artifact/migration process.

## Risks / Trade-offs

- Larger primary payload for every municipio page → Keep payload compact and limited to ODS histories for the current municipio only.
- Hidden regressions from changing cache semantics → Normalize compact payloads into the current `Map<ine:id, IndicadorSeriePoint[]>` shape and preserve existing UI component contracts.
- Comparison cache becomes incomplete if filtered ids are used later → Fetch all ODS histories per selected municipio so local filtering is safe.
- Batch endpoint scans `INDICADORES` without an index → Accept for this change because one scan per selected municipio is still much cheaper than dozens of repeated scans; track indexing separately.
- Nuxt payload may refetch if async data keys/options are wrong → Use stable keys based on INE/framework and ensure primary series data is provided to the composable before client-side missing-data fetches run.

## Migration Plan

1. Add the compact batch endpoint and tests for payload shape, ordering, parameter validation, and read-only/parameterized DB access.
2. Add client types and normalization helpers for compact series payloads.
3. Seed primary municipio series from top-level page async data.
4. Change `useIndicadorValoresSeries` to fetch by municipio batches for missing comparison municipios.
5. Reuse the seeded cache from list/dashboard/panel where possible.
6. Verify prerendered municipio pages avoid post-hydration primary series API calls, while comparison selection triggers only batch calls.

Rollback is straightforward: keep the old per-indicator logic available during implementation until the batch path is verified, then remove it. No database schema rollback is needed.

## Open Questions

- Final endpoint path/name: `/api/indicadores/series` is the preferred placeholder unless a local naming convention suggests a better route.
- Whether the slideover panel should be changed in the first implementation to always read from the shared series cache, or handled as a follow-up if the main request storm is already eliminated.

## Follow-up (not in this change)

- **SQLite index**: add or validate a covering index on `INDICADORES(codigo_ine, id_indicador, periodo)` to reduce batch query latency once traffic warrants it. The batch endpoint is correct without it.
