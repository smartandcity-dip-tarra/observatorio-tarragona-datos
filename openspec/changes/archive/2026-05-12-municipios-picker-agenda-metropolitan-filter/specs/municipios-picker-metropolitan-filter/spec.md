## ADDED Requirements

### Requirement: Picker uses metropolitan list in Agenda Urbana mode

When the global visualization mode is Agenda Urbana, the municipios picker SHALL populate its list exclusively from the same metropolitan cohort as `GET /api/municipios/list` (SQLite `REGIONES`). The picker SHALL NOT offer municipalities that exist only in the full provincial catalog but not in that cohort.

#### Scenario: AU mode uses metropolitan municipios only

- **WHEN** the user opens the municipios picker while visualization mode is Agenda Urbana
- **THEN** every municipio shown (`codigo_ine` / `nombre`) corresponds to a row returned by `GET /api/municipios/list` without filters

#### Scenario: ODS mode keeps full provincial list

- **WHEN** the user opens the municipios picker while visualization mode is ODS
- **THEN** the picker SHALL continue to use the full provincial municipio list as today (e.g. bundled CSV), without requiring `GET /api/municipios/list` for that path

### Requirement: Picker navigation matches visualization mode

Links and programmatic navigation from the picker SHALL target `/municipios/ods/[codigo_ine]` when mode is ODS and `/municipios/au/[codigo_ine]` when mode is Agenda Urbana, respecting locale-prefixed routing where the app uses `localePath`.

#### Scenario: Choosing a municipio in AU mode opens AU page

- **WHEN** the user selects a municipio from the picker in Agenda Urbana mode
- **THEN** the application navigates to the Agenda Urbana municipio route for that `codigo_ine`
- **AND** the modal closes

#### Scenario: Choosing a municipio in ODS mode opens ODS page

- **WHEN** the user selects a municipio from the picker in ODS mode
- **THEN** the application navigates to the ODS municipio route for that `codigo_ine`
- **AND** the modal closes

### Requirement: Search and grouping unchanged within the active list

Accent-insensitive search and grouping by initial letter SHALL apply to whichever list is active (full provincial list in ODS, metropolitan list in AU). Empty search results SHALL show the existing no-results state.

#### Scenario: Search filters the active cohort

- **WHEN** the user types in the picker search field
- **THEN** only municipios in the active list whose names match the filter are shown
- **AND** grouping by letter updates to reflect the filtered subset
