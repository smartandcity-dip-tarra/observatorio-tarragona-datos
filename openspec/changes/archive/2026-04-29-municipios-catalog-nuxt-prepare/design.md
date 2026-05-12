## Context

The Nuxt app (`diputacion_tarragona`) still imports `municipios_tarragona.csv` in municipio detail pages for names/lookup, while `REGIONES` in SQLite is the authority for `GET /api/municipios/list` and server APIs. [Nuxt Prepare](https://nuxt-prepare.byjohann.dev) runs async code at build time and exposes typed state via `#nuxt-prepare`, giving **zero runtime cost** for embedding the catalog in the client bundle.

## Goals / Non-Goals

**Goals:**

- Add the `nuxt-prepare` Nuxt module and a **single** `defineNuxtPrepareHandler` that loads all `REGIONES` rows (equivalent to the unfiltered `GET /api/municipios/list` result shape / `Municipio` type).
- Replace every in-app import of `municipios_tarragona.csv` with the prepare-exported catalog.
- Remove the CSV from `app/assets/data/` when no longer referenced.
- Keep **one** column set aligned with the API (including `id_especial3` for AU filtering).

**Non-Goals:**

- Changing SQL in `server/api/municipios/list.get.ts` or the `NMUN` filter behavior (unless a small shared helper is extracted without API contract change).
- Replacing all `useFetch('/api/municipios/list')` in a single pass (optional follow-up: picker and comparison UIs can switch to prepare in the same or a second change).

## Decisions

1. **Module: `nuxt-prepare` (johannschopplich)**  
   **Rationale:** Matches the user’s prior use and official patterns for `defineNuxtPrepareHandler` and `#nuxt-prepare` imports.  
   **Alternatives:** Build script that generates a checked-in JSON/TS file — second artifact to keep in sync; Vite `import raw` of JSON from a prebuild step — more custom wiring.

2. **Build-time DB read: `better-sqlite3` + `readFileSync` on `server/assets/dbfile/diputacion_tarragona.db`** (path resolved from project root, same file the app ships for server routes).  
   **Rationale:** Same schema as production; no HTTP at prepare time.  
   **Alternatives:** Call internal API during prepare — not available in all CI contexts; duplicate export from data repo — reintroduces a second file unless CSV is deleted everywhere.

3. **Query:** `SELECT * FROM REGIONES` (or explicit column list matching `Municipio` / API response) ordered deterministically (e.g. `codigo_ine`) for stable diffs.  
   **Rationale:** Parity with list endpoint default branch.

4. **Typing:** Reuse `Municipio` / `MunicipioListResponse` from `~/types/municipios.ts` in the prepare handler output shape.  
   **Rationale:** One TypeScript contract for API and prepare.

5. **Consumption:** Pages/components `import { … } from '#nuxt-prepare'` (exact export names per module docs — e.g. a single `municipiosCatalog` array).  
   **Rationale:** Documented module API; tree-shaking friendly if exports are explicit.

## Risks / Trade-offs

- **Catalog stale until rebuild** → Mitigation: same as any static asset; DB updates already imply redeploy; document in release checklist.
- **CI/build must include `.db`** → Mitigation: already required for Nitro/SQLite routes; fail prepare if DB missing (clear error).
- **`better-sqlite3` native addon in prepare context** → Mitigation: ensure Node/OS matches CI; if prepare fails on edge runners, fallback option is a small Node script that emits JSON consumed by prepare (document in tasks if hit).

## Migration Plan

1. Add dependency and module to `nuxt.config.ts`.  
2. Implement prepare handler; verify `nuxt prepare` / `nuxt build` locally.  
3. Swap imports on municipio pages; run typecheck/tests.  
4. Delete `municipios_tarragona.csv`; grep for references; update data-repo docs/scripts that copy CSV into the app.  
5. Rollback: revert commits and restore CSV import paths.

## Open Questions

- Whether to **deduplicate** `MunicipiosPickerModal`’s `useFetch('/api/municipios/list')` in the same PR or a follow-up (proposal marks optional).
