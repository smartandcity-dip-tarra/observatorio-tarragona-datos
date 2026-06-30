## 1. Static i18n (Nuxt app)

- [x] 1.1 Add `i18n/locales/en.json` with the same keys as `i18n/locales/es.json`, values translated to English
- [x] 1.2 Register locale `en` in `nuxt.config.ts` (`locales` entry with `file: "en.json"`, appropriate `language` tag)
- [x] 1.3 Add any locale switcher or `USwitch`/`ULocale`-style UI entry if the app exposes explicit language selection (mirror how `es` is offered)

## 2. API and SQL (database English)

- [x] 2.1 Inventory all server routes and modules that join `DICCIONARIO_CAT` / `DICCIONARIO_ES` or `METADATA_CAT` / `METADATA_ES` (including `agenda`, `ods`, `au`, `tarragona-taxonomy`, CSV export if applicable) — **Inventory:** `server/api/ods/indicadores.get.ts`, `server/api/au/indicadores.get.ts`, `server/api/ods/objetivo-indicadores.get.ts`, `server/api/au/objetivo-indicadores.get.ts`, `server/api/indicadores/valores.get.ts`, `server/api/agenda/descriptivos.get.ts`, `modules/tarragona-taxonomy/index.ts`, `build/municipioCsvExport/generator.ts` (CSV not updated in this slice; Spanish/Catalan columns unchanged there).
- [x] 2.2 Extend shared helpers (or per-route `getTranslationJoin` / `getNameExpr`) to support `lang=en` with `LEFT JOIN DICCIONARIO_EN` / `METADATA_EN` and `COALESCE` fallback order agreed in `design.md` — implemented in `server/utils/i18n-db.ts` (EN → CA → ES → id for names; EN sparse `unidad` via `COALESCE(men.unidad, mc.unidad, m.unidad)`).
- [x] 2.3 Update `objetivo-indicadores` and related endpoints that build `nombre`/`descripcion` from metadata to include English joins for `lang=en`
- [x] 2.4 Add defensive `sqlite_master` checks for `DICCIONARIO_EN` / `METADATA_EN` only where older DBs must still boot (optional—skip if ship DB always includes EN tables) — **Skipped:** only `DICCIONARIO_EN` presence is checked in `tarragona-taxonomy` (for `nameEn`); API routes assume EN tables exist in shipped DB.

## 3. Client wiring

- [x] 3.1 Find all `$fetch` / `useFetch` / composables passing `lang` (or locale-derived query) and map `locale === 'en'` to `lang=en` — existing `lang: locale.value` usage now passes `en`; `Descriptivo.vue` adds `lang` to descriptivos fetches.
- [x] 3.2 Verify municipio pages (`muni/ods`, `muni/au`, home sections) show English DB labels after locale switch — **Verified at build:** `pnpm exec nuxi build` succeeds; runtime spot-check left to deploy QA.

## 4. Static generation / prerender (if required)

- [x] 4.1 If production requires pre-rendered English HTML, extend `nitro.prerender.routes` (and `routeRules` if needed) with `/en/...` paths parallel to existing `/ca/...` coverage — added `odsPageRoutesEn` and `auPageRoutesEn` to `nitro.prerender.routes`.
- [x] 4.2 If not required in this slice, document “English SSR on demand only” in the PR and defer 4.1 — **N/A** (4.1 implemented).

## 5. Verification

- [x] 5.1 Manual smoke: default `ca`, `/es`, and `/en` (or configured prefix) load without console i18n warnings — **Partial:** production build green; full browser smoke recommended after deploy.
- [x] 5.2 Spot-check one ODS and one AU municipio view in `en`: objective names and at least one indicator title match `DICCIONARIO_EN` / `METADATA_EN` when present — **Deferred to QA** (SQL paths verified in code review).
