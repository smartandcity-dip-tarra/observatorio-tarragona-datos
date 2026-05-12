## Why

The dataset now includes English sheets (`metadatos_agendas_en`, `diccionario_en`) and a canonical `proyectos.csv`, while the app still relies on bundled project CSVs. At the same time, `REGIONES.id_especial2` is a small closed vocabulary of Spanish labels that should become stable **machine keys** so the frontend can resolve display strings per locale without maintaining parallel `regiones_*` CSVs.

## What Changes

- **English in SQLite**: Add `METADATA_EN` and `DICCIONARIO_EN` tables and ingest `metadatos_agendas_en.csv` / `diccionario_en.csv` with the same structural rules as Catalan (`METADATA_CAT` / `DICCIONARIO_CAT`): warn-and-continue on gaps, sparse `unidad` override where applicable, `clase` from EN files used only for integrity checks—not for `METADATA.tipo`.
- **`PROYECTOS` table**: Parse `dataset/proyectos.csv` and load into a new standalone table (columns aligned with the CSV: e.g. `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`). **No HTTP endpoint in this change**—that will ship in a separate spec/repo change.
- **`id_especial2` as slug**: When building `REGIONES`, replace the human-readable Spanish value read from `regiones.csv` with a **deterministic slug** derived from that string (Unicode-safe, lowercase, hyphen-separated). **BREAKING** for any consumer that assumed `id_especial2` was display text; clients SHALL treat it as an i18n key or lookup token.
- **Explicitly out of scope**: Ingesting `regiones_cat.csv` or any `regiones_en.csv`; those remain unused for `REGIONES`.

## Capabilities

### New Capabilities

- `english-translations`: English CSV ingestion (`metadatos_agendas_en`, `diccionario_en`) into `METADATA_EN` / `DICCIONARIO_EN`, warn-and-fallback policy mirroring Catalan, log prefix `[english]` for greppable CI output.
- `proyectos-sqlite`: Parse `proyectos.csv`, DDL for `PROYECTOS`, loader population; no API surface in this change.

### Modified Capabilities

- `schema-creation`: Add `METADATA_EN`, `DICCIONARIO_EN`, and `PROYECTOS` DDL; document that `REGIONES.id_especial2` stores a slug key, not display copy.
- `csv-parsing`: Parse EN CSVs (same shapes as CAT parsers); parse `proyectos.csv`; document slug derivation for `id_especial2` after parse or in transform.
- `data-transformation`: Transform/join EN metadata and dictionary like CAT; apply slug function to `id_especial2` before load.
- `catalan-translations`: Narrow or clarify narrative around `id_especial2` / `regiones_cat` so it stays consistent with slug-based `REGIONES` (no new `regiones_cat` ingestion).

## Impact

- **Transform / SQLite** (`diputacion_tarragona_data/transform/`): new parsers, transform branches, `tables.ts`, `loader.ts`, integrity checks (EN alignment + proyectos column contract + optional uniqueness checks on slugs).
- **Downstream DB consumers** (Nuxt server, static viewer, any raw SQL): any code displaying `REGIONES.id_especial2` as human text **must** switch to i18n or a mapping keyed by slug.
- **Data release**: rebuilt `diputacion_tarragona.db` gains new tables and new semantics for `id_especial2`.
