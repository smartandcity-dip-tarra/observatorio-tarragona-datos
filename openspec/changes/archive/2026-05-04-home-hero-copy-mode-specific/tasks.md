## 1. Locales

- [x] 1.1 Add `home.hero.ods` and `home.hero.au` to `i18n/locales/es.json` with `title`, `description` (two paragraphs in one string with a blank line between them), and optional empty `caption` for each.
- [x] 1.2 Add the same key structure to `i18n/locales/ca.json` with the Catalan strings from the change spec (`home-hero-mode-copy`).
- [x] 1.3 Remove `home.caption`, `home.title`, and `home.description` from both locale files after confirming no other references (grep the app repo).

## 2. Homepage template

- [x] 2.1 In `app/pages/index.vue`, derive a hero key prefix or three computeds from `useVisualizationStore().isAU` mapping to `home.hero.au` vs `home.hero.ods`.
- [x] 2.2 Bind caption with `v-if` only when the resolved caption is non-empty; bind `h1` to `title` and description to `description` with paragraph break preserved (`whitespace-pre-line` or split into two `p` per design).
- [x] 2.3 Manually verify on `/`: toggling ODS ↔ Agenda Urbana updates hero copy immediately without navigation, in both `es` and `ca` locales.

## 3. Spec sync

- [x] 3.1 After implementation, archive or align `openspec/specs/mode-aware-navigation/spec.md` in the main specs tree when running the project’s archive workflow (if required by repo process).
