## Why

The SQLite dataset now includes English copy in `DICCIONARIO_EN` and `METADATA_EN` (ingested from `diccionario_en.csv` and `metadatos_agendas_en.csv`). The Nuxt app still exposes only Catalan and Spanish in `@nuxtjs/i18n`, and server APIs resolve dictionary and indicator names using Catalan/Spanish joins only. English-speaking users cannot select a locale or see DB-backed labels in English.

## What Changes

- Register **English (`en`)** as a third locale in `diputacion_tarragona/nuxt.config.ts` (same module as Catalan/Spanish), with `i18n/locales/en.json` providing static UI strings aligned with `es.json` keys.
- Pass **`lang=en`** (or equivalent derived from i18n locale) from the client to **server API handlers** that today branch on `ca`/`es` for `getTranslationJoin` / `getNameExpr`-style SQL.
- Extend SQL for dictionary and metadata (and any other endpoints that already use `*_CAT` / `*_ES`) to **`LEFT JOIN` `DICCIONARIO_EN` / `METADATA_EN`** and use **`COALESCE`** order: English → Catalan → Spanish → id fallback (exact order to match product preference should follow existing `ca`/`es` precedence patterns).
- **Optional parity**: add `/en/...` paths to Nitro prerender route lists where `/ca/...` is already enumerated, so static builds cover English pages if required for deployment.

## Capabilities

### New Capabilities

- `english-interface-localization`: End-to-end English in the Nuxt UI—static messages (`en.json`), i18n registration, and API/SQL resolution of English database fields when the active locale is English.

### Modified Capabilities

- _(none — no existing `openspec/specs/` capability in this repo defines Nuxt app behaviour; data-layer English ingestion is already specified under `english-translations`.)_

## Impact

- **Repository**: `diputacion_tarragona` — `nuxt.config.ts`, `i18n/locales/en.json`, `server/api/**/*.ts`, composables or middleware that forward `lang`, `modules/tarragona-taxonomy` if it reads dictionary names, CSV export or other DB readers that hard-code language joins.
- **Data / DB**: Read-only use of `DICCIONARIO_EN`, `METADATA_EN`; no change to transform pipeline in this change.
- **Dependencies**: None new; uses existing `@nuxtjs/i18n` and `better-sqlite3` (or current DB access).
