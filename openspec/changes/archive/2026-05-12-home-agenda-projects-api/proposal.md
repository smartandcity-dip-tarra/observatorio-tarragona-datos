## Why

Agenda Urbana project cards on the homepage are still fed from a bundled `~/assets/data/projects.csv`, while the build pipeline now materializes the same dataset in SQLite. Keeping two sources risks drift; serving projects from the database via one read keeps a single source of truth without adding per-request query load beyond a single full-table read per page load (and zero extra round-trips after static generation).

## What Changes

- Add a **Nitro GET route** that returns **all** agenda urban projects in one SQLite query (no `linea` filter on the server).
- Replace the **bundled CSV import** in `HomeAgendaUrbanProjects.vue` with **`useFetch` / `useAsyncData`** against that route; **filter by `linea` in the client** exactly as today.
- Ensure **`nuxt generate` pre-renders** `index.vue` and the projects block so the **full JSON payload is embedded** in the static output (no client-only second query for the initial HTML).
- **Remove or stop using** the redundant `projects.csv` asset for this feature once the API is the source of truth (implementation detail in tasks).

## Capabilities

### New Capabilities

- `agenda-projects-api`: Server API contract for listing all projects from SQLite in one response, suitable for static prerender and local filtering.

### Modified Capabilities

- `home-agenda-urban-projects`: Replace the requirement that data comes from a bundled CSV import with data from the new API at SSR/prerender time; preserve LE filtering, grouping, PDF slug behavior, and UI requirements unchanged aside from the data source.

## Impact

- **Nuxt app** (`diputacion_tarragona`): new `server/api/...` handler, `HomeAgendaUrbanProjects.vue`, possibly `app/utils/agendaProjects.ts` comments/types, `app/pages/index.vue` only if data must be hoisted for prerender keys; build/static output grows slightly (JSON vs CSV bundle).
- **SQLite schema**: assumes a `proyectos` (or equivalent) table already populated by the data pipeline; endpoint maps columns to the existing `linea` / `objetivo` / `nombre` / `descripcion` shape expected by the UI helpers.
- **No** per-LE API calls or N+1 database access for this list.
