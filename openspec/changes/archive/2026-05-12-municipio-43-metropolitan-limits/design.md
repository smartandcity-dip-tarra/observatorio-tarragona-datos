## Context

The Nuxt app treats INE `43` as a catalog row with special copy on AU and ODS municipio pages, but routing and the global mode switch still follow the generic municipio rules. The product decision is to keep a single aggregate pseudo-municipio (no extensible registry), centralize the sentinel in one helper or constant, and adjust only navigation and selection UX.

## Goals / Non-Goals

**Goals:**

- Hard-redirect `/muni/ods/43` to `/muni/au/43` so bookmarks and stray links converge on the supported experience.
- Prevent INE `43` from becoming the homepage unified selection while the store is in ODS mode; metropolitan entry remains the dedicated home control.
- Hide the ODS/AU header switch when the current route is the AU municipio detail page for INE `43`.

**Non-Goals:**

- Generalizing to other pseudo-INE codes or data-driven capability flags.
- Removing INE `43` from the static catalog or APIs.
- Changing ODS goal pages (`/ods/{n}`) selection rules unless the same unified-selection bug can select `43` there; if `43` cannot appear in ODS goal datasets, no change required beyond home.

## Decisions

1. **Single sentinel** — One exported constant (e.g. `METROPOLITAN_AGGREGATE_INE = '43'`) plus a tiny predicate `isMetropolitanAggregateIne(ine: string)` in `utils/` or `composables/`, imported by pages, header, and home selection handlers. No new Pinia state.

2. **Redirect placement** — Prefer `navigateTo` in `muni/ods/[ine].vue` setup when `ine === METROPOLITAN_AGGREGATE_INE` (replace: true, preserve locale) so client and SSR behave consistently without a separate middleware file unless the project already uses route middleware for similar cases.

3. **Header switch visibility** — Derive from `useRoute()` in `AppHeader.vue` (or a thin composable): when path matches AU municipio page for aggregate INE, omit the sticky switch block entirely. No disabled switch with tooltip (product choice: hidden).

4. **Home ODS selection** — Filter at selection boundaries: ignore map/beeswarm emits for `43` in ODS mode; exclude `43` from combobox items when store is ODS (or block selection with immediate clear). On mode transition AU → ODS, if `selectedIne === '43'`, clear selection so explore and highlights do not imply an ODS municipio page for `43`.

5. **Toggle handler safety** — Even with the switch hidden on `/muni/au/43`, guard the existing `isOdsActive` setter so a programmatic flip cannot push `/muni/ods/43` for that INE (defensive consistency).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| SSR redirect loop or double fetch on ODS page | Run redirect before ODS-only `useAsyncData` keys fire, or use `abortNavigation`-style early exit per Nuxt 4 patterns. |
| Combobox shows empty after mode switch | Acceptable; user re-selects or uses metropolitan link. Optionally document in QA. |
| ODS goal page could still list `43` in data | Verify promedios payload; if `43` appears, apply the same selection guard as on home. |

## Migration Plan

Deploy with the Nuxt app only; no database migration. Existing `/muni/ods/43` URLs redirect client-side/SSR to AU.

## Open Questions

- Whether ODS goal pages need the same selection exclusion if `43` appears in beeswarm data (confirm with a quick sample or API response).
