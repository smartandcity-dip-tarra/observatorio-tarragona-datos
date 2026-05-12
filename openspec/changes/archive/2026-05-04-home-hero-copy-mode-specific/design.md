## Context

The home page already reads `visualizationStore.isAU` / `isODS` for APIs, `OdsSelector` taxonomy, map behavior, and links. The hero block is static i18n today. Locales live in `i18n/locales/es.json` and `ca.json` under the `home` group.

## Goals / Non-Goals

**Goals:**

- Bind hero caption, title, and body to the same mode flag the rest of the home page uses (`useVisualizationStore()`), so toggling the header updates copy without navigation.
- Ship stakeholder Spanish plus Catalan for both modes; keep HTML structure (caption `p`, `h1`, description `p`).

**Non-Goals:**

- Changing SEO `useHead` strings unless they already duplicate hero copy (out of scope unless discovered during apply).
- Copy on routes other than `/` (ODS/AU goal hubs keep their own pages).

## Decisions

1. **i18n structure — nested keys by mode**  
   Use `home.hero.ods.{caption,title,description}` and `home.hero.au.{caption,title,description}` (or `aue` if preferred; `au` matches store naming). Rationale: avoids long conditional key strings in the template and keeps both languages parallel.

2. **Template binding**  
   In `index.vue`, use a small `computed` that returns the key prefix (`home.hero.ods` vs `home.hero.au`) from `visualizationStore.isAU`, then `t(\`${prefix}.caption\`)` etc., or three computeds for caption/title/description. Rationale: one source of truth, easy to read.

3. **Remove deprecated keys**  
   Drop `home.caption`, `home.title`, `home.description` from both locale files after migration so missing-key noise does not linger.

**Alternatives considered:** ICU `t()` with a `{mode}` parameter and branching inside one message — rejected: harder to maintain long paragraphs per locale. Single JSON file split by mode at build time — rejected: unnecessary complexity.

## Risks / Trade-offs

- **[Risk] Divergence between spec copy and shipped JSON** → Mitigation: tasks include verifying locale strings match the spec / stakeholder text character-for-character for Spanish.

- **[Risk] SSR hydration** if mode were URL-based on `/` — not the case; store is shared; no extra risk beyond existing home map behavior.

## Migration Plan

Deploy with app only; no data migration. Rollback: revert locale + `index.vue` commit.

## Open Questions

None; Catalan is provided as part of this change.
