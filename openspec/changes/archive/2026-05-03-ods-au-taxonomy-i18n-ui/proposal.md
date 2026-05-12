## Why

Some UI surfaces still show ODS and Agenda Metropolitana (AU) objective titles from bundled taxonomy config (`name` fields) or hardcoded prefixes, while the rest of the app uses i18n keys (`ods_N_name`, `au_N_name`). That breaks Catalan/Spanish consistency and duplicates the “source of truth” for human-readable taxonomy labels. Icon `alt` text must match the same localized strings used for visible names and ARIA, so assistive technology stays aligned with what sighted users see.

## What Changes

- **`OdsSelector.vue` (and any similar taxonomy icon strips touched in the same pass):** User-visible captions, button `aria-label`, and `<img alt>` SHALL use `useI18n().t()` with `ods_{n}_name` for ODS mode and `au_{n}_name` for agenda mode — not raw `item.name` / `displayedItem.name` from config for display or accessibility strings.
- **Prefixes** like `ODS n:` / agenda equivalents SHALL come from i18n message keys (or composed only from translated fragments), not hardcoded Spanish/English literals in templates.
- **No change** to SQLite/API indicator translation rules; this scope is **taxonomy titles only** in the Nuxt app.

## Capabilities

### New Capabilities

- `taxonomy-display-i18n`: Requirements for where ODS and AU (Tarragona líneas) display names and related `img` `alt` / radiogroup semantics MUST be resolved via i18n keys, consistent with components such as `OdsIndicadoresNavStrip` and `AppHeaderPrimaryNav`.

### Modified Capabilities

- _(none)_ — existing specs reference taxonomy config for colors/ids/assets; this change adds a parallel UI contract without altering data pipeline or API behavior.

## Impact

- **Repository:** `diputacion_tarragona` — primarily `app/components/OdsSelector.vue`; may add or adjust keys in `i18n/locales/ca.json` and `i18n/locales/es.json` (caption/alt/prefix messages if not expressible with existing keys alone).
- **Repository:** `diputacion_tarragona_data` — OpenSpec artifacts only unless a follow-up change ties taxonomy export to i18n (out of scope here).
- **Dependencies:** None on backend or data rebuild; purely frontend i18n usage.
