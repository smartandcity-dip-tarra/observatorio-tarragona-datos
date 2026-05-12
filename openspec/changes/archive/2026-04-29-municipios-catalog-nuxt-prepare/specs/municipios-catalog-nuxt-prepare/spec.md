## ADDED Requirements

### Requirement: Nuxt Prepare exposes the REGIONES municipio catalog at build time

The Nuxt application SHALL register the `nuxt-prepare` module and SHALL define a Nuxt Prepare handler that reads all rows from the `REGIONES` table in the bundled SQLite database (`diputacion_tarragona.db` used for server APIs) and exposes them as typed prepare state importable from `#nuxt-prepare`.

#### Scenario: Prepare output matches API shape

- **WHEN** the prepare handler runs during `nuxt prepare` / `nuxt build`
- **THEN** each municipio object SHALL include at least the fields required by `Municipio` / `GET /api/municipios/list` for an unfiltered request (including `codigo_ine`, `nombre`, and `id_especial3` when present in `REGIONES`)

#### Scenario: Deterministic ordering

- **WHEN** the catalog is materialized at build time
- **THEN** rows SHALL be ordered deterministically (e.g. by `codigo_ine`) so builds are reproducible for the same database file

### Requirement: No static municipios CSV for in-app catalog consumption

First-party application code SHALL NOT import `~/assets/data/municipios_tarragona.csv` for municipio catalog data after this change. Municipio pages and components that previously used that import SHALL obtain the catalog from `#nuxt-prepare` (or a thin composable re-exporting it).

#### Scenario: Municipio detail pages use prepare catalog

- **WHEN** a developer inspects `app/pages/municipios/ods/[ine].vue` and `app/pages/municipios/au/[ine].vue`
- **THEN** neither file SHALL import `municipios_tarragona.csv` for municipio lookup

#### Scenario: CSV asset removed when unused

- **WHEN** no remaining references to `municipios_tarragona.csv` exist in the Nuxt app
- **THEN** the file SHALL be removed from `app/assets/data/` (or the assets tree where it lived)

### Requirement: Build fails clearly if the database is missing

If the SQLite file required by the prepare handler is not found at the resolved path during build, the prepare step SHALL fail with an error message that indicates the missing file and expected location so CI/debugging is straightforward.

#### Scenario: Missing DB blocks prepare

- **WHEN** the prepare handler cannot open or read the configured database file
- **THEN** the build SHALL fail (non-zero exit) and the error SHALL mention the database path or identifier
