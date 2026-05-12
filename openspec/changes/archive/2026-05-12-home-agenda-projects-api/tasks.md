## 1. Server API (Nuxt)

- [x] 1.1 Add `server/api/agenda/proyectos.get.ts` (or the path agreed in design) that `await useDatabase()`, runs a single `SELECT` of `linea`, `objetivo`, `nombre`, `descripcion` (plus optional `codigo` if useful) from `PROYECTOS`, and returns a JSON array with string-friendly values.
- [x] 1.2 Manually hit `GET /api/agenda/proyectos` in dev and confirm row count matches expectations and no query params are required.

## 2. Frontend: replace CSV

- [x] 2.1 In `HomeAgendaUrbanProjects.vue`, remove the `projects.csv` import; add `await useFetch` / `useAsyncData` with a stable key (e.g. `agenda-proyectos`) pointing at the new route; derive `rows` from `data` with a safe fallback to `[]`.
- [x] 2.2 Keep existing `computed` filters and grouping (`leIdFromProjectRow`, etc.); ensure switching `leId` does not add `watch` refetch for the catalogue.
- [x] 2.3 Update `app/utils/agendaProjects.ts` header comment to state rows come from the API/DB shape, not the CSV path.

## 3. Static generation and cleanup

- [x] 3.1 Run `nuxt generate` (or project equivalent) and confirm the prerendered homepage payload includes the embedded projects array (no client-only fetch needed for initial list).
- [x] 3.2 Remove `app/assets/data/projects.csv` from the app if nothing else imports it; grep the repo for `projects.csv` and fix any remaining references.
- [x] 3.3 Run unit/lint checks touched by the change (e.g. Vitest for `agendaProject*` helpers if any tests referenced the CSV path).
