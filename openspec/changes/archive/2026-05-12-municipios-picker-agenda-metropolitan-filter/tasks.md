## 1. Data wiring in `MunicipiosPickerModal`

- [x] 1.1 Read `useVisualizationStore()` and branch list source: ODS → existing `municipios_tarragona.csv` import; AU → `useFetch` to `/api/municipios/list` with a stable key (e.g. `municipios-picker-regiones`), typed with `Municipio` (or minimal `{ codigo_ine, nombre }`).

- [x] 1.2 Add loading and error UI for the AU path so the modal does not render incomplete or misleading links while fetch is pending or failed.

## 2. List computation and navigation

- [x] 2.1 Refactor `filteredMunicipios` / `groupedByLetter` to use a single `baseList` ref/computed that switches between CSV rows and API rows by mode, preserving current search and letter grouping.

- [x] 2.2 Make `NuxtLink` and `goToMunicipio` use mode-specific paths: `localePath(\`/municipios/ods/${ine}\`)` vs `localePath(\`/municipios/au/${ine}\`)` per store mode (not hardcoded ODS).

## 3. Verification

- [x] 3.1 Manually test: AU mode + open picker → only metropolitan municipios; pick one → lands on `/municipios/au/:ine` without 404 for valid INEs.

- [x] 3.2 Manually test: ODS mode → full list unchanged; navigation to `/municipios/ods/:ine`.

- [x] 3.3 Run app lint/typecheck for touched files if the project has a standard check.
