# home-hero-mode-copy

## Purpose

Homepage hero introductory copy is mode-specific (ODS vs Agenda Urbana / AUE) and fully internationalized in Spanish and Catalan.

## Requirements

### Requirement: Mode-specific homepage hero i18n groups

The application SHALL define `home.hero.ods` and `home.hero.au` in `i18n/locales/es.json` and `i18n/locales/ca.json`. Each group SHALL include `title` and `description` string keys. Each group MAY include `caption`; when `caption` is empty or absent for a locale, the homepage SHALL not render the upper caption line so the main heading remains a single `h1` from `title`. The homepage hero SHALL resolve these keys from the `ods` group when the visualization store is in ODS mode and from the `au` group when it is in Agenda Urbana (AUE) mode.

#### Scenario: Spanish ODS strings

- **WHEN** the active locale is Spanish and the store is in ODS mode
- **THEN** `home.hero.ods.title` SHALL be exactly `Visor de Indicadores de Desarrollo Sostenible de la Diputación de Tarragona`
- **AND** `home.hero.ods.description` SHALL be exactly two paragraphs in one string: first `Esta herramienta permite consultar y analizar los indicadores de desarrollo sostenible de los municipios de la provincia.`, then a paragraph break, then `A través de mapas interactivos y visualizaciones comparativas, facilita el seguimiento de la evolución territorial y la comprensión de las dinámicas locales.`

#### Scenario: Spanish AUE strings

- **WHEN** the active locale is Spanish and the store is in AU mode
- **THEN** `home.hero.au.title` SHALL be exactly `Visor de Indicadores de la Agenda Urbana Española (AUE)`
- **AND** `home.hero.au.description` SHALL be exactly two paragraphs in one string: first `Consulta los indicadores de la Agenda Urbana Española con una visión comparativa entre municipios del Área Metropolitana de Tarragona.`, then a paragraph break, then `Navega por el territorio, analiza la evolución de cada municipio y detecta tendencias mediante mapas interactivos y visualizaciones diseñadas para una lectura ágil.`

#### Scenario: Catalan ODS strings

- **WHEN** the active locale is Catalan and the store is in ODS mode
- **THEN** `home.hero.ods.title` SHALL be exactly `Visor d'Indicadors de Desenvolupament Sostenible de la Diputació de Tarragona`
- **AND** `home.hero.ods.description` SHALL be exactly two paragraphs in one string: first `Aquesta eina permet consultar i analitzar els indicadors de desenvolupament sostenible dels municipis de la província.`, then a paragraph break, then `Mitjançant mapes interactius i visualitzacions comparatives, facilita el seguiment de l'evolució territorial i la comprensió de les dinàmiques locals.`

#### Scenario: Catalan AUE strings

- **WHEN** the active locale is Catalan and the store is in AU mode
- **THEN** `home.hero.au.title` SHALL be exactly `Visor d'Indicadors de l'Agenda Urbana Espanyola (AUE)`
- **AND** `home.hero.au.description` SHALL be exactly two paragraphs in one string: first `Consulta els indicadors de l'Agenda Urbana Espanyola amb una visió comparativa entre municipis de l'Àrea Metropolitana de Tarragona.`, then a paragraph break, then `Navega pel territori, analitza l'evolució de cada municipi i detecta tendències mitjançant mapes interactius i visualitzacions dissenyades per a una lectura àgil.`

### Requirement: Legacy single-mode hero keys removed from use

The homepage hero SHALL NOT use `home.caption`, `home.title`, nor `home.description` as translation keys. Those keys SHALL be removed from locale files unless another screen still references them.

#### Scenario: Home template uses hero mode keys only

- **WHEN** a reader inspects `app/pages/index.vue` hero bindings
- **THEN** the hero SHALL resolve `home.hero.ods.*` or `home.hero.au.*` according to `useVisualizationStore()` mode, not the legacy three keys

### Requirement: Description paragraph breaks preserved

The hero description element SHALL preserve the two-paragraph layout from the locale string (for example via `whitespace-pre-line` on a single `p`, or two `p` elements bound from one message using an agreed delimiter).

#### Scenario: Line break visible between paragraphs

- **WHEN** the home hero is rendered in either mode and locale
- **THEN** the user SHALL see two distinct paragraphs in the description area matching the line break in the locale `description` value
