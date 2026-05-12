## 1. Radial rose — global index

- [x] 1.1 Add a `computed` that returns the arithmetic mean of `sanitizedValues` over `axisCount` (reuse the same per-index sanitization as wedge length: finite numbers clamped to 0–100, non-finite treated as 0).
- [x] 1.2 Add a prop for the **idle** global-index title i18n key (default to the ODS-oriented key used by `IndicadoresView`); keep `centerIndexTitleKey` for per-axis hover only.
- [x] 1.3 Update the center `<g>`: when an axis is hovered, keep existing hover title/value; else if the `center` slot has content, render the slot; else render the global index title plus the formatted mean (locale / fraction digits aligned with outside-label value formatting).
- [x] 1.4 Add brief in-file documentation (comment or prop JSDoc) describing idle vs hover vs slot precedence.

## 2. Hosts and locales

- [x] 2.1 Add Catalan and Spanish i18n entries for the ODS global index center title.
- [x] 2.2 Add Catalan and Spanish i18n entries for the Agenda Urbana / six-objective global index center title.
- [x] 2.3 In `Seguimiento.vue`, pass the AU-specific title key prop on `MunicipioOdsPresupuestosChartsOdsRadialOverviewRose`; confirm `IndicadoresView.vue` relies on the default ODS key (or passes it explicitly for clarity).

## 3. Verification

- [x] 3.1 Manually verify ODS municipio overview (radial mode, no comparison): center shows the mean of seventeen values; hovering a wedge or label restores per-axis center content.
- [x] 3.2 Manually verify AU `Seguimiento` radial overview: center shows the mean of six values and AU-appropriate title copy.
- [x] 3.3 If a small pure function is extracted for the mean, add a focused unit test under `test/`; otherwise skip.
