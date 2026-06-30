## Why

The `regiones_cat` Google Sheets tab was removed from the source spreadsheet, so `pullAndBuild/download_and_build.py` now emits a warning on every run. The file was never ingested into SQLite — `id_especial2` typology labels are resolved by the frontend via i18n keyed on slugs stored in `REGIONES`. Keeping the download entry adds noise without value.

## What Changes

- Remove `regiones_cat` from the `SHEETS` dict in `pullAndBuild/download_and_build.py`.
- Update active specs (`catalan-translations`, `data-transformation`) to stop mandating download or presence of `regiones_cat.csv`.
- Delete stale `dataset/regiones_cat.csv` and the unused Nuxt test fixture `test/dataset/regiones_cat.csv`.
- Refresh comments in `transform/src/parse/regiones.ts` and `README.md`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `catalan-translations`: Catalan translation source files SHALL be only `diccionario_cat` and `metadatos_agendas_cat` — remove `regiones_cat` from download requirements and related scenarios.
- `data-transformation`: Replace "regiones_cat is not ingested" with a requirement that `REGIONES` comes solely from `regiones.csv` and `id_especial2` labels are consumer i18n — no `regiones_cat.csv` expected in the dataset.

## Impact

- **Download script** (`pullAndBuild/download_and_build.py`): one fewer sheet fetched; warning eliminated.
- **Dataset**: `regiones_cat.csv` removed from disk.
- **Transform / SQLite**: no behavioral change (already ignored).
- **Frontend** (`diputacion_tarragona`): no code changes; orphaned test fixture removed only.
