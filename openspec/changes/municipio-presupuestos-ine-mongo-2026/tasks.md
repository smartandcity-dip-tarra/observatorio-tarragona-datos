## 1. Mongo Query Contract

- [x] 1.1 Compare `presupuestos-ods` `db2026` Atlas query/runtime config with `diputacion_tarragona` and confirm the target `ATLAS_URI` / `DB_NAME` contract.
- [x] 1.2 Update `app/lib/presupuestos/utils/atlasQueries.ts` to add an INE-based pipeline helper for `presupuestos` and `liquidaciones`.
- [x] 1.3 Ensure the pipeline groups by `{ anyo, grupo_programa }`, pivots `cap_eco` values into chapter totals, computes `TOTAL`, projects the existing `DataRow` shape, and sorts deterministically.
- [x] 1.4 Remove or stop exporting the legacy id-based query helper if no first-party code still needs it.

## 2. INE-only UI Wiring

- [x] 2.1 Change `app/pages/muni/ods/[ine].vue` to pass the current `codigo_ine` to the presupuestos component instead of `id_presupuestos`.
- [x] 2.2 Rename/update the presupuestos component prop from `idPresupuestos` to an INE-specific prop and normalize it before building the Mongo request.
- [x] 2.3 Update `useAsyncData` keys and refresh behavior so switching presupuestos/liquidaciones fetches the correct INE-based data.
- [x] 2.4 Update error/empty-state copy if it refers to missing old presupuestos ids rather than missing Mongo data for an INE.

## 3. Processing and Assignment

- [x] 3.1 Update `csvToJs` so total budget uses level-1 rows when present and falls back to all rows for 2026 `grupo_programa` data.
- [x] 3.2 Update ODS assignment matching to compare mapping program codes and returned program codes as strings.
- [x] 3.3 Check and update meta assignment matching with the same string comparison rule where applicable.
- [x] 3.4 Verify chart/table inputs still include every returned year without hardcoded year assumptions.

## 4. Remove Legacy Catalog Plumbing

- [x] 4.1 Remove `id_presupuestos` from `app/types/municipios.ts`.
- [x] 4.2 Remove the `municipios_tarragona.csv` presupuestos-id merge from `server.prepare.ts`.
- [x] 4.3 Search for `id_presupuestos`, `getPipelineForId`, and `municipios_tarragona.csv`; update or remove all first-party references tied to presupuestos lookup.
- [x] 4.4 Remove `app/assets/data/municipios_tarragona.csv` only if no remaining first-party code needs it.

## 5. Verification

- [x] 5.1 Run type/lint checks for edited Nuxt files.
- [ ] 5.2 Manually verify one Tarragona municipio loads presupuestos data from the 2026 Mongo source.
- [ ] 5.3 Manually verify the same municipio loads liquidaciones data with the same schema path.
- [ ] 5.4 Manually verify the presupuestos views include the new available year when Mongo returns it.
