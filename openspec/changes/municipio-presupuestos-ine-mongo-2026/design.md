## Context

`diputacion_tarragona` already identifies municipio pages by `codigo_ine`, sourced from SQLite `REGIONES` through `nuxt-prepare`. The presupuestos tab is the exception: it currently receives `id_presupuestos`, merged from `app/assets/data/municipios_tarragona.csv`, and queries Mongo with a legacy internal id against the previous wide-row schema.

The 2026 global presupuestos database used by `presupuestos-ods` on branch `db2026` now identifies all Spanish municipalities by `codigo_ine` and stores both `presupuestos` and `liquidaciones` as long-table rows. Each row carries at least `codigo_ine`, `anyo`, `grupo_programa`, `cap_eco`, and `importe_total`. The existing Tarragona charts and tables can remain mostly unchanged if the Mongo query pivots that long-table format back into the existing budget row shape.

The Tarragona site is not in production, so no compatibility layer is needed for legacy presupuestos ids or URLs.

## Goals / Non-Goals

**Goals:**

- Use INE code as the only municipio identifier for the presupuestos tab.
- Query the same 2026 global Mongo data source used by `presupuestos-ods` `db2026`.
- Support both `presupuestos` and `liquidaciones` collections with the same aggregation shape.
- Preserve the existing visualization-facing budget summary shape so charts, tables, and downloads need minimal adaptation.
- Remove `id_presupuestos` from Nuxt prepare catalog data, component props, and static CSV merge logic.
- Let available years be data-driven; no year list should be hardcoded for the new 2026 data.

**Non-Goals:**

- Supporting the old Mongo schema or legacy presupuestos internal ids.
- Porting `presupuestos-ods` route redirection helpers, inventario/provincias/ccaa lookup, or standalone app browsing features.
- Redesigning the presupuestos visualizations.
- Adding presupuestos data to the municipio static ODS/AU CSV export.

## Decisions

### INE-only data contract

The municipio ODS page SHALL pass its existing `[ine]` route/catalog identifier into the presupuestos tab. The presupuestos component should accept a `codigoIne` prop, normalize it with `Number.parseInt`, and use that value in the Mongo pipeline.

Alternatives considered:

- Keep `id_presupuestos` as a fallback. Rejected because the Tarragona project is not in production and the new global database aligns directly with INE.
- Import `presupuestos-ods` inventario helpers. Rejected because Tarragona already has an authoritative municipio catalog from SQLite.

### Mongo aggregation as schema adapter

`app/lib/presupuestos/utils/atlasQueries.ts` should expose a `getPipelineForCodigoIne(codigoIne, mode)` helper. The helper selects `presupuestos` or `liquidaciones`, filters by `codigo_ine`, groups by `{ anyo, grupo_programa }`, sums `importe_total` by `cap_eco`, projects the same fields used downstream (`year`, `cdfgr`, chapter totals, `TOTAL`, `id`), and sorts by year/program.

This keeps the rest of the client flow close to the current implementation while isolating the 2026 schema knowledge in one place.

Alternatives considered:

- Rewrite all budget processing to consume long-table rows directly. Rejected as higher blast radius for no immediate UI benefit.
- Perform pivoting in the component after fetching raw rows. Rejected because aggregation in Mongo reduces payload size and keeps the component focused on presentation/data summaries.

### Data processing updates

`csvToJs` must compute total budget from level-1 rows when present, but fall back to the sum of all program rows when the new `grupo_programa` data has no level-1 rows. Program-to-ODS and program-to-meta assignment must compare mapping keys and program codes as strings so CSV parser numeric/string inference does not drop matches.

### Remove old catalog merge

`server.prepare.ts` should stop reading `app/assets/data/municipios_tarragona.csv` solely to attach `id_presupuestos`. `MunicipioCatalogRow` should no longer expose `id_presupuestos`. If no other first-party code needs that CSV, it may be removed separately as part of cleanup.

### Runtime configuration

The app should use the same Atlas runtime configuration pattern and values as the `presupuestos-ods` `db2026` setup. The implementation should verify `nuxt.config.ts` runtime config names and the fetch/proxy path used by the current presupuestos tab before changing environment variables.

## Risks / Trade-offs

- [Risk] Mongo `codigo_ine` is numeric while Tarragona route/catalog values are strings with possible leading zeros. → Mitigation: define a single normalization point with `Number.parseInt(ine, 10)` before building the pipeline.
- [Risk] The aggregation projection names may not exactly match existing `DataRow` keys. → Mitigation: align the pipeline projection and `DataRow` type together, and verify one real municipio returns non-empty ODS summaries.
- [Risk] Removing `id_presupuestos` may break unnoticed references outside the main ODS page. → Mitigation: search the app for `id_presupuestos` and `getPipelineForId` during implementation and remove/update all first-party references.
- [Risk] New year data may expose chart assumptions about fixed year sets or ordering. → Mitigation: keep Mongo sort deterministic by `{ year, cdfgr }` and verify the existing year-driven charts render every returned year.

## Migration Plan

1. Update Mongo query helper and data-processing functions.
2. Change the municipio ODS page and presupuestos component prop contract from `idPresupuestos` to `codigoIne`.
3. Remove `id_presupuestos` from prepare catalog type and build-time merge logic.
4. Align runtime config with the `presupuestos-ods` `db2026` Atlas source.
5. Run type/lint checks and manually verify at least one Tarragona municipio with both presupuestos and liquidaciones.

Rollback is a normal git revert because the site is not in production and no persisted user data or public compatibility contract is affected.

## Open Questions

- Confirm the exact Atlas environment values to use in local and deployment environments.
- Confirm whether `app/assets/data/municipios_tarragona.csv` has any remaining purpose after `id_presupuestos` is removed.
