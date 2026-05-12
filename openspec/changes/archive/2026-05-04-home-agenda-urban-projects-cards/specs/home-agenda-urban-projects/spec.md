# home-agenda-urban-projects

## ADDED Requirements

### Requirement: Homepage projects section visibility

The homepage SHALL render an Agenda Urbana projects section **only** when the visualization store indicates Agenda Urbana mode (`isAU`). The section SHALL NOT be shown in ODS mode.

#### Scenario: ODS mode hides projects

- **WHEN** the user views the homepage with visualization mode set to ODS
- **THEN** the Agenda Urbana projects section SHALL NOT appear in the DOM

#### Scenario: AU mode shows projects

- **WHEN** the user views the homepage with visualization mode set to Agenda Urbana
- **THEN** the Agenda Urbana projects section SHALL be visible below the map/beeswarm block

---

### Requirement: Filter projects by selected LE

The projects section SHALL list only projects whose CSV `id_linea` equals the **selected Línia Estratègica (level 1)** identifier passed from the homepage. On the homepage in AU mode, an LE SHALL always be selected; the section SHALL update when the selected LE changes.

#### Scenario: LE switch updates cards

- **WHEN** the user changes the Agenda objective/LE selector on the homepage while in AU mode
- **THEN** the visible project cards SHALL correspond only to rows with `id_linea` matching the new selection

#### Scenario: No projects for LE

- **WHEN** no CSV rows exist for the selected `id_linea`
- **THEN** the UI SHALL show an empty state using localized copy (via `useI18n`)

---

### Requirement: Card content from CSV columns

Each project card SHALL display the project title from the CSV `proyecto` field. Each card SHALL display the qualitative indicators text from `indicadores_aue_cualitativos` and the quantitative indicators text from `Indicadores_aude_cuantitativos` **when that field is present and not a bare placeholder** (e.g. a single `-` or empty). Long text SHALL remain readable (appropriate spacing, typography, and wrapping).

#### Scenario: Card shows qualitative and quantitative blocks

- **WHEN** a row has non-empty qualitative and quantitative indicator fields that are not placeholder-only
- **THEN** the card SHALL show both blocks with localized section labels from i18n

#### Scenario: Quantitative placeholder omitted

- **WHEN** the quantitative field is empty or equals `-`
- **THEN** the card SHALL NOT render a quantitative indicators subsection

---

### Requirement: Responsive card grid

Project cards SHALL be arranged in a responsive grid with **one column** on small viewports, **two columns** from medium breakpoints upward, and **three columns** on extra-wide breakpoints as defined in implementation (Tailwind). Cards SHALL use Nuxt UI primitives (e.g. `UCard`) and Tailwind utility spacing for a cohesive look with the rest of the homepage.

#### Scenario: Wide viewport shows three columns

- **WHEN** the viewport width meets the largest grid breakpoint used for this section
- **THEN** up to three cards SHALL appear per row (last row may have fewer)

---

### Requirement: PDF download control

Each card SHALL include a Nuxt UI **button-style control** with a **download icon** that navigates to `/projects/{filename}.pdf` where `filename` follows the rule: extract the project numeric code from `proyecto` (e.g. `1.1.1` from `Projecte 1.1.1. …`), replace dot separators with underscores, and prefix with `projecte_` in lowercase (e.g. `projecte_1_1_1.pdf`). The app SHALL NOT implement special handling for missing PDFs; a 404 response until files exist under `public/projects/` is acceptable.

#### Scenario: PDF link uses derived slug

- **WHEN** the project title begins with a standard `Projecte X.Y.Z` style code
- **THEN** the download control SHALL point to `/projects/projecte_X_Y_Z.pdf` with the derived segments

#### Scenario: Missing PDF file

- **WHEN** the user activates the download control and no file exists at that public path
- **THEN** the browser MAY receive a 404 from the static host without the app intercepting or altering that behavior

---

### Requirement: Data loading via bundled CSV import

Project data SHALL be loaded from `~/assets/data/projects.csv` using the same **direct default import** pattern as other bundled CSV data modules (no dedicated HTTP API for this dataset).

#### Scenario: No runtime fetch for projects list

- **WHEN** the homepage projects section renders in AU mode
- **THEN** the project list SHALL be derived from the bundled CSV import without calling a projects-specific API route for the CSV body

---

### Requirement: Localized interface chrome

All user-visible labels for this section (including section heading, subsection labels for indicator blocks, download button label, empty state) SHALL be retrieved through **`useI18n()`** translation keys. Catalan SHALL be the primary authored language; other locales SHALL follow the project’s i18n file conventions so keys do not fall back silently to raw IDs in production.

#### Scenario: Labels use i18n keys

- **WHEN** the projects section is shown
- **THEN** no hard-coded user-visible Catalan string for section chrome SHALL be required in the template (strings SHALL come from i18n lookups)
