## Context

The Nuxt app serves indicator data from a **read-only SQLite** file via Nitro handlers (`/api/ods/indicadores`, `/api/au/indicadores`, etc.). Those handlers intentionally resolve **latest** period per indicator for the interactive UI. Municipality users want a **full-history, long-form CSV** for a single `codigo_ine`, covering **ODS 2030** and **AMT agenda** taxonomies, without presupuestos. Running large dynamic exports against the same DB at request time would add load and complexity; **pre-materializing CSVs during the static build** matches `nuxt generate` and keeps runtime behavior unchanged.

## Goals / Non-Goals

**Goals:**

- During **`nuxt build` / `nuxt generate`**, a **Nitro (or Nuxt) hook** opens the SQLite file once (read-only), iterates municipios to export, and writes **`public/export/csv/<codigo_ine>.csv`** (exact subdirectory name MAY be `export/csv` under `public/`; avoid a leading underscore in folder names unless product requires it).
- CSV content: **long format**, `framework` + `record_type`, **all `periodo` rows** from `INDICADORES` for indicators in scope, plus **historical** rows from `PROMEDIOS_ODS` and `PROMEDIOS_AGENDAS` (for AUE municipios only) for dictionary nodes in scope, aligned with existing API taxonomy rules.
- **Single file per municipio**; bilingual labels via **paired columns** (`nombre_es`, `nombre_ca`, and metadata fields where translations exist) so one artifact serves both locales without doubling file count.
- Municipio ODS page exposes a **static URL** download (e.g. `/export/csv/<ine>.csv`).

**Non-Goals:**

- Presupuestos, descriptivos-only datasets, or proyectos CSV in this export.
- Prerendered JSON API routes as the primary delivery mechanism (optional spike only).
- Shipping the full SQLite download from this change (separate initiative).
- Changing runtime ODS/AU API semantics or SQL in existing `.get.ts` handlers beyond shared helper extraction if explicitly needed.

## Decisions

1. **Build hook vs prerendered API**  
   **Chosen:** Write files directly under `public/export/csv/` from a **`nitro:build:before`** or **`nitro:close`** hook (or `nuxt.hooks` `nitro:init` + generation step) that runs a dedicated TypeScript module.  
   **Rationale:** Avoids CDN/content-type quirks for prerendered “API” responses ([Nuxt `prerenderRoutes` note on headers](https://nuxt.com/raw/docs/4.x/api/utils/prerender-routes.md)). Static files are always served as real CSV paths.  
   **Alternative considered:** `prerenderRoutes('/api/municipio-export/43001')` per INE — rejected as primary path due to header and query-string static mapping uncertainty.

2. **Source of municipio list**  
   **Chosen:** Union of municipios present in **`REGIONES`** with `codigo_ine` not null (or the same set the app treats as valid municipios), consistent with DB integrity. Optionally intersect with **`#nuxt-prepare` catalog** if the product must hide exports for entries not in the picker—**default to DB list** so exports never miss a row the DB contains.  
   **Alternative:** Catalog-only — smaller set but risk of mismatch with DB.

3. **Agenda (AMT) inclusion**  
   **Chosen:** For each municipio, if `REGIONES.id_especial3 = 'aue'` (same rule as `server/api/au/indicadores.get.ts`), include `framework = AGENDA_AMT` rows; otherwise emit **only** `ODS_2030` rows.  
   **Rationale:** Matches user-visible AU data eligibility.

4. **Metropolitan aggregate INE**  
   **Chosen:** If the aggregate appears as a normal row in `REGIONES` / catalog with a dedicated `codigo_ine`, **include** an export file for it using the same rules (ODS always; AU if flagged `aue`).  
   **Open:** If aggregate is synthetic, document INE in spec and treat explicitly.

5. **SQLite access in build**  
   **Chosen:** Reuse **`better-sqlite3`** (already a dependency for server DB) in a **Node-only** build script invoked from the hook; path from **`NUXT_SQLITE_PATH`** or existing `useDatabase` resolution pattern mirrored for build context.  
   **Rationale:** Single query model, same schema as runtime.  
   **Alternative:** Duplicate logic in Python in `diputacion_tarragona_data` — rejected to avoid cross-repo file copying of CSV outputs (user preference).

6. **CSV dialect**  
   **Chosen:** UTF-8 **with** BOM optional (default **no** BOM; enable if Excel compatibility testing fails). Comma separator; RFC-style quoting for fields containing commas/newlines.

7. **Failure mode**  
   **Chosen:** If the DB path is missing or unreadable at build time, **`process.exit(1)`** (fail the build) when `NUXT_PUBLIC_ENABLE_MUNICIPIO_CSV_EXPORT` (or inverse `SKIP_…`) indicates production data release builds must ship with exports. Local dev MAY set env to skip—document in tasks.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Build time grows with municipio count × history size | Stream rows per municipio; avoid N+1 queries by batching indicator lists per framework; measure on CI. |
| Repo / artifact size bloat | Monitor total `public/export/csv` size; consider compression or external hosting in a later change. |
| Schema drift vs APIs | Reuse or extract shared “indicator set per framework” logic from existing handlers, or document parallel SQL that MUST stay aligned with `ods/indicadores` and `au/indicadores` rules. |
| Wrong `Content-Type` | Not applicable for static `/export/csv/*.csv`; verify host serves as `text/csv` or octet-stream acceptable to browsers. |

## Migration Plan

1. Land build hook + generator module behind env gate for one release if needed.
2. Enable by default in CI once DB path is wired.
3. Add UI link on municipio ODS page pointing to `/export/csv/${ine}.csv`.
4. Rollback: remove hook and UI link; delete `public/export/csv` from repo (generated, gitignored) — site behavior unchanged.

## Open Questions

- Exact **metropolitan aggregate** INE handling if not a plain `REGIONES` row.
- Whether **gitignore** + CI artifact attach is preferred over committing generated CSVs (default: **gitignore**, generate every build).
