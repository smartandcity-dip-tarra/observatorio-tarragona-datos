## 1. Sentinel and routing

- [x] 1.1 Add a single constant and predicate for metropolitan aggregate INE `43` (e.g. `METROPOLITAN_AGGREGATE_INE` and `isMetropolitanAggregateIne`) in the Nuxt app, reused by header, home, and municipio pages.
- [x] 1.2 In `app/pages/muni/ods/[ine].vue`, when the route `ine` is the aggregate sentinel, redirect to `localePath('/muni/au/43')` with replace, before ODS-only data work runs where practical.

## 2. Header mode switch

- [x] 2.1 In `AppHeader.vue` (or a small composable it calls), detect AU municipio route for INE `43` and omit the sticky ODS/AU switch block entirely on that page.
- [x] 2.2 Harden the `isOdsActive` setter so navigation never targets `/muni/ods/43` when the current municipio is the aggregate (defensive guard alongside UI hiding).

## 3. Homepage ODS selection

- [x] 3.1 On `app/pages/index.vue`, ignore map and beeswarm selection updates that would set `selectedIne` to `43` while the visualization store is in ODS mode.
- [x] 3.2 Exclude INE `43` from the home municipio combobox options in ODS mode, or clear selection if `43` would become active (consistent with spec scenarios).
- [x] 3.3 When switching from AU to ODS on `/` while selection is `43`, clear selection (or reassign per existing product rules) so ODS mode never keeps `43` as the unified selected municipio.

## 4. Verification and spec sync

- [x] 4.1 Manually verify: `/muni/ods/43` redirects to AU; home in ODS cannot select `43` via map, beeswarm, or combobox; AU `/muni/au/43` shows no header switch; metropolitan home button still works.
- [x] 4.2 Applied the same INE `43` selection exclusion on `app/pages/ods/[objetivo].vue` (combobox filter, map/beeswarm handlers, explore → AU) for parity without requiring a DB sample in CI.
- [x] 4.3 After implementation, merge requirement text from this change’s delta specs into the canonical files under `openspec/specs/` (`metro-aggregate-municipio-ine43/spec.md` as new file; append ADDED sections to `mode-aware-navigation/spec.md` and `home-municipio-map-beeswarm/spec.md`) per project OpenSpec workflow.
