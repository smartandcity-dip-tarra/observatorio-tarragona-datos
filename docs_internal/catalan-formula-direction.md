# Catalan translations and `formula → direction`

## Pipeline

- Source CSVs: `dataset/diccionario_cat.csv`, `dataset/metadatos_agendas_cat.csv` (from Google Sheets).
- Parsed in `transform/src/parse/diccionario-cat.ts` and `metadata-cat.ts`.
- Rows land in `DICCIONARIO_CAT` and `METADATA_CAT` via `transform/src/transform/` + `load/loader.ts`.

## Direction enum

- **Mapping module:** `transform/src/transform/direction.ts`
  - `DIRECTION_MAP_ES` / `DIRECTION_MAP_CAT`: sentinel strings → `asc` | `desc`.
  - `mapDirectionEs` fills `METADATA.direction` at transform time; raw Spanish text stays in `METADATA.formula`.
- **Integrity:** `transform/src/integrity/checks/catalan.ts` checks that non-empty ES/CAT formulas are known sentinels (status `warn`, never blocks the build).

## Classification (`clase`)

- Catalan `clase` is never written to `METADATA.tipo`. Semantic comparison uses `semanticClaseKey()` in `transform/src/transform/metadata.ts` so translated labels (e.g. `Agenda 2030 i AUE`) do not trigger false mismatches.
