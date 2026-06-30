## Context

- **i18n today**: `defaultLocale: "ca"`, locales `ca` + `es`, `strategy: "prefix_and_default"`. Catalan paths are unprefixed as default; Spanish uses `/es/...`. Prerender lists duplicate ODS/AU page routes with a `/ca` prefix.
- **DB today**: Handlers such as `server/api/ods/indicadores.get.ts` and `server/api/au/indicadores.get.ts` use `getTranslationJoin(lang)` and `getNameExpr(lang, ...)` with Catalan (`DICCIONARIO_CAT` / `METADATA_CAT`) and Spanish (`DICCIONARIO_ES` / `METADATA_ES`) only.
- **DB English**: `DICCIONARIO_EN` and `METADATA_EN` exist with the same role as the Catalan tables (sparse `unidad` on metadata); missing EN rows are expected—fallback must mirror existing `COALESCE` behaviour for `ca`/`es`.

## Goals / Non-Goals

**Goals:**

- Third locale **`en`** with **`en.json`** (all keys present that exist in `es.json` for the same UI surface).
- When the user’s i18n locale is **`en`**, API responses that return human-readable dictionary and indicator names (and related descriptive fields) prefer **English columns** from SQLite when available.
- Single, consistent rule for **fallback** when EN is null (documented in code comments once, then applied everywhere).

**Non-Goals:**

- Translating **municipio display names** or other third-party gazetteer strings unless they already have an EN column in scope.
- Changing **default locale** from Catalan.
- Regenerating or modifying **CSV sources** in `diputacion_tarragona_data` (already handled by the data pipeline).

## Decisions

1. **Locale code**  
   Use i18n code **`en`** and BCP 47 **`en-GB`** or **`en`** for `language` field—pick one and match `@nuxtjs/i18n` docs for SEO; prefer **`en-GB`** if the site targets EU English.

2. **API contract**  
   Reuse the existing **`lang` query parameter** (or whatever the ODS/AU/agenda endpoints already accept). Map **`locale === 'en'`** from `useI18n()` / route to **`lang=en`** on `fetch` calls. Do not introduce a parallel header unless an endpoint already lacks `lang`.

3. **SQL shape**  
   Extend `getTranslationJoin` / `getNameExpr` (or extract to **`server/utils/i18n-db.ts`**) so that for `lang === 'en'`:
   - Join `DICCIONARIO_EN den` / `METADATA_EN men` (aliases chosen to avoid clashes).
   - `nombre` expression uses **`COALESCE(den.nombre, dc.nombre, de.nombre, …)`** or the product-approved order. **Decision**: prefer **EN → CA → ES → id** so Catalan remains stronger fallback than Spanish when EN is missing (adjust if product prefers ES second).

4. **Table presence**  
   Use **`sqlite_master`** checks (same pattern as `DICCIONARIO_CAT` in `tarragona-taxonomy`) if any code path must support older DB files without EN tables; otherwise assume EN tables exist in shipped builds.

5. **Prerender**  
   If ISR/prerender must include English static HTML, add **`odsPageRoutesEn`** / **`auPageRoutesEn`** mirroring the `...Ca` arrays. If bundle size or build time is a concern, gate behind env or ship in a follow-up—call out in tasks.

## Risks / Trade-offs

- **[Risk] Large `en.json`** — Maintaining parity with `es.json` is tedious. → **Mitigation**: Copy structure from `es.json`, translate once; CI or a small script can diff keys later.
- **[Risk] Duplicated `getTranslationJoin` per file** — Drift between ODS and AU handlers. → **Mitigation**: Extract shared helpers in `server/utils/` in the same change or immediately after.
- **[Risk] Missing EN DB rows** — UI shows Catalan/Spanish fragments. → **Mitigation**: Acceptable per data spec; optional dev-only logging when `COALESCE` falls past EN.

## Migration Plan

1. Ship DB with EN tables populated (already part of data release).
2. Deploy Nuxt with new locale and API logic; no DB migration in app repo.
3. **Rollback**: Remove `en` from `nuxt.config` and revert API SQL; cached prerendered `/en` routes disappear on next deploy.

## Open Questions

- Exact **`COALESCE`** priority when EN is missing (CA vs ES second) — confirm with product owner once during implementation.
- Whether **all** agenda/descriptivos/proyectos endpoints need `en` in the first slice or can be phased after ODS/AU indicadores.
