## Why

Agenda Urbana projects are metropolitan-scope (not tied to a single municipio) but belong to a Línia Estratègica (LE). Users in Agenda mode on the homepage need to see which projects sit under the LE they are exploring, with linked qualitative and quantitative indicator text and a clear path to project PDFs when those assets exist.

## What Changes

- Add a homepage section **below the map block** that lists **Agenda Urbana projects** from bundled `projects.csv`, visible **only when the app is in Agenda Urbana mode** (`isAU`).
- Render each project as a **card** in a responsive grid (**two or three cards per row** on larger breakpoints).
- Each card shows copy from **`indicadores_aue_cualitativos`** and **`Indicadores_aude_cuantitativos`** (exact CSV column name), with sensible typography for long multi-line content.
- Each card includes a **Nuxt UI button** with a **download icon** linking to `/projects/{slug}.pdf` derived from the project code (e.g. Projecte 1.1.1 → `projecte_1_1_1.pdf`). **PDFs are not shipped yet**; links may 404 until files are added under `public/projects/`.
- Filter projects by the **currently selected LE (level 1)**; on the homepage an LE is always selected when in AU mode.
- Load data by **direct import** of the CSV asset (same pattern as other `~/assets/data/...` imports), not a runtime API.
- UI chrome (section titles, button labels, empty states) uses **`useI18n()`**; locale content is **Catalan-only** for now but strings live in i18n files for consistency.

## Capabilities

### New Capabilities

- `home-agenda-urban-projects`: Homepage Agenda-only projects grid: data source, LE filtering prop, card layout, PDF slug rule, Nuxt UI + Tailwind presentation, i18n for interface strings.

### Modified Capabilities

- (none)

## Impact

- **App repo** (`diputacion_tarragona`): `app/pages/index.vue` (compose new section when `isAU`), new Vue component(s) under `app/components/`, optional small util for PDF slug / row typing, `i18n/locale(s)` for new keys, ensure `projects.csv` remains importable (may need typings or `?raw` handling per project CSV pipeline).
- **No** municipio detail pages; projects stay on the homepage AU experience.
- **Data repo** (`diputacion_tarragona_data`): OpenSpec only — this change documents behavior; CSV may already live in the app repo.
