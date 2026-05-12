## 1. Add Nuxt Prepare

- [x] 1.1 Add the `nuxt-prepare` dependency to `diputacion_tarragona` and register the module in `nuxt.config.ts` (see [Nuxt Prepare](https://nuxt-prepare.byjohann.dev)).

- [x] 1.2 Add a `defineNuxtPrepareHandler` (or project-default path from module docs) that opens `server/assets/dbfile/diputacion_tarragona.db` with `better-sqlite3`, runs `SELECT * FROM REGIONES` (or column list matching `Municipio`), orders by `codigo_ine`, and returns typed prepare state for `#nuxt-prepare`. (`server.prepare.ts` also merges `id_presupuestos` from `municipios_tarragona.csv` because that column is not in REGIONES.)

- [x] 1.3 Verify `nuxt prepare` and `nuxt build` succeed locally with the DB present; ensure clear `throw` if the file is missing.

## 2. Replace CSV consumers

- [x] 2.1 Update `app/pages/municipios/ods/[ine].vue` to use the prepare catalog instead of `~/assets/data/municipios_tarragona.csv` (lookup by `codigo_ine` / route param).

- [x] 2.2 Update `app/pages/municipios/au/[ine].vue` the same way.

- [x] 2.3 Grep the repo for `municipios_tarragona.csv` and update any remaining first-party references (tests, composables, comments).

## 3. Optional: reduce duplicate list fetches

- [x] 3.1 (Optional) Refactor `MunicipiosPickerModal` and/or `useFetch('/api/municipios/list')` call sites to use the prepare catalog so the static list is not re-requested at runtime.

## 4. Cleanup and verification

- [x] 4.1 Remove `app/assets/data/municipios_tarragona.csv` when unused; adjust `diputacion_tarragona_data` scripts or docs that copy that path if any. **Deferred:** CSV remains as **build-only** input for `id_presupuestos` merge until REGIONES includes that column.

- [x] 4.2 Run `nuxt typecheck` / project tests / smoke test municipio routes for ODS and AU. (`pnpm run build` succeeded.)
