## 1. Download pipeline

- [x] 1.1 Remove `regiones_cat` entry and its comment from `SHEETS` in `pullAndBuild/download_and_build.py`

## 2. Documentation and comments

- [x] 2.1 Update comment in `transform/src/parse/regiones.ts` — note i18n-only labels, no `regiones_cat.csv`
- [x] 2.2 Update `README.md` — remove `regiones_cat.csv` download mention; state frontend i18n handles `id_especial2`

## 3. Cleanup

- [x] 3.1 Delete `dataset/regiones_cat.csv`
- [x] 3.2 Delete `diputacion_tarragona/test/dataset/regiones_cat.csv`

## 4. Verification

- [x] 4.1 Run `python pullAndBuild/download_and_build.py` and confirm no `regiones_cat` warning
- [x] 4.2 Run `pnpm run check:csv` from `transform/` and confirm all checks pass
