## Context

`projects_v2.csv` uses columns `linea` (LE 1–6), `objetivo` (e.g. `1.1`, `2.2`), `nombre` (project title, often prefixed like `1.1.1: …`), and `descripcion` (long body). The app already has `objetivos_agenda` from `#tarragona-taxonomy` / `~/assets/config/config.js` with **`id`**, **`name`**, and **`color`** per LE. The homepage AU projects block today imports `projects.csv`, filters by `id_linea`, and composes `HomeAgendaProjectIndicators` (badges + modal). That stack is obsolete relative to the new dataset and UX goals.

## Goals / Non-Goals

**Goals:**

- Single bundled CSV import for projects (`projects.csv` after rename or direct `projects_v2.csv` import—one canonical path).
- AU-only section; filter rows where `linea` (number) matches selected LE.
- **Grouped UI**: within the section, cluster projects by **`objetivo`** with a clear **group heading** (display the raw `objetivo` key and optionally enrich later—v1 can show `Objectiu {objetivo}` style via i18n interpolation or literal column).
- **LE chrome**: section subtitle (or primary aside title) shows **`objetivos_agenda.find(le => le.id === linea).name`** (full LE name) and uses **`color`** for text color, left border, or underline—must meet contrast on `bg-slate-50` / white cards.
- Cards show **`nombre`** as title and **`descripcion`** as prose; no indicator lists, no “Veure detall” modal.
- PDF link: parse numeric code from start of **`nombre`** (`/^(\d+(?:\.\d+)+)\s*:/`) → `/projects/projecte_x_y_z.pdf`; hide button if parse fails.

**Non-Goals:**

- Backend API for projects.
- Municipio-level project pages.
- Authoring objective long names from an external dictionary (unless already in app)—v1 uses CSV `objetivo` code as grouping key + simple label.

## Decisions

1. **File name**  
   Replace `app/assets/data/projects.csv` with the v2 content (either rename `projects_v2.csv` → `projects.csv` or change import to `projects_v2.csv` and delete old file). **Preference:** rename to `projects.csv` so imports stay stable.

2. **Grouping algorithm**  
   Filter by `linea === leId`, then `groupBy(row.objetivo)` preserving stable order (CSV row order within each group). Sort groups by string sort of `objetivo` or first appearance order—**first appearance order** matches narrative flow of the CSV.

3. **Objective group heading**  
   Render heading text as `objetivo` value with a localized pattern e.g. `home.agendaProjects.objectiveGroupTitle` → `"Objectiu {code}"` / `"Objetivo {code}"` unless a richer mapping exists later.

4. **LE title + color**  
   Resolve `const le = objetivos_agenda.find(o => o.id === leId)`; heading uses `le.name`; apply `le.color` via inline style `color` **or** CSS variable—avoid low-contrast pastel on white (optional subtle left border `border-l-4` with same color).

5. **Remove components/utils**  
   Remove `HomeAgendaProjectIndicators.vue` if unused; trim `agendaProjectIndicators.ts` tests if only used by removed UI; keep `agendaProjectPdfSlug` with `nombre` as input string.

6. **Grid**  
   Keep responsive card grid **within each objective group** (1 / 2 / 3 columns) for consistency with current homepage density.

## Risks / Trade-offs

- **[Risk]** `objetivo` is a short code (`1.1`)—users may want full objective titles from taxonomy later → **Mitigation:** i18n template + optional follow-up mapping table.
- **[Risk]** Very long `descripcion` blows card height → **Mitigation:** sensible `leading-relaxed`, optional `line-clamp` only if product asks (default: full text per user request).
- **[Risk]** PDF slug from `nombre` fails if format changes → **Mitigation:** hide PDF button when regex fails (existing pattern).

## Migration Plan

1. Add/replace CSV asset; update TypeScript row type and helpers (`linea`, `objetivo`, `nombre`, `descripcion`).
2. Refactor `HomeAgendaUrbanProjects.vue` layout: LE heading, objective groups, simplified cards.
3. Delete obsolete indicator modal component and dead i18n keys.
4. Run `pnpm vitest` / build; fix tests touching old CSV columns.

## Open Questions

- Should **PDF** remain for every card or be dropped for v2 (proposal leaves optional)—confirm with product before implementation.
