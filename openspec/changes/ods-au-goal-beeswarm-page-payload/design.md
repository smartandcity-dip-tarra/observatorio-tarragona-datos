## Context

`OdsGoalIndicatorBeeswarm.vue` uses `useFetch` against `GET /api/indicadores/valores` with `indicator_id` and `latest=true` for every indicator on ODS and AU goal pages. Those pages are prerendered (`routeRules` + `nitro.prerender.routes`), but per-component fetches multiply work at crawl time and risk hydration refetch patterns. Municipio ODS pages already use page-level `useAsyncData` for series data tied to the prerender payload.

## Goals / Non-Goals

**Goals:**

- One `useAsyncData` (or equivalent) per goal page that loads all beeswarm rows needed for every indicator on that page, with a key scoped by route params and locale.
- Serialize that data into the Nuxt payload during prerender so static visits do not hit the API/DB for gallery valores.
- Keep `OdsGoalIndicatorBeeswarm` reusable by passing rows via props; internal fetch only when props omit data (optional) or always require rows from parent for these pages.

**Non-Goals:**

- New batched SQL/API endpoint (optional future optimization).
- Changing beeswarm chart rendering or map behavior on the same pages.

## Decisions

1. **Page-level `useAsyncData` with `Promise.all` over existing endpoint**  
   Rationale: No server change; same JSON shape as today; straightforward grouping by `id_indicador` in a computed map. Alternatives: new `/api/.../batch` (fewer HTTP hops but requires server work).

2. **Pass `rows` (or `valorRows`) into `OdsGoalIndicatorBeeswarm`**  
   Rationale: Child stays dumb about Nuxt data layer; props mirror what `useFetch` returned. Alternative: inject payload key (more magic).

3. **Stable asyncData key**  
   Include `objetivo` (or AU analogue) and `locale` in the key so i18n-prefixed prerenders get distinct payloads.

4. **Loading / error**  
   Page owns pending/error once; charts either receive empty arrays and show empty state, or page shows a single skeleton section—prefer matching current skeleton-per-chart vs one block (minimal UX change: pass `pending` prop or use page-level v-if on the grid).

## Risks / Trade-offs

- **[Risk] Build time still runs N DB queries** if implementation uses N `$fetch` calls inside one handler → Mitigation: acceptable for this change; document optional batch API later.
- **[Risk] Payload size** → Mitigation: same total bytes as before; gzip-friendly.
- **[Risk] AU page may duplicate logic** → Mitigation: shared composable optional if duplication exceeds ~20 lines; otherwise mirror ODS page pattern.

## Migration Plan

Deploy as normal static build; no data migration. Rollback: revert component and pages.

## Open Questions

- None for initial scope.
