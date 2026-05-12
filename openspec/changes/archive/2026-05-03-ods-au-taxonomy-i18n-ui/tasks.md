## 1. i18n messages (Nuxt app)

- [x] 1.1 Add `home.odsObjectiveCaption` and `home.odsObjectiveButtonAria` (or equivalent names) to `i18n/locales/ca.json` and `i18n/locales/es.json`, mirroring the structure of `home.agendaObjectiveCaption` / `home.agendaObjectiveButtonAria` but with the ODS-specific prefix wording for each locale.
- [x] 1.2 Confirm `ods_1_name`…`ods_17_name` and `au_1_name`…`au_6_name` exist for both locales (already present — no action unless a key is missing for a strip id).

## 2. OdsSelector.vue

- [x] 2.1 Introduce a small helper or computed (e.g. `taxonomyTitle(n)`) that returns `t(\`ods_${n}_name\`)` or `t(\`au_${n}_name\`)` based on `taxonomy`, and use it everywhere the strip needs the objective title string.
- [x] 2.2 Replace agenda branch interpolations: pass `t(\`au_${item.num}_name\`)` (via helper) into `home.agendaObjectiveButtonAria` and `home.agendaObjectiveCaption` instead of `item.name` / `displayedItem.name`.
- [x] 2.3 Replace ODS branch: use new i18n keys for caption and `aria-label`, with `name` from the helper; remove template literals that embed `item.name` from config.
- [x] 2.4 Set each `<img>` `:alt` to the same helper output for that button’s `n` and taxonomy (no `ODS ${n}` / `OE ${n}` literals).

## 3. Verification

- [x] 3.1 Manually switch locale ca/es on the home view using `OdsSelector` and confirm captions, focused-button `aria-label` (devtools / accessibility tree), and `alt` reflect Catalan/Spanish from i18n, not config Spanish names.
- [x] 3.2 Run the app lint/typecheck if available (`npm run lint` or project equivalent) on touched files.
