## Why

The bundled projects dataset has been redesigned (`projects_v2.csv`): each row is now a concise **name** plus **description**, keyed by **LE** (`linea`) and **objective** (`objetivo`). The previous homepage implementation relied on long qualitative/quantitative indicator columns, badge chips, and a detail modal—none of which match the new content model. We need to swap the data source, simplify the UI to **name + description**, and **group projects by objective** under a visually clear **LE heading** (full official LE title and brand color).

## What Changes

- **Replace** `app/assets/data/projects.csv` with **`projects_v2.csv`** as the canonical import (remove or stop shipping the old file once migrated).
- **Filter** projects by the selected LE (`linea` === selected Agenda LE id), unchanged in intent.
- **Remove** indicator-code badges, indicator parsing utilities usage for this section, and the **“Veure detall”** modal (`HomeAgendaProjectIndicators` flow).
- **Render** each project with **`nombre`** (title) and **`descripcion`** (body text), using readable typography (no wall of raw CSV codes in the card header).
- **Group** projects within the section by CSV column **`objetivo`** (e.g. `1.1`, `2.2`), with a visible **group heading** per objective.
- **LE presentation**: the block title for the active LE SHALL use the **full Línia Estratègica name** from the canonical taxonomy (`objetivos_agenda`), not only the numeric id; apply the LE **`color`** from that taxonomy to the heading (and coherent accents—e.g. border or accent—without harming contrast).
- **PDF**: keep optional PDF link behaviour if still desired, deriving the slug from the new **`nombre`** field (numeric code prefix before `:`), or adjust/remove per final UX—call out in design if ambiguous.

## Capabilities

### New Capabilities

- (none — behaviour evolves under the existing homepage projects capability)

### Modified Capabilities

- **`home-agenda-urban-projects`**: Data schema (`projects_v2.csv` columns), removal of indicator blocks/modal, grouping by `objetivo`, LE full title + color, card content = nombre + descripción, responsive layout may remain card grid within groups.

## Impact

- **Nuxt app**: `HomeAgendaUrbanProjects.vue`, remove or narrow `HomeAgendaProjectIndicators.vue`; `agendaProjects.ts` / types for CSV columns; `agendaProjectPdfSlug.ts` (input field rename); `index.vue` wiring; i18n keys (drop modal/badge strings; add any objective-group labels if needed).
- **Assets**: replace `projects.csv` with v2 content (or rename `projects_v2.csv` → `projects.csv`).
- **Tests**: update or remove tests tied to old indicator parsing for projects.
- **OpenSpec**: delta spec under this change; merge to `openspec/specs/home-agenda-urban-projects/spec.md` when archiving.
