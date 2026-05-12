# home-agenda-urban-projects

## MODIFIED Requirements

### Requirement: Filter projects by selected LE

The projects section SHALL list only projects whose **`linea`** field (LE identifier 1–6) equals the **selected Línia Estratègica (level 1)** identifier passed from the homepage. On the homepage in AU mode, an LE SHALL always be selected; the section SHALL update when the selected LE changes. The full project list SHALL be loaded once from the agenda projects API (or its prerendered equivalent); filtering by `linea` SHALL occur **locally** in the client without issuing an additional HTTP request per LE change.

#### Scenario: LE switch updates visible projects

- **WHEN** the user changes the Agenda objective/LE selector on the homepage while in AU mode
- **THEN** the visible projects SHALL correspond only to rows with `linea` matching the new selection within the in-memory list

#### Scenario: No projects for LE

- **WHEN** no project rows exist for the selected `linea` after local filtering
- **THEN** the UI SHALL show an empty state using localized copy (via `useI18n`)

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

## REMOVED Requirements

### Requirement: Data loading via bundled CSV import

**Reason**: Project rows now live in SQLite (`PROYECTOS`) and are exposed through a single list API; bundled `~/assets/data/projects.csv` duplicates that source.

**Migration**: Replace the CSV default import in `HomeAgendaUrbanProjects.vue` with `useFetch`/`useAsyncData` to the new route; remove or retire the unused CSV asset from the app bundle once the API path ships.

## ADDED Requirements

### Requirement: Fetch full project list once for SSR and static generation

The homepage projects feature SHALL obtain the complete project array **once** via Nuxt **`useFetch`** or **`useAsyncData`** against the agenda projects list API. The component SHALL **not** rely on a bundled CSV import for this dataset. For **`nuxt generate`** (or prerender of the homepage), the data fetch SHALL run at build time so the **full JSON payload** is embedded in the generated output for the initial route, avoiding a client-only second request for the list on first paint.

#### Scenario: Static generation embeds data

- **WHEN** the site is built with static generation for the homepage
- **THEN** the prerendered homepage output SHALL include the projects array returned by the list API at build time

#### Scenario: LE changes do not refetch the catalogue

- **WHEN** the user changes the selected LE in AU mode after the initial load
- **THEN** the UI SHALL filter the already-fetched project array in memory without a new HTTP request whose sole purpose is to load projects filtered by `linea`
