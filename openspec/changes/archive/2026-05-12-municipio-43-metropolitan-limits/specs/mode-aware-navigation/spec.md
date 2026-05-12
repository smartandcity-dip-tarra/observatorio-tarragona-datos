# mode-aware-navigation

## ADDED Requirements

### Requirement: Header mode switch hidden on AU page for metropolitan aggregate INE

When the user is on the Agenda Urbana municipio detail route for INE `43` only, the global ODS / Agenda Urbana header switch SHALL NOT be shown.

#### Scenario: Metropolitan AU municipio page has no mode switch

- **WHEN** the user is on `/muni/au/43` (or the locale-prefixed equivalent)
- **THEN** the sticky header area SHALL NOT render the ODS / Agenda Urbana switch control
- **AND** other header elements (logo, nav, language) MAY render unchanged

#### Scenario: Other municipio pages still show the switch

- **WHEN** the user is on `/muni/au/<ine>` with `<ine>` not equal to `43`
- **THEN** the header mode switch SHALL remain available per existing requirements

### Requirement: Mode toggle cannot navigate to ODS municipio route for INE 43

When programmatic or residual interactions would navigate from an AU municipio page to `/muni/ods/<ine>` with `ine` equal to `43`, the system SHALL NOT perform that navigation to the ODS municipio URL; the supported detail experience for INE `43` is AU only.

#### Scenario: No ODS municipio target for aggregate INE

- **WHEN** a code path would set navigation target to `/muni/ods/43`
- **THEN** the application SHALL either omit that navigation or redirect to `/muni/au/43` per the metropolitan aggregate routing requirement
- **AND** the user SHALL not end on `/muni/ods/43` as a municipio detail page
