## Context

`OdsSelector.vue` drives ODS and Agenda (Tarragona) icon strips for the home flow. It already uses i18n for group `aria-label` and for part of the agenda branch, but the ODS branch hardcodes `` `ODS ${item.num}: ${item.name}` `` and the template caption uses `displayedItem.name` from `ods_list` / `objetivos_agenda`. Those `name` fields are Spanish-oriented bundle copy. Elsewhere (`OdsIndicadoresNavStrip`, `AppHeaderPrimaryNav`, ODS pages) the app already uses `t(\`ods_${n}_name\`)` and `t(\`au_${n}_name\`)` from `i18n/locales/{ca,es}.json`.

## Goals / Non-Goals

**Goals:**

- Single user-visible and assistive-technology source for taxonomy titles: i18n keys `ods_1_name`…`ods_17_name` and `au_1_name`…`au_6_name` (for the six Tarragona líneas).
- `<img alt>` on strip icons uses the **same** `t(\`ods_${n}_name\`)` / `t(\`au_${n}_name\`)` string as the objective title used in caption and button `aria-label` (not parallel literals like `ODS N` / `OE N`).
- Optional small composable or local helper in `OdsSelector` to avoid repeating `` `ods_${n}_name` `` / `` `au_${n}_name` `` four times — only if it stays readable.

**Non-Goals:**

- Changing taxonomy CSV/SQLite export or `config.js` generators (colors, ids, asset paths stay as today).
- Adding new locales beyond `ca` / `es`.
- Retrofitting every file in the repo that still mentions `item.name` (can be a follow-up change); this change targets `OdsSelector` as the agreed gap.

## Decisions

1. **Use existing flat keys** (`ods_N_name`, `au_N_name`) rather than new nested JSON — zero data migration, matches `OdsIndicadoresNavStrip`.
2. **Caption format for ODS** — Introduce i18n keys for the line pattern if missing, e.g. `home.odsObjectiveCaption` mirroring `home.agendaObjectiveCaption`, with `{ n, name }` where `name` is **only** from `t(\`ods_${n}_name\`)` passed from script (not from config). Same for agenda: pass `t(\`au_${n}_name\`)` into existing `home.agendaObjectiveCaption` / aria keys instead of `item.name`.
3. **Button `aria-label`** — ODS branch SHALL use the same message shape as agenda (interpolated `n` + localized `name` from keys), either by reusing one generic key with a `{ taxonomy: 'ods' | 'au' }` discriminator or separate keys; prefer **parallel keys** (`home.odsObjectiveButtonAria` / existing agenda key) for simpler translator context.
4. **`img alt`** — Set to the same localized `name` string returned for that `n` (the `t(\`ods_*_name\`)` / `t(\`au_*_name\`)` value). If product later wants “ODS 3: …” inside `alt`, that would be a second composed message; current decision is **alt = full title string from those keys only** to satisfy “same strings” as the title token, avoiding redundant “ODS” prefix in both caption and alt (caption carries the prefix via i18n).

   _Clarification for implementers:_ If captions use a pattern `"{prefix} {n}: {name}"` with all three translated, **alt** SHALL use the **full caption string** or at minimum the **same `{name}` token** from i18n; the spec file spells out SHALL use the same `t()` result for `alt` as for the name interpolation in caption/aria — implementers pick one composable `objectiveTitleI18n(n, kind)` reused everywhere.

## Risks / Trade-offs

- **[Risk] `objetivos_agenda` length vs `au_*` keys** — If strip ever lists ids outside `1..6`, `t()` may miss keys. Mitigation: scope verification to current Tarragona strip; keys already exist for `1..6`.
- **[Risk] Divergence** — Config `name` and i18n could drift for non-UI uses. Mitigation: use config `name` only for non-user-facing debug or drop from strip item shape over time (non-goal for this pass).

## Migration Plan

Deploy with Nuxt app only; no data release. Rollback: revert Vue/i18n commits.

## Open Questions

- None blocking; confirm with design if `alt` should be the **full** caption line vs **title only** — proposal asked for “same strings” as display names; spec locks to reusing the same `t()` helper as caption’s name segment unless PM wants full line duplicated in `alt`.
