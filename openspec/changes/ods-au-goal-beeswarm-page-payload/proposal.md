## Why

ODS and AU goal pages render one beeswarm chart per indicator. Each chart component called `/api/indicadores/valores` independently, so prerendered HTML carried many separate client-side (or duplicate) data fetches instead of a single payload blob. Visitors on a static host should not need to hit the database for gallery data that is fixed at build time.

## What Changes

- Move beeswarm “latest valores for all municipios” loading to **page level** on `ods/[objetivo].vue` and `au/[objetivo].vue` using **`useAsyncData`** so results are included in the **Nuxt prerender payload** with one stable key per route (and locale where applicable).
- **`OdsGoalIndicatorBeeswarm`** becomes a presentational consumer: it receives pre-fetched rows (or a slice per indicator) via props and **no longer** calls `useFetch` for `/api/indicadores/valores` for this use case.
- Preserve existing UX (loading skeleton, empty state, reference line / allowlist behavior) using page-level status or derived per-chart data.

## Capabilities

### New Capabilities

- `ods-au-goal-beeswarm-payload`: Prerendered ODS and AU goal pages ship indicator beeswarm data in the page payload; gallery charts do not independently fetch `/api/indicadores/valores` for each indicator.

### Modified Capabilities

- (none)

## Impact

- **App repo** (`diputacion_tarragona`): `app/pages/ods/[objetivo].vue`, `app/pages/au/[objetivo].vue`, `app/components/ods/OdsGoalIndicatorBeeswarm.vue`.
- **API**: No contract change required if pages batch existing `$fetch('/api/indicadores/valores', …)` calls inside one `useAsyncData` handler (same response shape as today). Optional follow-up: dedicated batch endpoint later.
