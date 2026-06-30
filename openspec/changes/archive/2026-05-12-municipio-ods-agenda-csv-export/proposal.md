## Why

Municipality staff and citizens need a **single, portable extract** of ODS 2030 and Agenda Metropolitana (AMT) indicator history for **their** municipio, without running heavy ad hoc queries against the read-only SQLite used at runtime. A **build-time** export keeps the live database path simple and avoids extra load during browsing.

## What Changes

- Add a **Nuxt/Nitro build hook** (runs during `nuxt build` / `nuxt generate`) that reads the **same SQLite snapshot** used for production (path supplied at build time), and writes **one UTF-8 CSV per `codigo_ine`** under `public/export/csv/` (static after deploy).
- Each CSV contains **full longitudinal history** for indicators and roll-ups that belong to ODS 2030 and, where applicable, AMT agenda taxonomy; **presupuestos are excluded**.
- The municipio ODS page (and optionally AU page) gains a **download control** pointing at the static file URL (no dynamic CSV generation on request).
- **Separate** “full database for analysts” remains out of scope for this change (can be a follow-up); this change is only the **per-municipio CSV** pipeline.

## Capabilities

### New Capabilities

- `municipio-csv-export`: Build-time generation of static per-municipio CSV files (path, schema, inclusion rules, locale columns, metropolitan aggregate), CI/build contract for the DB file, and UI link from the Nuxt municipio ODS flow.

### Modified Capabilities

- _(none — existing ODS/AU API behavior and SQLite schema are unchanged; this is additive static output and UI.)_

## Impact

- **`diputacion_tarragona`**: `nuxt.config` / Nitro hooks or a small build script module; `public/export/csv/` generated assets; i18n strings; link on `app/pages/muni/ods/[ine].vue` (and optional parity on AU page).
- **`diputacion_tarragona_data`**: No new CSV sources required if the hook reads the shipped DB; release docs may note that **Nuxt CI must receive the built `diputacion_tarragona.db`** (or equivalent) before static generation.
- **Deploy / hosting**: Larger static payload (one file per municipio); Netlify or similar must include `public/export/csv/**` in the published site.
