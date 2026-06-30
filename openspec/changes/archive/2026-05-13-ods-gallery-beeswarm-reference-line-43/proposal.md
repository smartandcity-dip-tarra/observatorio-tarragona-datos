## Why

`BeeswarmChart` already supports optional `referenceLines` (vertical guides on the value axis). The AUE goal page and home map use this to mark the metropolitan aggregate (**código INE `43`**). The ODS goal page’s per-indicator gallery (`OdsGoalIndicatorBeeswarm`) renders the same chart type but does not pass a reference line, so users cannot compare municipios to that aggregate **per indicator** as they can elsewhere.

## What Changes

- Extend `OdsGoalIndicatorBeeswarm` so each indicator’s beeswarm derives **at most one** reference line from the latest-value row whose INE identifies the metropolitan aggregate (`43`), using the same labelling and hover behaviour as existing call sites (`showMetropolitanHoverLabel`, ODS goal colour).
- Pass `referenceLines` through to `BeeswarmChart` when a finite value exists for that indicator’s fetched series; omit or pass empty when the aggregate row is missing or null.
- No API contract changes; data already returned by `/api/indicadores/valores` with `latest: true`.

## Capabilities

### New Capabilities

- `ods-goal-indicator-beeswarm-reference-line`: Per-indicator ODS goal gallery beeswarms SHALL show a vertical reference guide at the metropolitan aggregate (`43`) value when present, consistent with `BeeswarmChart` reference-line behaviour and existing AU/index usage.

### Modified Capabilities

- (none — root `openspec/specs/` has no promoted specs; chart contract unchanged.)

## Impact

- **App**: `app/components/ods/OdsGoalIndicatorBeeswarm.vue` (computed `referenceLines`, template prop to `BeeswarmChart`).
- **Types**: Reuse `BeeswarmReferenceLine` from `BeeswarmChart.vue` (already exported).
- **Utils**: Reuse `isMetropolitanAggregateIne` (or `METROPOLITAN_AGGREGATE_INE`) for INE `43` matching.
