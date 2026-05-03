## Transform pipeline and CSV integrity checks

This repository contains the data transformation pipeline that converts the Diputación de Tarragona CSV dataset into a normalized SQLite database, plus a lightweight CSV integrity check CLI.

### CSV integrity checks (local)

- **Command**: `cd transform && pnpm run check:csv`
- **Dataset directory (default)**: `../dataset/`
- **Report output directory (default)**: `../docs/csv-integrity/`

The command will:

- Run a set of basic **format checks**:
  - Each required CSV file exists (`regiones.csv`, `indicadores_agendas.csv`, `metadatos_agendas.csv`, …).
  - Each file is non-empty and has a header line that can be parsed.
  - Each file contains a minimal set of required columns (for example `codigo_ine`, `indicador`, `periodo`).
- Run basic **data consistency checks**:
  - Each region defined in `regiones.csv` has at least one indicator in `indicadores_agendas.csv`.
  - Every indicator used in `indicadores_agendas.csv` appears in `metadatos_agendas.csv`.
- Exit with:
  - Code `0` when all tests pass (including checks that end in **`warn`** — warnings are visible in the report but do not fail the CLI).
  - Non-zero code if any test **fails** or **errors**.

### Catalan CSV alignment

Optional sheets `diccionario_cat.csv` and `metadatos_agendas_cat.csv` are validated in **`warn`** mode only: gaps vs Spanish sources are reported in `docs/csv-integrity/` but never fail `check:csv`. The transform step emits `[catalan]` lines to stdout (including a per-build summary); API responses use `METADATA_CAT` / `DICCIONARIO_CAT` with Spanish fallback via `COALESCE`.

**Direction labels:** spreadsheet `formula` cells that contain direction sentinels (e.g. ↑ / ↓ Ascendente…) are normalized to `METADATA.direction` (`asc` / `desc`). Add new sentinels in `transform/src/transform/direction.ts` (`DIRECTION_MAP_ES` / `DIRECTION_MAP_CAT`) when the client introduces new strings.

**Region grouping (`id_especial2`):** `regiones_cat.csv` is downloaded but not loaded into SQLite; Catalan labels for the closed enum will be handled by frontend i18n (separate change).

### Reports for GitHub Pages

When you run `pnpm run check:csv` from the `transform` directory, the CLI generates:

- `docs/csv-integrity/results.json` – machine-readable summary with:
  - Global totals (tests, passed, failed, errored).
  - A list of individual tests with `id`, `description`, `status` and optional `details`.
- `docs/csv-integrity/index.html` – a static HTML report that:
  - Shows global totals (passed/failed/errored) in a compact summary.
  - Lists each test with its status and any relevant details (missing files, columns, regions without indicators, indicators without metadata, etc.).

The `docs/csv-integrity/` folder is structured so it can be served directly by **GitHub Pages** without any additional build step. A future CI workflow can simply publish this folder so the latest CSV integrity report is always visible on the web.

### Static DB viewer (GitHub Pages)

A small static web app lets you explore the database contents in a browser: agendas (ODS, Agenda Urbana, descriptiva), their hierarchical indicators, and which indicators are available per municipality.

- **Generate data and output**: From the `transform` directory run:
  - `pnpm run build:static-viewer`
- **Inputs**:
  - Database: by default `../output/diputacion_tarragona.db` (create it first with `pnpm run transform`).
  - Municipality sample: optional `config/static-viewer-sample.json` in the repo root. It must contain a `codigo_ine` array with the municipality codes to include (e.g. `["08096", "08121", "08279"]`). If the file is missing or empty, **all municipalities** present in the database are included.
- **Output**: The script writes:
  - `docs/static-db-viewer/data/agendas.json` – hierarchy of agendas and indicators.
  - `docs/static-db-viewer/data/municipios.json` – list of municipalities (according to the sample) with indicator IDs per agenda.
  The existing `index.html` and `assets/` in `docs/static-db-viewer/` are used as-is; the script only updates the `data/` folder.
- **Viewing locally**: The viewer loads data via `fetch`, so it must be served over HTTP. For example:
  - `npx serve docs/static-db-viewer` (or serve the repo root and open `/docs/static-db-viewer/`).
- **GitHub Pages**: Publish the `docs/` folder (or the whole site) so that `static-db-viewer/` is available; no extra build step is required.

## Cross-repository sync to web app

This repository dispatches a cross-repository event to `sdgviz/observatorio-tarragona-web` when the `latest-data` release is published.

- Workflow: `.github/workflows/dispatch-web-data-sync.yml`
- Event type sent: `data_release_published`
- API endpoint used: `POST /repos/sdgviz/observatorio-tarragona-web/dispatches`
- Release assets published together:
  - `diputacion_tarragona.db`
  - `latest-data-source.zip` (custom zip generated in CI to keep source/dataset aligned with the DB)

### Required secret in this repository

- `WEB_REPO_DISPATCH_TOKEN`: fine-grained token with permission to dispatch events in the web repository.

### Payload contract

The dispatch payload includes:

- `source_repository`: `sdgviz/observatorio-tarragona-datos`
- `release_tag`: release tag name (`latest-data` by default)
- `release_id`: GitHub release ID when available

### Troubleshooting

- If the workflow fails at token validation, verify `WEB_REPO_DISPATCH_TOKEN` exists and has not expired.
- If GitHub API returns `404` or `403`, verify repository name and token permissions.
- If no sync run appears in the web repository, confirm the web workflow listens for `repository_dispatch` type `data_release_published`.

