# home-agenda-urban-projects

## ADDED Requirements

### Requirement: LE heading displays full strategic line name and brand color

When the Agenda Urbana projects section is shown for a selected LE, the UI SHALL display that LE’s **full official name** from the canonical Agenda taxonomy (`objetivos_agenda` / bundled config), not only the numeric LE id. The heading (or primary LE title element in this block) SHALL apply that LE’s **`color`** from the same taxonomy in a way that preserves readable contrast on the homepage background (e.g. text color and/or a visible accent such as a left border).

#### Scenario: LE 3 shows full name and uses taxonomy color

- **WHEN** the user selects LE `3` in Agenda Urbana mode on the homepage
- **THEN** the projects section LE title SHALL include the full name for LE 3 from the taxonomy
- **AND** the visual treatment SHALL incorporate the taxonomy `color` for that LE

---

### Requirement: Projects grouped by objective within the LE

Within the projects section for the selected LE, projects SHALL be **grouped** by the CSV column **`objetivo`**. Each group SHALL have a visible **group heading** derived from that objective key (e.g. localized label including the objective code). Projects within a group SHALL appear under that heading. Order within and across groups SHALL follow a deterministic rule (e.g. CSV row order within each `objetivo`, groups in order of first appearance in the filtered CSV).

#### Scenario: Multiple objectives under one LE

- **WHEN** the filtered CSV contains rows with `objetivo` values `1.1` and `1.2` for the selected LE
- **THEN** the UI SHALL render two distinct objective sections with their respective projects under each heading

---

## MODIFIED Requirements

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

The projects section SHALL list only projects whose CSV **`linea`** (LE identifier 1–6) equals the **selected Línia Estratègica (level 1)** identifier passed from the homepage. On the homepage in AU mode, an LE SHALL always be selected; the section SHALL update when the selected LE changes.

#### Scenario: LE switch updates visible projects

- **WHEN** the user changes the Agenda objective/LE selector on the homepage while in AU mode
- **THEN** the visible projects SHALL correspond only to rows with `linea` matching the new selection

#### Scenario: No projects for LE

- **WHEN** no CSV rows exist for the selected `linea`
- **THEN** the UI SHALL show an empty state using localized copy (via `useI18n`)

---

### Requirement: Card content from bundled project rows

Each project entry SHALL display the **`nombre`** field as the project title and the **`descripcion`** field as the main body text. The UI SHALL NOT render qualitative/quantitative indicator columns, indicator code badges, or a “detail” modal used solely to expose long indicator lists from the legacy CSV.

#### Scenario: Card shows name and description

- **WHEN** a row has non-empty `nombre` and `descripcion`
- **THEN** the card (or equivalent project container) SHALL show `nombre` prominently and `descripcion` as readable prose

#### Scenario: No legacy indicator blocks

- **WHEN** the projects section is displayed
- **THEN** the UI SHALL NOT show the legacy `indicadores_aue_cualitativos` / `Indicadores_aude_cuantitativos` indicator lists from the old `projects.csv` model

---

### Requirement: Responsive project layout within objective groups

Project entries SHALL be arranged in a responsive layout with **one column** on small viewports, **two columns** from medium breakpoints upward, and **three columns** on extra-wide breakpoints as defined in implementation (Tailwind), **within each objective group**. The UI SHALL use Nuxt UI primitives (e.g. `UCard`) and Tailwind utility spacing consistent with the homepage.

#### Scenario: Wide viewport shows multiple columns inside a group

- **WHEN** the viewport width meets the largest grid breakpoint used for this section
- **THEN** up to three project entries MAY appear per row within an objective group (last row may have fewer)

---

### Requirement: PDF download control

When a PDF link is shown, each project entry SHALL include a **button-style control** with a **download icon** that navigates to `/projects/{filename}.pdf` where `filename` is **`projecte_{segments}.pdf`** with segments derived from the numeric code at the start of **`nombre`** (e.g. `1.1.1: Title` → `projecte_1_1_1.pdf`). If no such code can be parsed, the control SHALL NOT be shown. The app SHALL NOT implement special handling for missing PDFs; a 404 response until files exist under `public/projects/` is acceptable.

#### Scenario: PDF link uses slug derived from nombre

- **WHEN** `nombre` begins with a numeric code in the form `X.Y.Z:` (or equivalent pattern implemented consistently)
- **THEN** the download control SHALL point to the corresponding `/projects/projecte_X_Y_Z.pdf`

#### Scenario: Missing PDF file

- **WHEN** the user activates the download control and no file exists at that public path
- **THEN** the browser MAY receive a 404 from the static host without the app intercepting or altering that behavior

---

### Requirement: Data loading via bundled CSV import

Project data SHALL be loaded from the bundled **`~/assets/data/projects.csv`** (content replaced with the **v2 schema**: `linea`, `objetivo`, `nombre`, `descripcion`) using the same **direct default import** pattern as other bundled CSV data modules (no dedicated HTTP API for this dataset).

#### Scenario: No runtime fetch for projects list

- **WHEN** the homepage projects section renders in AU mode
- **THEN** the project list SHALL be derived from the bundled CSV import without calling a projects-specific API route for the CSV body

---

### Requirement: Localized interface chrome

All user-visible labels for this section (including section heading, LE heading chrome, objective group headings, empty state, and PDF button label when shown) SHALL be retrieved through **`useI18n()`** translation keys. Catalan SHALL be the primary authored language; other locales SHALL follow the project’s i18n file conventions so keys do not fall back silently to raw IDs in production.

#### Scenario: Labels use i18n keys

- **WHEN** the projects section is shown
- **THEN** no hard-coded user-visible Catalan string for section chrome SHALL be required in the template (strings SHALL come from i18n lookups)

---

## REMOVED Requirements

### Requirement: Card content from CSV columns

**Reason:** Replaced by “Card content from bundled project rows” for the `nombre` / `descripcion` v2 schema; legacy indicator columns are removed.

**Migration:** Use `projects_v2` column layout and drop indicator-based UI.
