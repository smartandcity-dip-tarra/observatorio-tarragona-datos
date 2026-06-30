## Context

`BeeswarmChart` renders municipio dots from `datapoints` and optionally draws vertical `referenceLines` that share the x-scale, do not participate in the force layout, and support a hover chip (`showMetropolitanHoverLabel` → i18n `area_metropolitana_de_tarragona`). `OdsGoalIndicatorBeeswarm` already fetches `/api/indicadores/valores` with `latest: true` and builds `datapoints` from rows (optionally filtered by `ineAllowlist`). Those rows include the aggregate INE **`43`** when the backend returns it.

## Goals / Non-Goals

**Goals:**

- For each gallery card, compute reference line(s) from the **same** `rows` payload used for dots, so the guide matches the indicator and period without extra requests.
- Match established UX: label from `nombreByIne` when available, stroke colour from the ODS goal colour (`odsColor` prop), metropolitan hover flag `true` for INE `43` (same pattern as `app/pages/index.vue` and AUE beeswarm).

**Non-Goals:**

- Changing which INE counts as aggregate (still `43` / `isMetropolitanAggregateIne`).
- Adding reference lines to other pages or to municipio-level routes unless explicitly requested later.
- Batch API or server changes.

## Decisions

1. **Compute reference lines inside `OdsGoalIndicatorBeeswarm`**  
   *Rationale:* Each `v-for` instance already owns `indicatorId` and `rows`; deriving one line from `rows.find(isMetropolitanAggregateIne)` keeps the parent `au/[objetivo].vue` template unchanged and avoids prop drilling from a page that does not re-fetch per-indicator series.

2. **Use `isMetropolitanAggregateIne(row.codigo_ine)`**  
   *Rationale:* Single source of truth with `METROPOLITAN_AGGREGATE_INE`; resilient if string normalisation ever changes.

3. **Empty array when no valid aggregate**  
   *Rationale:* `BeeswarmChart` defaults `referenceLines` to `[]`; no line when data missing, filtered out by allowlist, or null `valor`.

4. **Import `BeeswarmReferenceLine` type from chart module**  
   *Rationale:* Same exported type as other pages; keeps contract aligned.

*Alternative considered:* Parent passes `referenceLines` per `ind.id_indicador` — rejected as redundant fetches or duplicate logic unless a shared store is introduced.

## Risks / Trade-offs

- **[Risk]** Row `43` absent for some indicators → no line; acceptable parity with map layers when aggregate missing.  
  **Mitigation:** Document in spec; no fake zero line.

- **[Risk]** `ineAllowlist` filters dots but aggregate row might still exist in `rows` — reference uses full `rows`, which is correct (aggregate is not a municipio dot).  
  **Mitigation:** Derive reference from unfiltered `rows.value` (before allowlist filter), same as finding aggregate in full dataset.

## Migration Plan

Deploy with app only; no DB migration. Rollback: revert component change.

## Open Questions

None for initial implementation; confirm visually on ODS goal page with an indicator that includes INE `43` in API response.
