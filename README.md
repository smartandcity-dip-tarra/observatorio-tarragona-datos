## Transform pipeline and CSV integrity checks

This repository contains the data transformation pipeline that converts the Diputación de Tarragona CSV dataset into a normalized SQLite database, plus a lightweight CSV integrity check CLI.

## GitHub Actions workflows

Two workflows run in this repository. Together they refresh data from Google Sheets, validate and transform it, and publish a release. Web sync is triggered manually for now.

```text
Google Sheets
      │
      ▼
Update dataset  ──►  GitHub Release (latest-data)
      │
      └─ commit dataset/

Dispatch web data sync  ──►  observatorio-tarragona-web  (manual only, for now)
```

### `Update dataset` (`.github/workflows/update-dataset.yml`)

**Triggers:** every Monday at 06:00 UTC (`cron`), or manually via **Actions → Update dataset → Run workflow**.

**Steps:**

| Step | What it does |
|------|----------------|
| 1. Download | Python 3.11 runs `pullAndBuild/download_and_build.py` — pulls Google Sheets and writes `dataset/*.csv` |
| 2. Commit | Commits and pushes `dataset/` when CSVs changed (`chore(data): update dataset from Google Sheets`) |
| 3. Check | Node 22 + pnpm 10.29.3 — `pnpm run check:csv` in `transform/` |
| 4. Transform | `pnpm run transform` → `output/diputacion_tarragona.db` |
| 5. Zip | `latest-data-source.zip` containing **`dataset/` only** (CSVs aligned with the DB build) |
| 6. Release | Updates GitHub Release tag **`latest-data`** with `diputacion_tarragona.db` and `latest-data-source.zip` |
| 7. Artifact | Uploads `csv-integrity-report` (integrity HTML/JSON + step logs) — downloadable from the Actions run |

**What CI does *not* do:**

- Does **not** commit `output/diputacion_tarragona.db` to git (only the release binary).
- Does **not** commit `docs/csv-integrity/` (reports live in the workflow artifact).
- Does **not** build or deploy GitHub Pages (no static viewer step).

**Required secret:** `GOOGLE_CREDENTIALS_JSON` — Google service account JSON for Sheets access.

**Release download URLs (stable):**

- `https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/releases/download/latest-data/diputacion_tarragona.db`
- `https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/releases/download/latest-data/latest-data-source.zip`

### `Dispatch web data sync` (`.github/workflows/dispatch-web-data-sync.yml`)

**Triggers:** manual only via **Actions → Dispatch web data sync → Run workflow**. Automatic dispatch on `latest-data` release publish is temporarily disabled.

Sends a `repository_dispatch` event (`data_release_published`) to `sdgviz/observatorio-tarragona-web`. The web repository then downloads the release assets, runs tests, commits the DB and dataset into `dev`, and triggers Netlify.

**Required secret:** `WEB_REPO_DISPATCH_TOKEN` — fine-grained token with permission to dispatch events in the web repository.

**Payload fields:**

- `source_repository`: `smartandcity-dip-tarra/observatorio-tarragona-datos`
- `release_tag`: `latest-data` (default)
- `release_id`: GitHub release ID when available
- `target_env`: `dev` (default)

**Troubleshooting dispatch:**

- Token validation fails → check `WEB_REPO_DISPATCH_TOKEN` exists and has not expired.
- GitHub API `404` / `403` → verify repository name and token permissions.
- No sync run in the web repo → confirm `.github/workflows/sync-data-release.yml` listens for `data_release_published`.

---

## Local development

### CSV integrity checks

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

Use `pnpm@10.29.3` (see `transform/package.json` → `packageManager`).

### Transform to SQLite

```bash
cd transform && pnpm install && pnpm run transform
```

Output: `output/diputacion_tarragona.db`

### Catalan CSV alignment

Optional sheets `diccionario_cat.csv` and `metadatos_agendas_cat.csv` are validated in **`warn`** mode only: gaps vs Spanish sources are reported in `docs/csv-integrity/` but never fail `check:csv`. The transform step emits `[catalan]` lines to stdout (including a per-build summary); API responses use `METADATA_CAT` / `DICCIONARIO_CAT` with Spanish fallback via `COALESCE`.

**Direction labels:** spreadsheet `formula` cells that contain direction sentinels (e.g. ↑ / ↓ Ascendente…) are normalized to `METADATA.direction` (`asc` / `desc`). Add new sentinels in `transform/src/transform/direction.ts` (`DIRECTION_MAP_ES` / `DIRECTION_MAP_CAT`) when the client introduces new strings.

**Region grouping (`id_especial2`):** typology slugs are stored in SQLite; display labels per locale are resolved by frontend i18n (`regionFilter.idEspecial2Typology`).

### Integrity reports

`check:csv` writes locally to `docs/csv-integrity/`:

- `results.json` — machine-readable summary (totals + per-test status/details).
- `index.html` — static HTML report.

In **CI**, the same files are included in the **`csv-integrity-report`** workflow artifact (not committed to git). Download them from the Actions run summary after **Update dataset** completes.

### Static DB viewer (local only, optional)

Not part of the GitHub pipeline. Useful for manually exploring the database in a browser.

- **Generate data**: `cd transform && pnpm run build:static-viewer`
- **Database input**: `../output/diputacion_tarragona.db` (run `pnpm run transform` first).
- **Municipality sample**: optional `config/static-viewer-sample.json` with a `codigo_ine` array; if missing, all municipalities are included.
- **Output**: updates `docs/static-db-viewer/data/*.json` (existing `index.html` and `assets/` are reused).
- **View locally**: serve over HTTP, e.g. `npx serve docs/static-db-viewer`.
