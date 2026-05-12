# metro-aggregate-municipio-ine43

## Purpose

Normative behavior for the single metropolitan aggregate pseudo-municipio identified by INE `43` (Tarragona metropolitan area): no ODS municipio detail route; redirect to AU detail.

## ADDED Requirements

### Requirement: ODS municipio detail URL redirects to AU for INE 43

The system SHALL NOT present a stable ODS municipio detail page for INE `43`. Any navigation to the ODS municipio route for that INE SHALL be replaced by navigation to the AU municipio route for the same INE, preserving the active locale prefix rules used elsewhere.

#### Scenario: Direct access to ODS metropolitan URL

- **WHEN** a user requests `/muni/ods/43` (or the same path with a leading locale segment such as `/ca/muni/ods/43`)
- **THEN** the application SHALL redirect to `/muni/au/43` (or the locale-prefixed equivalent)
- **AND** the user SHALL NOT remain on the ODS municipio detail route for INE `43`

#### Scenario: Redirect is canonical user-facing behavior

- **WHEN** redirect completes
- **THEN** the browser location SHALL show the AU municipio URL for INE `43`
