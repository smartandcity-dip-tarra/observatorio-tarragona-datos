## Context

The `diputacion_tarragona_data` pipeline already downloads `metadatos_agendas_en.csv`, `diccionario_en.csv`, and `proyectos.csv`, and loads Catalan sidecars into `METADATA_CAT` / `DICCIONARIO_CAT`. `REGIONES` is filled from `regiones.csv` only; `regiones_cat.csv` is intentionally unused. The Nuxt app will gain English APIs and a proyectos endpoint in separate work; this change only evolves the **SQLite artifact** and transform.

## Goals / Non-Goals

**Goals:**

- Add `METADATA_EN` and `DICCIONARIO_EN` with the same behavioural contract as the Catalan tables (sparse `unidad`, warn-only integrity, `clase`/`formula` from EN files not written to structural columns).
- Add a `PROYECTOS` table populated from `dataset/proyectos.csv` so the DB is the single source of truth for agenda urban project rows.
- Replace raw Spanish `id_especial2` text in `REGIONES` with a **stable slug** computed from that text so the frontend can map `slug → {es, ca, en}` via i18n or a small map without `regiones_en.csv`.

**Non-Goals:**

- HTTP routes, Nuxt composables, or replacing `~/assets/data/projects.csv` in the app (separate spec).
- Ingesting `regiones_cat.csv` or introducing `regiones_en.csv`.
- Changing how `METADATA.direction` is derived (still from **Spanish** `formula` only).

## Decisions

1. **Slug algorithm for `id_especial2`**  
   Implement a single shared pure function in the transform package, documented in code and spec, with this normative behaviour:
   - Trim; treat empty as `NULL` (unchanged).
   - Unicode NFKD normalize, strip combining marks (diacritics) to ASCII letters.
   - Lowercase `[a-z0-9]+` tokens; replace any run of non-alphanumeric characters with a single `-`; collapse repeated `-`; trim leading/trailing `-`.
   - If the result is empty after normalization, store `NULL` and emit a `[regiones] WARN` with `codigo_ine`.
   - **Collision policy:** if two distinct source strings yield the same slug, the build SHALL **fail** with a non-zero exit and print both originals and the slug (dataset is small enough to fix upstream or add a disambiguator).

2. **English mirrors Catalan, not Spanish**  
   `METADATA_EN` / `DICCIONARIO_EN` follow the same sparse-override and drop-unknown-id rules as `*_CAT`, with log prefix `[english]` so operators can grep separately from `[catalan]`.

3. **`PROYECTOS` schema**  
   Columns: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion` — all `TEXT` except optional `INTEGER` for `linea` if the parser normalizes; prefer all-`TEXT` to avoid cast surprises from CSV. Primary key: `codigo` (values like `1.1.1` are unique in the source). If a duplicate `codigo` appears, fail the build.

4. **Where slug runs**  
   Apply slug in **transform** after `parseRegiones` so parsers stay a thin CSV→record layer; `loader` receives already-slugged `id_especial2`.

## Risks / Trade-offs

- **[Risk] Breaking change for `id_especial2`** → Any consumer showing the column verbatim will show slugs. **Mitigation:** document in proposal; follow-up in app repo to use i18n keys matching slugs (or `COALESCE` display map).
- **[Risk] Slug collisions on future data** → **Mitigation:** hard-fail with clear message; forces explicit fix in source or algorithm bump.
- **[Risk] EN CSV drift from ES** → Same as Catalan: warn and drop orphans; API uses `COALESCE` chain when implemented later.

## Migration Plan

1. Land transform + schema changes; rebuild `diputacion_tarragona.db` in the data repo release process.
2. Ship updated DB to the app repo / Netlify hook per existing automate-data-release flow.
3. App repo: in the spec that adds endpoints, switch project UI to API and add i18n entries for `id_especial2` slugs before or in sync with DB rollout.

## Open Questions

- Whether `linea` in `proyectos.csv` should be stored as `INTEGER` vs `TEXT` (default **TEXT** for simplicity unless analytics need numeric sort).
- Exact set of formula sentinels for **English** `metadatos_agendas_en.formula` validation (if any) — mirror Catalan validation list extended with EN strings, or validate only against semantic direction already set from ES; **default:** validate EN formula text against EN equivalents of the same sentinel set where non-empty, without storing EN `formula` in SQLite.
