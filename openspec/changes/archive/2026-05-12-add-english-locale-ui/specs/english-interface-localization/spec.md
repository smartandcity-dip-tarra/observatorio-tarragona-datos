## ADDED Requirements

### Requirement: English is a selectable Nuxt i18n locale

The application SHALL register locale code `en` in `@nuxtjs/i18n` with a dedicated message file and a stable URL prefix consistent with other non-default locales.

#### Scenario: English appears in locale configuration

- **WHEN** a developer inspects `nuxt.config.ts` i18n `locales` array
- **THEN** it SHALL include an entry for `en` with `file` pointing to `en.json` under the project’s i18n locales directory

#### Scenario: English messages load without missing-key errors for mirrored keys

- **WHEN** the active locale is `en` and the UI renders keys that exist in `es.json`
- **THEN** each such key SHALL resolve from `en.json` (no fallback warning for keys that were copied and translated from Spanish)

### Requirement: Static UI strings exist for English

The repository SHALL contain `i18n/locales/en.json` with the same key set as `i18n/locales/es.json` for all keys used by the shipped UI, with values translated to English.

#### Scenario: Key parity with Spanish locale file

- **WHEN** a maintainer compares `es.json` and `en.json`
- **THEN** every key in `es.json` SHALL exist in `en.json` with a non-empty string value

### Requirement: Database-backed names resolve in English when locale is English

Server-side handlers that return dictionary node names (`DICCIONARIO`) or indicator metadata names (`METADATA`) for ODS, Agenda Urbana, or shared agenda flows SHALL, when the request language is English, read from `DICCIONARIO_EN` and `METADATA_EN` and SHALL fall back to existing Catalan/Spanish columns when English values are null or missing.

#### Scenario: ODS indicadores hierarchy uses English dictionary names

- **WHEN** a client calls the ODS indicadores API with `lang=en` (or equivalent agreed parameter) and the database contains a row in `DICCIONARIO_EN` for a given `id_dict`
- **THEN** the returned `nombre` for that node SHALL equal the English `nombre` from `DICCIONARIO_EN`

#### Scenario: Fallback when English row is absent

- **WHEN** the client uses `lang=en` and `DICCIONARIO_EN` has no row (or null `nombre`) for a given `id_dict` but Catalan or Spanish has a value
- **THEN** the API SHALL return a non-null display name using the documented `COALESCE` fallback order

#### Scenario: Indicator metadata name uses METADATA_EN

- **WHEN** the client uses `lang=en` and `METADATA_EN` has a `nombre` for the indicator id
- **THEN** API payloads that expose indicator titles SHALL use that English `nombre` in preference to Spanish-only fields

### Requirement: Client requests include English language for API calls

Vue pages, composables, or middleware that fetch municipio or agenda data with a `lang` (or equivalent) parameter SHALL pass `en` when the user’s active i18n locale is `en`, so server SQL and static messages stay aligned.

#### Scenario: Locale switch updates data fetches

- **WHEN** the user switches the UI language to English and navigates to a municipio ODS or AU view that loads hierarchy or indicator data
- **THEN** subsequent data requests SHALL use the English language parameter expected by the server API contract
