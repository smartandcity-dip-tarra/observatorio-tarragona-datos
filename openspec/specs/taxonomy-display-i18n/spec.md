# taxonomy-display-i18n

## Purpose

Normative UI rules for ODS and Tarragona Agenda (AU) **taxonomy titles** in shared selectors: all user-visible names, ARIA labels, and icon alternative text MUST resolve through the same i18n keys used elsewhere in the app, not through `name` fields from bundled taxonomy config for those surfaces.

## Requirements

### Requirement: Taxonomy strip uses i18n for ODS and AU titles

In `OdsSelector` (ODS and agenda taxonomies), the application SHALL derive every user-visible objective title and every accessibility string that includes the objective title from `useI18n().t()` using keys `ods_{n}_name` for ODS (`n` in `1..17`) and `au_{n}_name` for Tarragona agenda líneas (`n` matching the strip’s objective ids). The application SHALL NOT use `item.name` or `displayedItem.name` from `ods_list` or `objetivos_agenda` for captions, button labels, or `aria-label` content.

#### Scenario: Catalan locale shows Catalan ODS caption

- **WHEN** the active locale is Catalan and the user views the ODS strip with objective `k` selected or hovered
- **THEN** the caption below the strip SHALL include the text produced by `t(\`ods_${k}_name\`)` (via an i18n message that composes number and title as needed)
- **AND** that caption SHALL NOT display the raw `name` field from `ods_list` for objective `k`

#### Scenario: Spanish locale shows Spanish AU aria and caption

- **WHEN** the active locale is Spanish and the user focuses an agenda strip button for línea `m`
- **THEN** the button’s `aria-label` SHALL incorporate the text produced by `t(\`au_${m}_name\`)`
- **AND** the caption under the strip SHALL incorporate the same `t(\`au_${m}_name\`)` for the active/hovered línea, not the raw `name` from `objetivos_agenda`

### Requirement: Icon alt text matches i18n taxonomy title

For each objective icon `<img>` in `OdsSelector`, the `alt` attribute SHALL be set to the exact same localized objective title string used for that objective’s `t(\`ods_${n}_name\`)` or `t(\`au_${n}_name\`)` in the same render (same `n` and taxonomy). The application SHALL NOT use hardcoded literals such as `ODS ${n}` or `OE ${n}` as the sole or primary alternative text.

#### Scenario: Screen reader hears same title as i18n name key

- **WHEN** assistive technology reads the alternative text for the ODS icon for objective `5` in any supported locale
- **THEN** the `alt` value SHALL equal `t('ods_5_name')` for that locale
- **AND** it SHALL NOT equal a fixed-language string that bypasses i18n

### Requirement: ODS branch parity with agenda for composed messages

For the ODS taxonomy, prefixes and patterns (for example the equivalent of “ODS {n}: …” in the active locale) SHALL come from i18n message keys in `ca.json` and `es.json`, in the same way the agenda branch uses `home.agendaObjectiveCaption` and related keys — not hardcoded template literals in the Vue template.

#### Scenario: No raw Spanish template for ODS aria

- **WHEN** a developer inspects `OdsSelector.vue` for the ODS taxonomy
- **THEN** there SHALL be no `` `ODS ${item.num}: ${item.name}` `` (or language-specific equivalent) used for `aria-label` or visible caption
- **AND** composed copy SHALL use `t(...)` with parameters including the localized name from `ods_{n}_name`
