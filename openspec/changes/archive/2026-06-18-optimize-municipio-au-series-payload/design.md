## Context

The municipio AU page already loads hierarchy and latest values with `useAsyncData('/api/au/indicadores')`, reusing the same `OdsHierarchyResponse` shape as ODS. Historical series are loaded differently: `Seguimiento.vue` calls `useIndicadorValoresSeries` in default `per_indicator` mode, passing `indicatorIds` derived from `filteredItems`, which triggers many `/api/indicadores/valores` calls (batched five at a time) after hydration.

The ODS municipio optimization (archived change `optimize-municipio-ods-series-payload`) solved the same problem with:

- a dedicated batch endpoint (`/api/indicadores/series`, ODS-only),
- page-level `useAsyncData` for primary series,
- composable `ods_batch` mode with prerender payload seeding,
- municipio-level comparison fetches on user selection.

AU was explicitly out of scope for that change. AU differs in ways that matter for design:

- Taxonomy: `agenda = 'TARRAGONA'` (6 líneas estratégicas, ~70 L3 indicators) vs ODS `2030` (~95 indicators).
- Municipio gate: only `id_especial3 = 'aue'` municipios (31 + metropolitan aggregate INE `43`) have AU data; non-AUE `/muni/au/*` pages already fail on hierarchy fetch.
- Prerender surface: ODS series is prerendered for all province INEs; AU series should only be prerendered for the AUE subset.

## Goals / Non-Goals

**Goals:**

- Replace per-indicator AU historical series requests with municipio-level batch loading.
- Add `GET /api/au/indicadores-series` under the AU API namespace (Option B), parallel to `/api/au/indicadores`.
- Serialize primary AUE municipio series into the prerendered Nuxt payload on `muni/au/[ine].vue`.
- Fetch comparison municipio AU series only after user selection, one batch request per missing AUE municipio.
- Reuse compact `[periodo, valor, indice]` tuples and existing cache normalization (`applyCompactOdsSeriesToCache` or renamed equivalent).
- Filter indicator picker changes locally without new historical-series requests once a municipio's batch is loaded.
- Wire `MunicipioOdsIndicadoresPanel` with `evolution-series-from-cache` on AU pages.

**Non-Goals:**

- Do not extend or add a `framework` query parameter to `/api/indicadores/series`.
- Do not add SQLite indexes or schema migrations.
- Do not preload comparison municipio series into the primary page payload.
- Do not change ODS municipio behavior, `/api/indicadores/valores`, or CSV export.
- Do not make non-AUE municipios return AU series (404 remains correct).

## Decisions

### AU-namespaced batch endpoint (Option B)

Implement `GET /api/au/indicadores-series` as a sibling of `/api/au/indicadores`, not an extension of `/api/indicadores/series`.

Rationale: hierarchy, promedios, and objetivo-indicadores already live under `/api/au/`. A dedicated AU series route keeps taxonomy boundaries obvious, avoids conditional branching in the ODS-only handler, and lets prerender route lists stay separate (`indicadoresSeriesApiRoutes` vs `auIndicadoresSeriesApiRoutes`).

Alternative considered: unified `/api/indicadores/series?framework=au`. Rejected per product decision — same compact contract, but AU stays namespaced with its hierarchy API.

### Compact transport shape (same as ODS)

```json
{
  "framework": "au",
  "series": {
    "43038": {
      "A-1": [[2018, 0.5, 72.1], [2019, 0.6, 75.0]]
    }
  }
}
```

Tuple order `[periodo, valor, indice]`; omit or skip null `valor` on the client. Metadata (names, units, latest values) continues to come from `/api/au/indicadores`.

### Indicator id resolution

Add `getAuTarragonaL3IndicatorIds(db)` mirroring `getOds2030L3IndicatorIds`:

- Select DICCIONARIO rows where `agenda = 'TARRAGONA'` and `nivel = 2`.
- Collect distinct `ARQUITECTURA_L2.child` values for those parents.

The batch endpoint returns all historical `INDICADORES` rows for those ids and requested `codigo_ine` values — not the client-filtered visible set.

### AUE municipio validation

Before querying series, validate each requested `codigo_ine` exists in `REGIONES` and has `id_especial3 = 'aue'`. Non-AUE municipios receive 404, consistent with `/api/au/indicadores`.

Metropolitan aggregate INE `43` is AUE in the database and SHALL be supported.

### Municipio-level fetches (not picker-driven)

`Seguimiento.vue` SHALL stop passing `indicatorIds` from `filteredItems` when using AU batch mode. Load all AU-scoped histories for the municipio once; picker/filter changes filter locally (same tradeoff accepted for ODS).

### Composable: `au_batch` series source

Extend `useIndicadorValoresSeries` with `seriesSource: 'au_batch'` (or generalize `ods_batch` → `batch` with a `batchEndpoint` / `framework` option). AU batch mode:

- Seeds cache from `primaryInitialSeries` when `framework === 'au'`.
- Fetches missing municipios via `$fetch('/api/au/indicadores-series', { query: { codigo_ine } })`.
- Tracks `loadedMunicipios` / `loadingMunicipios` at municipio granularity (same as ODS batch).

Reuse `applyCompactOdsSeriesToCache` — the tuple shape is identical; consider renaming to `applyCompactSeriesToCache` as a non-functional cleanup if touched.

### Primary payload and prerender routes

`muni/au/[ine].vue` adds:

```ts
useAsyncData(
  () => `api/au/indicadores-series-${ine}`,
  () => $fetch('/api/au/indicadores-series', { query: { codigo_ine: ine } }),
  { server: true },
)
```

Prerender only AUE INEs. Derive the list from municipios with `id_especial3 === 'aue'` in the build catalog (or a static allowlist including `43`), not the full `codigos_ine` array used for ODS.

### Panel evolution cache

`Seguimiento.vue` SHALL pass `:evolution-series-from-cache` to `MunicipioOdsIndicadoresPanel`, matching `IndicadoresView.vue` on ODS, so panel open does not trigger `/api/indicadores/valores`.

## Risks / Trade-offs

- **Prerendering AU series for non-AUE INEs** → Mitigation: prerender AUE subset only; non-AUE pages never call the batch endpoint successfully anyway.
- **Larger primary payload vs picker-scoped fetches** → AU has ~70 indicators vs ODS ~95; per-municipio row count is smaller. Accept municipio-level load for simpler cache semantics.
- **Duplicated SQL/handler structure vs ODS series** → Accept small duplication between `/api/indicadores/series` and `/api/au/indicadores-series`; shared helpers for id resolution and tuple assembly reduce drift.
- **Composable proliferation (`ods_batch` + `au_batch`)** → Prefer explicit `au_batch` over a single overloaded mode with many conditionals; document both in composable JSDoc.
- **60 indicators overlap ODS and AU taxonomies** → Same `INDICADORES` rows may appear in both batch responses for a municipio; scopes are defined by taxonomy mapping, not global uniqueness.
- **Non-AUE `/muni/au/*` prerender pages** → Hierarchy already errors; page-level `useAsyncData` for series should `.catch` or tolerate 404 without breaking prerender for those routes (match existing error-handling patterns).

## Migration Plan

1. Add `getAuTarragonaL3IndicatorIds` and `/api/au/indicadores-series` with tests.
2. Add `IndicadorAuSeriesCompactResponse` type (`framework: 'au'`).
3. Extend composable with `au_batch` mode targeting the new endpoint.
4. Wire `muni/au/[ine].vue` and `Seguimiento.vue` (prop + batch mode + panel cache).
5. Add AUE-only prerender routes in `nuxt.config.ts`.
6. Verify network: prerendered AUE page has no per-indicator `valores` calls for primary series; comparison selection triggers one AU batch per municipio.

Rollback: revert to `per_indicator` in `Seguimiento.vue` and remove the new endpoint; no DB changes to undo.

## Open Questions

- Whether to rename `applyCompactOdsSeriesToCache` when touching it, or leave the name and document that it handles any compact framework payload.
- Exact source for the AUE INE allowlist at build time (`municipiosCatalog` filter vs SQLite query in a small build helper).
