## Context

The Nuxt app (`diputacion_tarragona`) still imports `~/assets/data/projects.csv` in `HomeAgendaUrbanProjects.vue`. The data repo pipeline already loads `dataset/proyectos.csv` into SQLite table **`PROYECTOS`** (see `proyectos-sqlite` / `integrate-en-proyectos-slug-regiones`). Server routes elsewhere use `useDatabase()` with `better-sqlite3` against the bundled `diputacion_tarragona.db`. The homepage needs the same card behavior (LE filter, objective grouping, PDF slug from `nombre`) with a single source of truth.

## Goals / Non-Goals

**Goals:**

- One **GET** Nitro handler that **`SELECT`s all rows** from `PROYECTOS` (explicit column list), returns JSON suitable for existing row helpers (`linea`, `objetivo`, `nombre`, `descripcion`).
- **`HomeAgendaUrbanProjects.vue`** loads that array once via **`useFetch`/`useAsyncData`** (no `watch` refetch on `leId`); keep **`computed`** filtering by `leId` as today.
- **`nuxt generate`**: homepage prerender executes the server handler once and **inlines** the payload (default Nuxt behavior when `await useFetch` runs in setup during prerender).

**Non-Goals:**

- Per-locale project text from DB (unless already in `PROYECTOS`; UI stays as today).
- Pagination, search, or partial responses.
- Mutations or write APIs.

## Decisions

1. **Route shape**: Prefer `server/api/agenda/proyectos.get.ts` → **`GET /api/agenda/proyectos`** (groups with other agenda routes; name reflects Spanish table semantics already in the pipeline). Alternative `/api/au/proyectos` rejected to avoid implying AU-only hierarchy shared with other AU endpoints—either is acceptable if the team standardizes; **agenda** keeps the catalogue distinct from indicator APIs.

2. **No `linea` query param**: Server always returns the full set; **client filters** to avoid extra DB round-trips when the user switches LE. Rejected alternative: `?linea=` on server—would multiply queries on interaction unless cached, conflicting with the stated goal.

3. **Where to call `useFetch`**: Implement fetch in **`HomeAgendaUrbanProjects.vue`** (or a tiny composable `useAgendaProyectos` if reuse appears). **Rejected** hoisting-only to `index.vue` unless SSR timing shows the child does not prerender data—Nuxt typically prerenders async children of prerendered pages; if QA shows a gap, move `useAsyncData` to the page with a shared key and pass props.

4. **Response typing**: Reuse **`AgendaProjectCsvRow`** (`Record<string, string>`) or rename to a neutral `AgendaProjectRow` in a follow-up; design accepts string records matching CSV-shaped keys for minimal churn.

5. **Asset removal**: After verification, **delete or stop bundling** `app/assets/data/projects.csv` to prevent accidental reuse; update `agendaProjects.ts` comment to reference API/DB.

## Risks / Trade-offs

- **[Risk] Larger HTML/payload on homepage** → Acceptable: row count is bounded (~few dozen); gzip mitigates.

- **[Risk] Build fails if DB empty or table missing** → Mitigation: return `[]`; CI should ship a DB that includes `PROYECTOS` (already required by data pipeline).

- **[Risk] `useFetch` key collisions** → Use a fixed unique key e.g. `` `agenda-proyectos` `` for `useAsyncData`.

## Migration Plan

1. Ship server route + component change together.
2. Remove CSV import and file when E2E/visual checks pass.
3. Rollback: restore CSV import (keep file in git history).

## Open Questions

- Exact **`SELECT`** column order and whether to expose `codigo` for future use (optional field, harmless if present).
