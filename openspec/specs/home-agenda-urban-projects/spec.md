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

The projects section SHALL list only projects whose **`linea`** field (LE identifier 1–6) equals the **selected Línia Estratègica (level 1)** identifier passed from the homepage. On the homepage in AU mode, an LE SHALL always be selected; the section SHALL update when the selected LE changes. The full project list SHALL be loaded once from the agenda projects API (or its prerendered equivalent); filtering by `linea` SHALL occur **locally** in the client without issuing an additional HTTP request per LE change.

#### Scenario: LE switch updates visible projects

- **WHEN** the user changes the Agenda objective/LE selector on the homepage while in AU mode
- **THEN** the visible projects SHALL correspond only to rows with `linea` matching the new selection within the in-memory list

#### Scenario: No projects for LE

- **WHEN** no project rows exist for the selected `linea` after local filtering
- **THEN** the UI SHALL show an empty state using localized copy (via `useI18n`)

---

### Requirement: LE heading displays full strategic line name and brand color

When the Agenda Urbana projects section is shown for a selected LE, the UI SHALL display that LE’s **full official name** from the canonical Agenda taxonomy (`objetivos_agenda` / bundled config), not only the numeric LE id. The heading (or primary LE title element in this block) SHALL apply that LE’s **`color`** from the same taxonomy in a way that preserves readable contrast on the homepage background (e.g. text color and/or a visible accent such as a left border).

#### Scenario: LE 3 shows full name and uses taxonomy color

- **WHEN** the user selects LE `3` in Agenda Urbana mode on the homepage
- **THEN** the projects section LE title SHALL include the full name for LE 3 from the taxonomy
- **AND** the visual treatment SHALL incorporate the taxonomy `color` for that LE

---

### Requirement: Projects grouped by objective within the LE

Within the projects section for the selected LE, projects SHALL be **grouped** by the field **`objetivo`**. Each group SHALL have a visible **group heading** derived from that objective key (e.g. localized label including the objective code). Projects within a group SHALL appear under that heading. Order within and across groups SHALL follow a deterministic rule (e.g. row order within each `objetivo`, groups in order of first appearance in the filtered list).

#### Scenario: Multiple objectives under one LE

- **WHEN** the filtered list contains rows with `objetivo` values `1.1` and `1.2` for the selected LE
- **THEN** the UI SHALL render two distinct objective sections with their respective projects under each heading

---

### Requirement: Card content from bundled project rows

Each project entry SHALL display the **`nombre`** field as the project title and the **`descripcion`** field as the main body text. The UI SHALL NOT render qualitative/quantitative indicator columns, indicator code badges, or a “detail” modal used solely to expose long indicator lists from the legacy CSV model.

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

When a PDF link is shown, each project entry SHALL include a **button-style control** with a **download icon** that navigates to `/projects/{filename}.pdf` where `filename` is **`projecte_{segments}.pdf`** with segments derived from the numeric code at the start of **`nombre`** (e.g. `1.1.1: Title` → `projecte_1_1_1.pdf`), or—when **`nombre`** does not carry that prefix—from the project row’s **`codigo`** when it matches the same dotted numeric pattern. If no such code can be determined, the control SHALL NOT be shown. The app SHALL NOT implement special handling for missing PDFs; a 404 response until files exist under `public/projects/` is acceptable.

#### Scenario: PDF link uses slug derived from nombre

- **WHEN** `nombre` begins with a numeric code in the form `X.Y.Z:` (or equivalent pattern implemented consistently)
- **THEN** the download control SHALL point to the corresponding `/projects/projecte_X_Y_Z.pdf`

#### Scenario: PDF link uses slug derived from codigo

- **WHEN** `nombre` does not begin with a parseable `X.Y.Z:` prefix but the row includes a **`codigo`** value such as `1.1.1`
- **THEN** the download control SHALL point to `/projects/projecte_1_1_1.pdf`

#### Scenario: Missing PDF file

- **WHEN** the user activates the download control and no file exists at that public path
- **THEN** the browser MAY receive a 404 from the static host without the app intercepting or altering that behavior

---

### Requirement: Fetch full project list once for SSR and static generation

The homepage projects feature SHALL obtain the complete project array **once** via Nuxt **`useFetch`** or **`useAsyncData`** against the agenda projects list API. The component SHALL **not** rely on a bundled CSV import for this dataset. For **`nuxt generate`** (or prerender of the homepage), the data fetch SHALL run at build time so the **full JSON payload** is embedded in the generated output for the initial route, avoiding a client-only second request for the list on first paint.

#### Scenario: Static generation embeds data

- **WHEN** the site is built with static generation for the homepage
- **THEN** the prerendered homepage output SHALL include the projects array returned by the list API at build time

#### Scenario: LE changes do not refetch the catalogue

- **WHEN** the user changes the selected LE in AU mode after the initial load
- **THEN** the UI SHALL filter the already-fetched project array in memory without a new HTTP request whose sole purpose is to load projects filtered by `linea`

---

### Requirement: Localized interface chrome

All user-visible labels for this section (including section heading, LE heading chrome, objective group headings, empty state, and PDF button label when shown) SHALL be retrieved through **`useI18n()`** translation keys. Catalan SHALL be the primary authored language; other locales SHALL follow the project’s i18n file conventions so keys do not fall back silently to raw IDs in production.

#### Scenario: Labels use i18n keys

- **WHEN** the projects section is shown
- **THEN** no hard-coded user-visible Catalan string for section chrome SHALL be required in the template (strings SHALL come from i18n lookups)
