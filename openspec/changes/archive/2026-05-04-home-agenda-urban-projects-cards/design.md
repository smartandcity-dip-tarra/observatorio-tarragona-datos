## Context

The Nuxt app already bundles CSVs as typed/default imports (see `~/lib/presupuestos/dataProcessNew.ts` importing `program_to_ods.csv`). The homepage (`app/pages/index.vue`) uses `visualizationStore.isAU` for Agenda Urbana mode and `selectedObjective` aligned with the six Líneas Estratègiques (`objetivos_agenda`). `app/assets/data/projects.csv` lists projects with `id_linea` (1–6), `proyecto`, `objetivo`, `linea`, `indicadores_aue_cualitativos`, and `Indicadores_aude_cuantitativos` (header spelling preserved).

## Goals / Non-Goals

**Goals:**

- Surface projects for the **active LE only**, in a **responsive card grid** (1 column mobile, 2 tablet, 3 desktop) using **Nuxt UI** (`UCard`, `UButton`, icons) and Tailwind spacing consistent with the home map section.
- Present qualitative and quantitative indicator text readably (structured body text; optional subtle section headings inside the card).
- Expose a **PDF affordance** per project: correct URL shape under `/projects/`; **no** special handling for missing files (404 acceptable until assets land in `public/projects/`).
- Keep strings in **i18n** (`useI18n`) even when Catalan is the only populated locale today.

**Non-Goals:**

- Municipio-scoped project views, API routes, or SQLite-backed project tables.
- Fetching or HEAD-probing PDF existence.
- Changing LE taxonomy or `projects.csv` authoring process in the data pipeline (beyond ensuring the app can import the file).

## Decisions

1. **Component boundary**  
   A dedicated organism component (e.g. `HomeAgendaUrbanProjects.vue` or `AgendaUrbanProjectsGrid.vue`) receives **`leId: number`** and internally filters parsed rows where `id_linea === leId`. The page passes `selectedObjective` when `isAU` is true. **Rationale:** testable, reusable if another AU-only parent appears later.

2. **CSV import and parse**  
   Import `~/assets/data/projects.csv` the same way as other data CSVs; normalize column access to match generated keys (Vite/Nuxt CSV plugin may expose headers as-is, including `Indicadores_aude_cuantitativos`). Filter and map in `<script setup>` or a tiny `~/utils/agendaProjects.ts` if logic grows. **Rationale:** matches user-requested loading style; no extra network.

3. **PDF filename rule**  
   Derive slug from the `proyecto` field: extract the leading **numeric hierarchy** after the word `Projecte` (e.g. `Projecte 1.1.1. …` → `1.1.1`), replace dots with underscores, lowercase prefix → `projecte_1_1_1.pdf`. Link: `/projects/projecte_1_1_1.pdf`. **Alternatives considered:** slug from full title (rejected — unstable); separate column in CSV (rejected — not in source today). **Fallback:** if no numeric token matches, omit the button or show disabled control with i18n “no document” — pick one in implementation; spec prefers hiding the button when slug cannot be derived.

4. **Quantitative field `-`**  
   Treat literal `-` or empty as “no quantitative block”; hide that subsection or show an i18n “none” line — prefer **hide subsection** to reduce noise.

5. **Layout**  
   Place the new section **after** the existing map/beeswarm grid inside the home page flow, full width within the same `max-w-content` / horizontal padding pattern as the map section for visual continuity.

6. **i18n**  
   Add keys under e.g. `home.agendaProjects.*` in locale files (ca + es mirroring structure with Catalan text where Spanish is not required yet, or duplicate ca strings in es to avoid missing keys — align with project convention).

## Risks / Trade-offs

- **[Risk] CSV column name typo (`Indicadores_aude_cuantitativos`)** → Mitigation: single constant or type mapping keyed off actual import shape; unit test or snapshot of first row keys if the pipeline changes.
- **[Risk] Multi-line CSV fields break naive parsers** → Mitigation: rely on the same import pipeline as other bundled CSVs; if raw import fails, switch to `?raw` + Papa Parse only as a follow-up.
- **[Risk] Slug regex misses edge project titles** → Mitigation: log-free fallback (hide button); optional follow-up to add explicit `pdf_slug` column in CSV.

## Migration Plan

Ship UI first; add files under `public/projects/` when ready — no feature flags required. Rollback: remove section + component import from `index.vue`.

## Open Questions

- Whether to show `objetivo` / `linea` on each card as secondary metadata (not strictly required by the user; can improve scanability).
