## Context

`IndicadoresListView.vue` builds the “Indicador” column with `indicadorCell()`, which renders the indicator title plus a second line built as `` `${item.metaCodigo} · ${item.metaNombre}` ``. That pattern is correct for data (meta code + meta name) but is visually heavy; clients asked for the code alone in the list row and the full line only while the pointer hovers the subtitle.

The same component is used from municipio ODS and AU flows (`pages/municipios/ods/[ine].vue`, `pages/municipios/au/[ine].vue`), so one change covers both.

## Goals / Non-Goals

**Goals:**

- Show only `metaCodigo` (e.g. `4.1`) as the visible subtitle under the indicator name when not hovering.
- On pointer hover over that subtitle, the line SHALL read exactly like the legacy subtitle: `` `${metaCodigo} · ${metaNombre}` `` inline (same styling intent as today).
- Implementation uses CSS visibility (e.g. Tailwind `group` / `group-hover` swapping or showing hidden segments)—no `UTooltip`, popover, or native `title` for this.

**Non-Goals:**

- Changing CSV/SQLite data, meta taxonomy, or section headers (`taxonomyConfig.sectionLabel` for ODS/AU blocks).
- Altering comparison columns, trends, or panel content.
- Dedicated keyboard affordance unless added later as a follow-up (pointer hover is the primary interaction).

## Decisions

1. **Interaction model**: Inline reveal with CSS only (`group` + `group-hover` on the subtitle wrapper). Two text modes: compact (code only when code exists) vs full legacy string on hover, implemented without duplicating semantics in a second UI layer.

2. **Empty code**: If `metaCodigo` is missing or empty, show truncated or full `metaNombre` as the default line; on hover, expand to the full name if truncation was used.

3. **No portaled UI**: Excludes Nuxt UI `UTooltip`, `UPopover`, `title` attribute as the primary mechanism, and any floating portal for this label.

## Risks / Trade-offs

- **[Risk] Touch devices without hover** → Users may only see the compact code; **Mitigation**: acceptable for v1; follow-up could tap-to-toggle if required.
- **[Risk] Row `hover` styles vs subtitle `hover`** → Subtitle uses its own `group` so it does not depend on `tr:hover` alone; **Mitigation**: nest `group/meta` on the subtitle wrapper only.

## Migration Plan

Not applicable (UI-only). Deploy with frontend release; rollback by reverting the component change.

## Open Questions

- None for v1; confirm with stakeholders if AU taxonomy should prefix text (e.g. “OE” vs “ODS”)—current data line does not include that prefix.
