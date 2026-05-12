## Why

The Nuxt app currently imports `app/assets/data/municipios_tarragona.csv` in municipio pages while other flows use SQLite `REGIONES` via `GET /api/municipios/list`. That duplicates the municipal catalog, risks drift, and encourages extra runtime work. Loading the catalog once at **build time** with **[Nuxt Prepare](https://nuxt-prepare.byjohann.dev)** aligns the client with the same database snapshot shipped in the server bundle and removes redundant CSV maintenance for UI consumption.

## What Changes

- Add **`nuxt-prepare`** to the Nuxt app and implement a **`defineNuxtPrepareHandler`** that queries **`REGIONES`** (same shape/columns as `GET /api/municipios/list`) from the bundled SQLite file used at build time.
- Expose the result as typed prepare state (importable from `#nuxt-prepare` per module docs) for components and pages that today import **`municipios_tarragona.csv`**.
- Replace **static CSV imports** in **`app/pages/municipios/ods/[ine].vue`** and **`app/pages/municipios/au/[ine].vue`** (and any other first-party consumers) with the prepare-backed catalog.
- **Remove** `app/assets/data/municipios_tarragona.csv` from the app repo **once** nothing references it; update or retire any data-pipeline scripts that only existed to refresh that file into the app (coordinate with `diputacion_tarragona_data` if paths are documented).
- Optionally refactor **`MunicipiosPickerModal`** (and other `useFetch('/api/municipios/list')` call sites) to use the prepare catalog for **zero extra HTTP** for the static list — scoped in tasks if not combined with this change in one PR.
- Document CI requirement: **`nuxt build` / `nuxt prepare`** must run with the SQLite file present (same as today for server routes).

## Capabilities

### New Capabilities

- `municipios-catalog-nuxt-prepare`: Build-time municipal catalog from `REGIONES` exposed via Nuxt Prepare for client/server bundles; replaces CSV imports for in-app catalog consumers.

### Modified Capabilities

- (none) — `GET /api/municipios/list` contract and SQL behavior stay the same; only client-side sourcing of the catalog for prepared consumers changes.

## Impact

- **Primary repo:** `diputacion_tarragona` — `nuxt.config.ts`, new prepare handler, page/components, `package.json` / lockfile for `nuxt-prepare`, removal of CSV asset when unused.
- **Data repo:** `diputacion_tarragona_data` — OpenSpec artifacts only unless pipeline docs reference the removed CSV path.
- **External:** [Nuxt Prepare](https://nuxt-prepare.byjohann.dev) as a Nuxt module dependency.
