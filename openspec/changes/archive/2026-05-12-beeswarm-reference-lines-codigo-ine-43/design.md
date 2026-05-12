## Context

- `METROPOLITAN_AGGREGATE_INE` (`43`) is a synthetic region row used in Agenda Metropolitana de Tarragona flows; it is not a municipio dot in the distribution sense.
- `BeeswarmChart.vue` today maps every `datapoint` to a force node; auto x-domain uses dot `valor` only (see `paddedDataDomain` and related specs).
- Homepage AU beeswarm filters rows with `aue.has(codigo_ine)`; if `43` is in that set and has a value, it currently becomes a dot like any other INE.

## Goals / Non-Goals

**Goals:**

- Add a generic **`referenceLines`** prop so parents can draw one or more vertical guides (thresholds, aggregates) on the same linear x-scale as dots.
- Ensure **auto domain** expands to keep reference values visible when `domain` is omitted.
- On **home AU beeswarm**, split INE `43` out of `datapoints` and pass it as a reference line when a numeric value exists; label should match existing naming (catalog `nombre` for `43` or i18n key if already used elsewhere).
- Export a small **TypeScript type** for reference line items next to `BeeswarmDatapoint` for reuse.

**Non-Goals:**

- Changing choropleth map treatment of INE `43` (only beeswarm presentation).
- Making reference lines emit `selectMunicipio` or participate in hover sync with the map (lines are visual reference only unless a future change defines interaction).
- ODS goal pages or indicator gallery unless those code paths already feed `43` into a beeswarm (implementation task will grep and align).

## Decisions

1. **`value` type is `number`, not `string`**  
   Horizontal position must be numeric for `scaleLinear`. Display formatting belongs in `label` (and optional future `valueLabel`). Parents that parse strings SHALL coerce before passing.

2. **Shape: `{ label: string; value: number; color?: string }`**  
   Matches the client sketch with a corrected `value` type. Optional `color` overrides stroke for that line; default stroke comes from theme-neutral or `color` prop — pick one consistent rule in implementation (e.g. default `currentColor` / muted neutral).

3. **Simulation excludes reference values**  
   Reference lines are drawn in a separate SVG layer after scale computation; they never enter `forceSimulation` nodes.

4. **Domain pooling**  
   For auto-domain, compute `lo = min(datapoint valores ∪ reference values)` and `hi = max(...)` then apply the same margin ratio as today (`beeswarm-auto-domain-padding`). Degenerate cases (no dots, only lines, etc.) SHALL follow the same stability rules as single-value dots.

5. **Stacking multiple lines**  
   If two lines share nearly the same `value`, they MAY overlap visually; no obligation to offset (future enhancement). Document as acceptable trade-off.

## Risks / Trade-offs

- **[Risk] Explicit `domain` clips a reference line** → **Mitigation**: Document that parents passing `domain` must ensure the interval covers reference values; chart does not auto-expand explicit domain.

- **[Risk] Reference line obscured behind dots** → **Mitigation**: Render lines in a dedicated group **under** dots or **over** dots per visual preference; prefer **under** dots so hover tooltips on dots stay primary, with a slightly stronger stroke or dash if contrast is low.

- **[Risk] AU home forgets to filter `43` from secondary sizing / highlights** → **Mitigation**: Filter at the same computed pipeline as `datapoints`; keep `mapValues` / map layer behaviour unchanged in this change.

## Migration Plan

- Ship UI + spec deltas together; no data migration.
- Rollback: remove prop and restore single-array feeding `43` as a dot (undesired UX).

## Open Questions

- None blocking: confirm no other page passes `43` into `BeeswarmChart` besides home AU (tasks include audit).
