## Why

Municipio overview charts already show one value per ODS (17 axes) or per Agenda Urbana objective (6 axes), but the center of the radial rose is empty unless the user hovers a wedge. A single **global index** (the average of those axis values) gives an at-a-glance summary comparable across municipios and matches stakeholder expectations for a “headline” score inside the donut.

## What Changes

- Compute a **global index** as the arithmetic mean of the primary municipio’s overview values over the active taxonomy (`axisCount`: 17 for ODS mode, 6 for Agenda Urbana / LE objectives), using the same sanitized 0–100 scale as the rose wedges.
- **Display** that index in the idle center of `OdsRadialOverviewRose.vue` (title + value), for both ODS (`IndicadoresView`) and AU (`Seguimiento`) hosts that already mount this component with `backendOverviewValues` and `axis-count`.
- Add **localized** labels for the global index (ODS vs AU wording may differ); keep existing **hover** behavior that temporarily replaces the center with the hovered axis’s title and value.
- Optionally preserve the existing **`center` slot** for hosts that need to override idle center content (behavior to be defined in design so the slot and default index do not conflict silently).

## Capabilities

### New Capabilities

- _(none — behavior extends the existing radial rose chart capability.)_

### Modified Capabilities

- `ods-radial-overview-chart`: Replace the “placeholder” center requirement with a concrete requirement to show the computed global mean when idle, document interaction with hover and optional `center` slot, and clarify formatting/i18n.

## Impact

- **Frontend (Nuxt app `diputacion_tarragona`)**: `app/components/municipio/ods/presupuestos/charts/OdsRadialOverviewRose.vue`; optional prop/slot tweaks; callers `IndicadoresView.vue` and `Seguimiento.vue` only if new i18n keys or props must be threaded.
- **i18n**: New or extended keys in `ca.json` / `es.json` for the global index label (and AU-specific copy if needed).
- **Data pipeline (`diputacion_tarragona_data`)**: No new CSV or API fields required — the index is derived client-side from values already passed to the chart.
