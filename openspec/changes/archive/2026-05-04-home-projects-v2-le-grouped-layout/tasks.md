## 1. Data & types

- [x] 1.1 Replace `app/assets/data/projects.csv` with the v2 dataset (same path: copy/rename from `projects_v2.csv` and remove obsolete columns from the shipped file).
- [x] 1.2 Update CSV row typing/helpers (`agendaProjects.ts` or equivalent): `linea`, `objetivo`, `nombre`, `descripcion`; remove helpers only used for legacy quantitative column (`Indicadores_aude_cuantitativos`).
- [x] 1.3 Point `agendaProjectPdfSlug` (or caller) at **`nombre`** for slug derivation (`/^(\d+(?:\.\d+)+)\s*:/` or agreed pattern).

## 2. UI – HomeAgendaUrbanProjects

- [x] 2.1 Resolve selected LE via `objetivos_agenda.find(o => o.id === leId)`; render subsection title with **`name`** and stylistic use of **`color`** (contrast-safe).
- [x] 2.2 Filter rows by `linea === leId`; group by `objetivo` preserving CSV order within groups / first-appearance group order.
- [x] 2.3 For each objective group, render a heading (i18n-wrapped label using objective code) and a responsive grid of cards.
- [x] 2.4 Each card: **`nombre`** as title, **`descripcion`** as body; remove badges, indicator chips, and modal triggers.
- [x] 2.5 Remove `HomeAgendaProjectIndicators.vue` usage and delete the component if unused; remove dead imports from `HomeAgendaUrbanProjects.vue`.

## 3. i18n & cleanup

- [x] 3.1 Update `home.agendaProjects.*` keys: drop modal/badge-only strings; add objective group pattern and any LE chrome keys needed; mirror `ca` / `es`.
- [x] 3.2 Remove or update unit tests that referenced legacy indicator parsing for homepage projects (`agendaProjectIndicators` tests if orphaned).

## 4. Verification

- [x] 4.1 `pnpm vitest run` (or project test subset) and `pnpm exec nuxt build` succeed.
- [x] 4.2 Manual AU homepage check: switch LE → filtered + grouped list; ODS → section hidden; PDF links match `nombre` pattern or hide.
