## Context

`MunicipiosPickerModal` imports `~/assets/data/municipios_tarragona.csv`, listing all municipalities in the province. Agenda Urbana municipio pages (`/municipios/au/[ine]`) and related APIs are scoped to the metropolitan cohort in SQLite `REGIONES`, exposed as `GET /api/municipios/list`. The ODS municipio comparison UI already loads that endpoint (`IndicadoresView.vue`). The header picker ignores visualization mode and always uses the provincial CSV, so users in Agenda Urbana mode can select municipios outside the metropolitan area and hit empty states or **404**.

## Goals / Non-Goals

**Goals:**

- In **Agenda Urbana** visualization mode, restrict the picker list to the same municipio set as `GET /api/municipios/list` (aligned with comparison dropdowns and REGIONES).
- Preserve existing UX for that subset: accent-insensitive search, grouping by initial letter, modal close behavior.
- In **ODS** mode, keep the full static CSV list without adding a network dependency for the default case.

**Non-Goals:**

- Changing `GET /api/municipios/list` or REGIONES data.
- Adding NMUN or comarca-style filters to the header picker.
- Refactoring unrelated header or navigation code beyond what the modal needs for correct routes and list source.

## Decisions

1. **AU list source: `GET /api/municipios/list`**

   Matches comparison selectors and the metropolitan definition already modeled in the DB. Alternatives (trimmed static CSV or client-side filtering of the provincial CSV by a duplicated INE list) would add sync burden.

2. **Mode from `useVisualizationStore()`**

   The header toggle already drives global mode; the modal reads the store so `AppHeader` does not need new props.

3. **Loading and errors**

   While AU list data is loading, show a concise loading state consistent with other small lists in the app. On failure, show an inline error and do not render navigational links to arbitrary INEs.

4. **Routes from the picker**

   Navigation targets SHALL follow visualization mode: `/municipios/ods/[ine]` in ODS mode and `/municipios/au/[ine]` in AU mode. Use `localePath()` where the rest of the header uses localized routes.

## Risks / Trade-offs

- **Extra request when opening the picker in AU mode** → Acceptable: list is small and cacheable; consider `useFetch` with a stable key so results reuse across sessions.

- **Stale client cache if REGIONES changes** → Same as any consumer of `/api/municipios/list`; deployment already refreshes the DB bundle.

## Migration Plan

Deploy as a normal frontend change: no DB migration, no API version change. Rollback by reverting the modal component.

## Open Questions

- None blocking implementation; copy for loading/error strings should follow existing i18n keys where possible.
