## Why

The homepage hero block (`index.vue`) uses a single set of i18n keys (`home.caption`, `home.title`, `home.description`) for both visualization modes. When users toggle between ODS and Agenda Urbana (AUE), the introductory text no longer matches the dataset and geography (province-wide ODS vs metropolitan AUE), which weakens clarity and trust.

## What Changes

- Split homepage hero copy into **two** message sets: one for **ODS** mode and one for **Agenda Urbana / AUE** mode, driven by the same `visualizationStore` mode already used for the map and selector.
- Replace the Spanish strings with the stakeholder copy provided for each mode; add **Catalan** equivalents in `ca.json` and `es.json`.
- Keep layout and semantics (caption line, `h1`, body paragraph) unchanged; only the bound i18n keys or key paths switch with mode.

## Capabilities

### New Capabilities

- `home-hero-mode-copy`: Homepage hero visible text (caption, title, description) SHALL depend on visualization mode (ODS vs AU/AUE): distinct copy in Spanish and Catalan, switching when the header mode toggle updates the store on `/`.

### Modified Capabilities

- `mode-aware-navigation`: Extend requirements so the homepage hero text is explicitly part of mode-aware behavior on `/` (aligned with the existing scenario that the map section reacts to the toggle).

## Impact

- **App repo** (`diputacion_tarragona`): `app/pages/index.vue` (template bindings), `i18n/locales/es.json`, `i18n/locales/ca.json`.
- **No API or data pipeline changes.**
