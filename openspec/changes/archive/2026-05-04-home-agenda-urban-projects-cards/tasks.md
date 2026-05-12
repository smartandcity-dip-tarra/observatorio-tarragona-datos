## 1. Utilities and types

- [x] 1.1 Add a small helper (e.g. `~/utils/agendaProjectPdfSlug.ts`) that derives `/projects/projecte_X_Y_Z.pdf` path from `proyecto`, returning `null` when no code can be parsed (caller hides the button).
- [x] 1.2 Define a typed row shape for parsed `projects.csv` (or document keys) including `id_linea`, `proyecto`, `indicadores_aue_cualitativos`, `Indicadores_aude_cuantitativos`, and helpers to coerce `id_linea` to number and detect quantitative placeholders (`-`, empty).

## 2. Component

- [x] 2.1 Create `HomeAgendaUrbanProjects` (or equivalent) with prop `leId: number`, import `~/assets/data/projects.csv`, filter rows by `id_linea === leId`.
- [x] 2.2 Render a responsive grid (`md:grid-cols-2`, `xl:grid-cols-3` or equivalent) of `UCard`s: title from `proyecto`, qualitative block, quantitative block (conditional per spec), `UButton` / link with trailing download icon pointing at the derived PDF path.
- [x] 2.3 Add localized empty state when the filtered list is empty.

## 3. Homepage integration

- [x] 3.1 In `app/pages/index.vue`, render the component **only** when `visualizationStore.isAU`, below the map/beeswarm section, passing `selectedObjective` as `leId` (or equivalent binding).
- [x] 3.2 Match horizontal layout constraints (`max-w-content`, padding) to the existing map section for visual continuity.

## 4. i18n

- [x] 4.1 Add `home.agendaProjects.*` keys (section title, qualitative/quantitative labels, download button, empty state) to Catalan locale and mirror keys in other locale files per project convention so `useI18n()` never falls back to raw keys.

## 5. Verification

- [x] 5.1 Manually verify in AU mode: switching LE updates cards; ODS mode hides the block; PDF links hit `/projects/...` (404 acceptable); grid shows 2–3 columns at expected breakpoints.
- [x] 5.2 Run existing lint/typecheck for touched files and fix any regressions.
