## Why

The header municipios picker (`MunicipiosPickerModal`) is backed by the full provincial CSV (`municipios_tarragona.csv`). Agenda Urbana (metropolitan) content and APIs only cover municipalities in the **àrea metropolitana** (same cohort as `GET /api/municipios/list` / `REGIONES`). In AU mode, choosing a municipio outside that set navigates to `/municipios/au/[ine]` and yields missing data or **404**, which breaks trust in the picker.

## What Changes

- When the visualization mode is **Agenda Urbana** (not ODS), the municipios picker SHALL list only municipalities that appear in the metropolitan dataset—the same source used for ODS comparison dropdowns (`/api/municipios/list`).
- When the mode is **ODS**, behavior stays **unchanged**: the picker continues to offer the full provincial list (or current ODS behavior).
- Navigation targets remain mode-aware (`/municipios/ods/...` vs `/municipios/au/...`); only the **eligible set of municipios** changes in AU mode.

## Capabilities

### New Capabilities

- `municipios-picker-metropolitan-filter`: Header municipios modal SHALL derive its municipio list from the metropolitan cohort when AU mode is active; search/grouping UX unchanged within that subset.

### Modified Capabilities

- (none) — API contract for `/api/municipios/list` is unchanged; this is client-side selection and routing eligibility only.

## Impact

- **App repo** (`diputacion_tarragona`): `app/components/MunicipiosPickerModal.vue`, likely `useVisualizationStore()` for mode; optional `useFetch('/api/municipios/list')` when AU (with loading/empty handling aligned with existing patterns).
- **Data repo**: OpenSpec artifacts only unless tests/docs reference the picker.
- **No** database or API route changes required.
