## Why

INE code `43` represents the aggregated Tarragona metropolitan area, not a single municipality. It has an Agenda Urbana (AU) detail experience but no meaningful ODS municipio dataset or route. Today users can still land on `/muni/ods/43`, toggle ODS from the AU page, or select `43` from the home map in ODS mode, which is confusing and inconsistent with the dedicated entry point for the metropolitan area on the home page.

## What Changes

- **Redirect**: Visiting `/muni/ods/43` (with locale prefix as applicable) SHALL redirect to the AU municipio detail route for the same INE (`/muni/au/43`).
- **Home ODS selection**: On the homepage in ODS mode, unified selection (combobox, map clicks, beeswarm clicks) SHALL NOT set or keep INE `43` as the selected municipio. Users reach the metropolitan aggregate via the existing dedicated home control, not via ODS map selection.
- **Header**: On the AU municipio detail page for INE `43`, the global ODS / Agenda Urbana header switch SHALL be hidden (no mode flip for this pseudo-municipio).
- **Single sentinel**: No catalog of pseudo-municipios; one well-named constant or helper for INE `43` in the Nuxt app is sufficient.

## Capabilities

### New Capabilities

- `metro-aggregate-municipio-ine43`: Routing, home selection rules, and header chrome for the metropolitan aggregate INE `43` only.

### Modified Capabilities

- `mode-aware-navigation`: Extend requirements so the header mode switch is omitted on the metropolitan aggregate AU municipio page, and document interaction with the ODS municipio redirect for `43`.
- `home-municipio-map-beeswarm`: Extend unified-selection requirements so INE `43` is excluded from ODS-mode selection on the homepage (including mode switches that would otherwise leave `43` selected).

## Impact

- **Application**: `diputacion_tarragona` — `app/pages/muni/ods/[ine].vue` (redirect), `app/pages/index.vue` (and any shared selection helpers), `app/components/AppHeader.vue` (or a small composable used by the header layout), possibly `MapWrapper` / beeswarm / combobox wiring on the home map only.
- **Data**: No CSV or SQLite changes; catalog may still list `43`; behavior is UI and routing only.
